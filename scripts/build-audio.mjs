/**
 * 把 media/audio 下的音频转成 base64，生成 public/audio/sfx-data.js。
 *
 * 为什么必须这样绕：小工具容器有两条互相夹击的限制，音频文件本身进不去。
 *   1) 上传只允许 jpg/css/gif/svg/png/js/jpeg/json/html/woff2/webp/woff —— 没有任何音频类型，
 *      所以 mp3 不能作为包内文件交付（zip-artifact-spec.md §2）。
 *   2) `<audio>` / `<video>` 只允许包内媒体文件，明确禁止 `data:` / `blob:` 媒体源
 *      （zip-artifact-spec.md §3、performance-budget.md §3）。
 * 两条合起来意味着 `<audio>` 在这个容器里播不出任何东西。
 *
 * 唯一走得通的路径是把音频编成 base64 放进 .js（.js 是允许的类型），
 * 运行时用 Web Audio API 的 decodeAudioData 解码后播放 —— 它吃的是内存里的 ArrayBuffer，
 * 不产生 data: URL、不触发任何资源加载，因此不落在 CSP 的任何一条规则上。
 * 图片没有这个麻烦，`<img src="data:...">` 是明确允许的。
 *
 * 体积门禁照抄 performance-budget.md §3：单条解码后 >100 KiB 优先改包内文件（此处不可行，
 * 所以超了就报警告）、>1 MiB 不允许内嵌；这里按 base64 后的字符串长度卡。
 *
 * 改了 media/audio 下的文件后重跑：npm run audio:build（predev / prebuild 也会自动跑）。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC_DIR = path.join(ROOT, 'media/audio');
const OUT_FILE = path.join(ROOT, 'public/audio/sfx-data.js');

const SINGLE_WARN = 100 * 1024;
const SINGLE_LIMIT = 1024 * 1024;
const TOTAL_WARN = 1024 * 1024;

/** 递归收集音频文件，返回相对 media/audio 的 posix 路径 */
function collect(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...collect(full));
    else if (/\.(mp3|m4a|wav|ogg)$/i.test(entry.name)) found.push(full);
  }
  return found.sort();
}

export function buildAudio() {
  if (!fs.existsSync(SRC_DIR)) {
    console.warn(`[build-audio] 缺少源目录 ${path.relative(ROOT, SRC_DIR)}，跳过`);
    return 0;
  }

  const files = collect(SRC_DIR);
  const entries = [];
  let total = 0;
  let errors = 0;

  for (const file of files) {
    // key 要和 utils/path.ts 里 getSoundKey() 的返回值一致，
    // 运行时是拿那个字符串来查表的。
    const key = path.relative(SRC_DIR, file).split(path.sep).join('/');
    const b64 = fs.readFileSync(file).toString('base64');
    total += b64.length;

    if (b64.length > SINGLE_LIMIT) {
      console.error(`[build-audio] ${key}: base64 后 ${(b64.length / 1024).toFixed(1)} KiB，超过 1 MiB 内嵌上限`);
      errors++;
    } else if (b64.length > SINGLE_WARN) {
      console.warn(`[build-audio] ${key}: base64 后 ${(b64.length / 1024).toFixed(1)} KiB，超过 100 KiB，建议压码率或裁时长`);
    }
    entries.push([key, b64]);
  }

  if (total > TOTAL_WARN) {
    console.warn(`[build-audio] 音频总计 ${(total / 1024).toFixed(1)} KiB，超过 1 MiB，注意首屏解析与内存`);
  }
  if (errors) return 0;

  const body = entries.map(([key, b64]) => `  ${JSON.stringify(key)}:\n    ${JSON.stringify(b64)}`).join(',\n');

  const out = `/* 由 scripts/build-audio.mjs 生成 —— 请勿手改，改源文件后重跑 npm run audio:build。
 *
 * 这里放的是 media/audio/** 的原音频 base64。容器只允许 .js/.json 这类类型进包，
 * 音频文件本身进不去，而媒体元素又被禁止使用 data: 媒体源，所以只能由
 * services/audioService.ts 用 Web Audio API 的 decodeAudioData 在内存里解码后播放。
 */
window.__SFX__ = {
${body}
};
`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, out);
  return out.length;
}

// 直接执行时（npm run audio:build）打印结果；被 import 时不打印。
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const bytes = buildAudio();
  if (bytes) console.log(`  public/audio/sfx-data.js  ${(bytes / 1024).toFixed(2)} kB`);
}
