const DEFAULT_PRODUCT_IMAGE = 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png';

function getHostname(raw) {
  const match = String(raw).match(/^https?:\/\/([^/?#:]+)/i);
  return match ? String(match[1]).toLowerCase() : '';
}

function normalizeImageUrl(value, fallback = DEFAULT_PRODUCT_IMAGE) {
  const raw = value === null || value === undefined ? '' : String(value).trim();

  if (!raw) {
    return fallback;
  }

  const hostname = getHostname(raw);
  if (hostname === 'example.com' || hostname.endsWith('.example.com')) {
    return fallback;
  }

  if (raw.indexOf('http://') !== 0 && raw.indexOf('https://') !== 0) {
    return fallback;
  }

  return raw;
}

module.exports = {
  DEFAULT_PRODUCT_IMAGE,
  getHostname,
  normalizeImageUrl,
};
