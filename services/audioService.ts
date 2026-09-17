/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 音效播放层，走 Web Audio API。
 *
 * 为什么不是 `<audio>`：容器里有两条互相夹击的限制 —— 音频文件类型不允许进包
 * （上传白名单只有 jpg/css/gif/svg/png/js/jpeg/json/html/woff2/webp/woff），
 * 而 `<audio>` 又只允许包内媒体文件、明确禁止 `data:` 媒体源。
 * 两条合起来，`<audio>` 在这个容器里播不出任何东西。
 * 所以音频以 base64 存在 public/audio/sfx-data.js 里（脚本是允许的类型），
 * 这里用 decodeAudioData 在内存里解码 —— 不产生 data: URL、不触发资源加载，
 * 因此不落在 CSP 的任何一条规则上。详见 utils/path.ts 与 scripts/build-audio.mjs。
 */

declare global {
  interface Window {
    __SFX__?: Record<string, string>;
  }
}

// —— 模块级单例 ——
// AudioContext、已解码 buffer、正在播的 source 都只存一份，不放 hook 里。
// 原因有两个：React 严格模式下 effect 会跑两遍，放 hook 里会把 290 KiB 的 base64
// 解码两次；而且每个 hook 实例一个 context 会很快撞上浏览器的 context 数量上限。
// 播放中用 map 按 key 互斥，同时也就限制了并发 source 的数量（最多 6 个），不会越滚越多。
const playing: Record<string, { src: AudioBufferSourceNode; gain: GainNode }> = {};
const buffers: Record<string, AudioBuffer> = {};
const decoding: Record<string, Promise<AudioBuffer | null>> = {};
const warnedMissing = new Set<string>();

let ctx: AudioContext | null = null;
let ctxUnavailable = false;
let unlockAttached = false;

/** 取 AudioContext，失败就返回 null（旧内核可能没有，或上下文数量已满） */
function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  if (ctxUnavailable) return null;
  // Chrome 61 上非前缀的 AudioContext 未必存在，兜一层 webkit 前缀
  const Ctor =
    typeof window !== "undefined"
      ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
  if (!Ctor) {
    ctxUnavailable = true;
    return null;
  }
  try {
    ctx = new Ctor();
  } catch {
    ctxUnavailable = true;
    return null;
  }
  return ctx;
}

/** 自动播放策略：AudioContext 在用户手势之前是 suspended 的，第一次交互时唤醒一次 */
function attachUnlock() {
  if (unlockAttached || typeof document === "undefined") return;
  unlockAttached = true;
  const unlock = () => {
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => { /* 唤醒失败就保持静音 */ });
  };
  ["pointerdown", "touchstart", "mousedown", "keydown"].forEach((type) => {
    document.addEventListener(type, unlock, { passive: true });
  });
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/**
 * 解码并缓存。同一 key 只解码一次，并发调用共享同一个 Promise。
 * 解码失败或音频不在包里都返回 null，不抛错 —— 少一个音效不该让游戏挂掉。
 */
function ensureDecoded(key: string): Promise<AudioBuffer | null> {
  const cached = buffers[key];
  if (cached) return Promise.resolve(cached);
  const inFlight = decoding[key];
  if (inFlight) return inFlight;

  const context = getCtx();
  const base64 = window.__SFX__ && window.__SFX__[key];
  if (!context || !base64) {
    if (!warnedMissing.has(key)) {
      warnedMissing.add(key);
      console.warn(`[audio] 内嵌音频缺失：${key}（检查 media/audio 下的文件并重跑 npm run audio:build）`);
    }
    return Promise.resolve(null);
  }

  const promise = new Promise<AudioBuffer | null>((resolve) => {
    let raw: ArrayBuffer;
    try {
      raw = base64ToArrayBuffer(base64);
    } catch {
      resolve(null);
      return;
    }
    try {
      // 用回调形式而不是 Promise 形式：decodeAudioData 返回 Promise 是后来才加的，
      // 回调形式在旧内核上一定可用。
      context.decodeAudioData(
        raw,
        (decoded) => {
          buffers[key] = decoded;
          resolve(decoded);
        },
        () => resolve(null)
      );
    } catch {
      resolve(null);
    }
  });

  decoding[key] = promise;
  return promise;
}

/** 掐掉某个 key 正在响的那一个（对应原来 `<audio>` 的 currentTime = 0 重启语义） */
function stopKey(key: string) {
  const current = playing[key];
  if (!current) return;
  delete playing[key];
  try {
    current.src.onended = null;
    current.src.stop(0);
  } catch {
    /* 已经停了 */
  }
  try {
    current.src.disconnect();
    current.gain.disconnect();
  } catch {
    /* 已经断开 */
  }
}

function stopAllKeys() {
  Object.keys(playing).forEach(stopKey);
}

function startKey(key: string, buffer: AudioBuffer, volume: number) {
  const context = getCtx();
  if (!context) return;
  if (context.state === "suspended") context.resume().catch(() => { /* 保持静音 */ });

  // 同一个 key 重复触发只重启，不再叠一层 —— 原来 <audio> 元素就是这么表现的，
  // 而 Web Audio 每次 createBufferSource 都是一个新声源，直接照搬会叠成一片。
  stopKey(key);

  const src = context.createBufferSource();
  src.buffer = buffer;
  const gain = context.createGain();
  gain.gain.value = volume;
  src.connect(gain);
  gain.connect(context.destination);

  src.onended = () => {
    // 只清理自己那一份：如果期间被 stopKey 换成了新的，这里就不该动 map
    if (playing[key] && playing[key].src === src) delete playing[key];
    try {
      src.disconnect();
      gain.disconnect();
    } catch {
      /* 已经断开 */
    }
  };

  src.start(0);
  playing[key] = { src, gain };
}

export default function useAudio() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  useEffect(() => {
    attachUnlock();
  }, []);

  const toggleSound = useCallback(() => {
    // 关掉的时候把正在响的掐掉，和原来 muted 的效果一致
    if (soundEnabledRef.current) stopAllKeys();
    setSoundEnabled((prev) => !prev);
  }, []);

  /**
   * 播放一个音效。
   * 注意这是个每次渲染都重建的普通函数（和改造前一致）：App.tsx 里有
   * `useEffect(..., [level, playForeground])` 这样的依赖，一旦给它套 useCallback
   * 固定了引用，那些 effect 的触发时机就全变了。要动的话得连着 App.tsx 一起改。
   */
  const playForeground = (key: string, volume = 0.5) => {
    if (!soundEnabledRef.current) return;
    const buffer = buffers[key];
    if (buffer) {
      startKey(key, buffer, volume);
      return;
    }
    // 还没解码完（例如关卡刚起来就触发）：补一次解码，这一次先跳过
    ensureDecoded(key);
  };

  /** 预解码全部音效。解码结果缓存在模块级，严格模式下重复调用不会重复解码 */
  const preloadCache = useCallback((keys: string[]) => {
    keys.forEach((key) => {
      ensureDecoded(key);
    });
  }, []);

  // 后台时挂起上下文，回到前台再恢复（原来是把背景音乐 pause/resume）
  useEffect(() => {
    const handleVisibilityChange = () => {
      const context = ctx;
      if (!context) return;
      if (document.hidden) {
        context.suspend().catch(() => { /* 忽略 */ });
      } else if (soundEnabledRef.current) {
        context.resume().catch(() => { /* 忽略 */ });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playForeground,
    preloadCache,
  };
}
