/**
 * 缩略图/占位工具模块
 * - 当头像/缩略图字段缺失时：使用纯色块占位（避免 base64 图生成带来的不稳定与性能开销）
 * - 保留模型缩略图：用于需要时生成静态 canvas 缩略图
 */

(function (root) {
  function hashString(text) {
    return [...text].reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) >>> 0;
  }

  // 返回可直接用于 `background:` 的渐变字符串（同 seed 稳定，不同 seed 更分散）
  function placeholderColor(seed = '') {
    const text = String(seed ?? '').trim();
    const base = text || String(Math.random());
    const hue1 = hashString(`${base}|h1`) % 360;
    let hue2 = hashString(`${base}|h2`) % 360;
    const angle = hashString(`${base}|a`) % 360;
    if (Math.abs(hue1 - hue2) < 25) hue2 = (hue2 + 120) % 360;

    const c1 = `hsl(${hue1}, 78%, 56%)`;
    const c2 = `hsl(${hue2}, 78%, 44%)`;

    return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
  }

  function placeholderText(seed = '') {
    const text = String(seed ?? '').trim();
    return text[0] ? text[0].toUpperCase() : '?';
  }

  root.placeholderColor = placeholderColor;
  root.placeholderText = placeholderText;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { placeholderColor, placeholderText };
  }
})(typeof window !== 'undefined' ? window : globalThis);
