const IMAGE_SCENES = {
  product: 'product',
  category: 'category',
  banner: 'banner',
  avatar: 'avatar',
  comment: 'comment',
  logo: 'logo',
};

const DEFAULT_PRODUCT_IMAGE = '/assets/images/products/default.png';
const DEFAULT_CATEGORY_IMAGE = '/assets/images/categories/default.png';
const DEFAULT_BANNER_IMAGE = '/assets/images/banners/featured.png';
const DEFAULT_AVATAR_IMAGE = '/assets/images/avatar/default.png';
const DEFAULT_COMMENT_IMAGE = '/assets/images/comments/proof.png';
const DEFAULT_LOGO_IMAGE = '/assets/images/system/shop-logo.png';

const PRODUCT_PLACEHOLDER_MAP = {
  'p1.png': '/assets/images/products/apple.png',
  'p2.png': '/assets/images/products/carrot.png',
  'p3.png': '/assets/images/products/egg.png',
  'p4.png': '/assets/images/products/detergent.png',
  'p5.png': '/assets/images/products/tissue.png',
  'p6.png': '/assets/images/products/mask.png',
  'p7.png': '/assets/images/products/cleanser.png',
  'apple.jpg': '/assets/images/products/apple.png',
  'nz-08b.png': '/assets/images/products/apple.png',
  'carrot.jpg': '/assets/images/products/carrot.png',
  'sp-1a.png': '/assets/images/products/carrot.png',
  'egg.jpg': '/assets/images/products/egg.png',
  'gh-2b.png': '/assets/images/products/egg.png',
  'detergent.jpg': '/assets/images/products/detergent.png',
  'dz-3a.png': '/assets/images/products/detergent.png',
  'tissue.jpg': '/assets/images/products/tissue.png',
  'mz-12b.png': '/assets/images/products/tissue.png',
  'mask.jpg': '/assets/images/products/mask.png',
  'mz-20a1.png': '/assets/images/products/mask.png',
  'cleanser.jpg': '/assets/images/products/cleanser.png',
  'mz-11a1.png': '/assets/images/products/cleanser.png',
};

const CATEGORY_PLACEHOLDER_MAP = {
  'fresh.png': '/assets/images/categories/fresh.png',
  'daily.png': '/assets/images/categories/daily.png',
  'beauty.png': '/assets/images/categories/beauty.png',
  'fruit.png': '/assets/images/categories/fruit.png',
  'meat.png': '/assets/images/categories/meat.png',
  'seafood.png': '/assets/images/categories/seafood.png',
  'kitchen.png': '/assets/images/categories/kitchen.png',
  'clean.png': '/assets/images/categories/clean.png',
  'paper.png': '/assets/images/categories/paper.png',
  'face.png': '/assets/images/categories/face.png',
  'body.png': '/assets/images/categories/body.png',
  'makeup.png': '/assets/images/categories/makeup.png',
  'muy-3b.png': '/assets/images/categories/fresh.png',
};

const BANNER_PLACEHOLDER_MAP = {
  'spring-sale.jpg': '/assets/images/banners/spring-sale.png',
  'banner1.png': '/assets/images/banners/spring-sale.png',
  'new-user.jpg': '/assets/images/banners/new-user.png',
  'banner2.png': '/assets/images/banners/new-user.png',
  'featured.jpg': '/assets/images/banners/featured.png',
  'banner3.png': '/assets/images/banners/featured.png',
  'banner4.png': '/assets/images/banners/featured.png',
  'banner5.png': '/assets/images/banners/featured.png',
  'banner6.png': '/assets/images/banners/featured.png',
};

const COMMENT_PLACEHOLDER_MAP = {
  'proof.png': DEFAULT_COMMENT_IMAGE,
  'comment.png': DEFAULT_COMMENT_IMAGE,
};

