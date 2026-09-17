/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * 把音效的原始写法转成内嵌音频表的 key。
 *
 * 注意这个函数的返回值**不是文件路径**，是 window.__SFX__ 里的键（见 scripts/build-audio.mjs）。
 * 音频不能作为包内文件交付，所以这里没有「路径」可言了，名字也就跟着改成 getSoundKey。
 *
 * 为什么音频不能进包（两条限制互相夹击，导致 `<audio>` 在本容器里播不出任何东西）：
 *   1) 上传只允许 jpg/css/gif/svg/png/js/jpeg/json/html/woff2/webp/woff，没有任何音频类型，
 *      mp3 作为包内文件会被门禁直接拒掉（zip-artifact-spec.md §2）；
 *   2) `<audio>` / `<video>` 只允许包内媒体文件，明确禁止 `data:` / `blob:` 媒体源
 *      （zip-artifact-spec.md §3、performance-budget.md §3）。
 * 所以播放层改成了 Web Audio API：base64 存在 .js 里，decodeAudioData 在内存里解码。
 * 图片不受影响 —— `<img src="data:...">` 是明确允许的。
 *
 * 原先这里返回的是 https://www.gstatic.com/aistudio/starter-apps/applets-io 下的远程地址，
 * 容器不联网，那套早就不能用了。
 */
export function getSoundKey(path: string) {
  return path
    .replace(/^\/+/, '')
    // /media/audio/sfx/... 与 /audio/sfx/... 两种写法都归一化成 sfx/...
    .replace(/^(media\/)?audio\//, '')
    .replace(/^media\//, '');
}
