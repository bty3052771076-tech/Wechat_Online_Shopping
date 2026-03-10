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

function normalizeImageList(values = [], fallback = DEFAULT_PRODUCT_IMAGE) {
  return (Array.isArray(values) ? values : [])
    .map((value) => normalizeImageUrl(value, fallback))
    .filter(Boolean);
}

function normalizeCommentResources(resources = []) {
  return (Array.isArray(resources) ? resources : [])
    .map((resource) => {
      if (!resource) {
        return null;
      }

      if (typeof resource === 'string') {
        return {
          src: normalizeImageUrl(resource),
          type: 'image',
        };
      }

      return {
        ...resource,
        src: normalizeImageUrl(resource.src || resource.url || ''),
        type: resource.type || 'image',
      };
    })
    .filter((resource) => resource && resource.src);
}

module.exports = {
  DEFAULT_PRODUCT_IMAGE,
  normalizeImageUrl,
  normalizeImageList,
  normalizeCommentResources,
};