const CATEGORY_CODE_MAP = {
  CATEGORY_FRESH: '/assets/images/categories/fresh.png',
  CATEGORY_DAILY: '/assets/images/categories/daily.png',
  CATEGORY_BEAUTY: '/assets/images/categories/beauty.png',
  FRESH_FRUIT: '/assets/images/categories/fruit.png',
  FRESH_MEAT: '/assets/images/categories/meat.png',
  FRESH_SEAFOOD: '/assets/images/categories/seafood.png',
  DAILY_KITCHEN: '/assets/images/categories/kitchen.png',
  DAILY_CLEAN: '/assets/images/categories/clean.png',
  DAILY_PAPER: '/assets/images/categories/paper.png',
  BEAUTY_FACE: '/assets/images/categories/face.png',
  BEAUTY_BODY: '/assets/images/categories/body.png',
  BEAUTY_MAKEUP: '/assets/images/categories/makeup.png',
};

const CATEGORY_NAME_MAP = {
  生鲜食品: CATEGORY_CODE_MAP.CATEGORY_FRESH,
  日用百货: CATEGORY_CODE_MAP.CATEGORY_DAILY,
  美妆个护: CATEGORY_CODE_MAP.CATEGORY_BEAUTY,
  蔬菜水果: CATEGORY_CODE_MAP.FRESH_FRUIT,
  肉禽蛋品: CATEGORY_CODE_MAP.FRESH_MEAT,
  海鲜水产: CATEGORY_CODE_MAP.FRESH_SEAFOOD,
  厨房用品: CATEGORY_CODE_MAP.DAILY_KITCHEN,
  家居清洁: CATEGORY_CODE_MAP.DAILY_CLEAN,
  纸品湿巾: CATEGORY_CODE_MAP.DAILY_PAPER,
  面部护理: CATEGORY_CODE_MAP.BEAUTY_FACE,
  身体护理: CATEGORY_CODE_MAP.BEAUTY_BODY,
  香水彩妆: CATEGORY_CODE_MAP.BEAUTY_MAKEUP,
};

function getHostname(raw) {
  const match = String(raw).match(/^https?:\/\/([^/?#:]+)/i);
  return match ? String(match[1]).toLowerCase() : '';
}

function getPathInfo(raw) {
  const normalizedLocal = normalizeLocalAssetPath(raw);
  if (normalizedLocal) {
    const pathname = normalizedLocal.replace(/^\/+/, '').toLowerCase();
    const parts = pathname.split('/').filter(Boolean);

    return {
      pathname,
      filename: parts.length > 0 ? parts[parts.length - 1] : '',
    };
  }

  try {
    const url = new URL(String(raw));
    const pathname = String(url.pathname || '').toLowerCase().replace(/^\/+/, '');
    const parts = pathname.split('/').filter(Boolean);

    return {
      pathname,
      filename: parts.length > 0 ? parts[parts.length - 1] : '',
    };
  } catch (error) {
    return {
      pathname: '',
      filename: '',
    };
  }
}

function normalizeLocalAssetPath(raw) {
  const value = raw === null || raw === undefined ? '' : String(raw).trim();

  if (/^\/assets\/images\//i.test(value)) {
    return value;
  }

  if (/^assets\/images\//i.test(value)) {
    return `/${value}`;
  }

  return '';
}

function isScene(value) {
  return Object.values(IMAGE_SCENES).includes(value);
}

function getSceneDefault(scene) {
  switch (scene) {
    case IMAGE_SCENES.category:
      return DEFAULT_CATEGORY_IMAGE;
    case IMAGE_SCENES.banner:
      return DEFAULT_BANNER_IMAGE;
    case IMAGE_SCENES.avatar:
      return DEFAULT_AVATAR_IMAGE;
    case IMAGE_SCENES.comment:
      return DEFAULT_COMMENT_IMAGE;
    case IMAGE_SCENES.logo:
      return DEFAULT_LOGO_IMAGE;
    case IMAGE_SCENES.product:
    default:
      return DEFAULT_PRODUCT_IMAGE;
  }
}

function resolveScene(sceneOrFallback) {
  if (isScene(sceneOrFallback)) {
    return {
      scene: sceneOrFallback,
      fallback: getSceneDefault(sceneOrFallback),
    };
  }

  const customFallback = sceneOrFallback === null || sceneOrFallback === undefined ? '' : String(sceneOrFallback).trim();
  if (customFallback && /^https?:\/\//i.test(customFallback)) {
    return {
      scene: IMAGE_SCENES.product,
      fallback: customFallback,
    };
  }

  return {
    scene: IMAGE_SCENES.product,
    fallback: DEFAULT_PRODUCT_IMAGE,
  };
}

function mapExamplePlaceholder(raw, scene) {
  const { filename } = getPathInfo(raw);

  switch (scene) {
    case IMAGE_SCENES.category:
      return CATEGORY_PLACEHOLDER_MAP[filename] || DEFAULT_CATEGORY_IMAGE;
    case IMAGE_SCENES.banner:
      return BANNER_PLACEHOLDER_MAP[filename] || DEFAULT_BANNER_IMAGE;
    case IMAGE_SCENES.avatar:
      return DEFAULT_AVATAR_IMAGE;
    case IMAGE_SCENES.comment:
      return COMMENT_PLACEHOLDER_MAP[filename] || PRODUCT_PLACEHOLDER_MAP[filename] || DEFAULT_COMMENT_IMAGE;
    case IMAGE_SCENES.logo:
      return DEFAULT_LOGO_IMAGE;
    case IMAGE_SCENES.product:
    default:
      return PRODUCT_PLACEHOLDER_MAP[filename] || DEFAULT_PRODUCT_IMAGE;
  }
}

function getSceneMap(scene) {
  switch (scene) {
    case IMAGE_SCENES.category:
      return CATEGORY_PLACEHOLDER_MAP;
    case IMAGE_SCENES.banner:
      return BANNER_PLACEHOLDER_MAP;
    case IMAGE_SCENES.comment:
      return COMMENT_PLACEHOLDER_MAP;
    case IMAGE_SCENES.product:
    default:
      return PRODUCT_PLACEHOLDER_MAP;
  }
}

function mapKnownRemoteAsset(raw, scene) {
  const { filename } = getPathInfo(raw);
  const sceneMap = getSceneMap(scene);

  if (sceneMap[filename]) {
    return sceneMap[filename];
  }

  if (scene !== IMAGE_SCENES.category && PRODUCT_PLACEHOLDER_MAP[filename]) {
    return PRODUCT_PLACEHOLDER_MAP[filename];
  }

  return '';
}

function normalizeImageUrl(value, sceneOrFallback = IMAGE_SCENES.product) {
  const { scene, fallback } = resolveScene(sceneOrFallback);
  const raw = value === null || value === undefined ? '' : String(value).trim();

  if (!raw) {
    return fallback;
  }

  const localAssetPath = normalizeLocalAssetPath(raw);
  if (localAssetPath) {
    return localAssetPath;
  }

  if (!/^https?:\/\//i.test(raw)) {
    return fallback;
  }

  const hostname = getHostname(raw);
  if (hostname === 'example.com' || hostname.endsWith('.example.com')) {
    return mapExamplePlaceholder(raw, scene);
  }

  const mappedRemoteAsset = mapKnownRemoteAsset(raw, scene);
  if (mappedRemoteAsset) {
    return mappedRemoteAsset;
  }

  return raw;
}

function normalizeImageList(values = [], sceneOrFallback = IMAGE_SCENES.product) {
  return (Array.isArray(values) ? values : [])
    .map((value) => normalizeImageUrl(value, sceneOrFallback))
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
          src: normalizeImageUrl(resource, IMAGE_SCENES.comment),
          type: 'image',
        };
      }

      return {
        ...resource,
        src: normalizeImageUrl(resource.src || resource.url || '', IMAGE_SCENES.comment),
        type: resource.type || 'image',
      };
    })
    .filter((resource) => resource && resource.src);
}

function resolveCategoryImage(value = '', metadata = {}) {
  const code = String(metadata.category_code || metadata.categoryCode || '').trim().toUpperCase();
  const name = String(metadata.name || metadata.category_name || metadata.categoryName || '').trim();
  const derived = CATEGORY_CODE_MAP[code] || CATEGORY_NAME_MAP[name] || '';
  return normalizeImageUrl(derived || value, IMAGE_SCENES.category);
}

module.exports = {
  IMAGE_SCENES,
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_CATEGORY_IMAGE,
  DEFAULT_BANNER_IMAGE,
  DEFAULT_AVATAR_IMAGE,
  DEFAULT_COMMENT_IMAGE,
  DEFAULT_LOGO_IMAGE,
  normalizeImageUrl,
  normalizeImageList,
  normalizeCommentResources,
  resolveCategoryImage,
};
