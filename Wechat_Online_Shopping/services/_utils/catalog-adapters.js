const { normalizeFenAmount } = require('./shop-adapters');
const { DEFAULT_PRODUCT_IMAGE, normalizeImageUrl } = require('./image-helpers');

function splitTags(tags) {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function adaptProductItem(item = {}) {
  const primaryImage = normalizeImageUrl(item.primary_image || item.primaryImage || '');
  const minSalePrice = normalizeFenAmount(item.min_sale_price || item.minSalePrice || 0);
  const maxLinePrice = normalizeFenAmount(item.max_line_price || item.maxLinePrice || 0);

  return {
    spuId: item.id,
    thumb: primaryImage,
    primaryImage,
    title: item.title || '',
    price: minSalePrice,
    minSalePrice,
    originPrice: maxLinePrice,
    maxLinePrice,
    spuTagList: splitTags(item.tags).map((title) => ({ title })),
  };
}

function adaptProductCollectionResponse(response = {}) {
  const list = Array.isArray(response.data) ? response.data : [];
  const pagination = response.pagination || {};

  return {
    pageNum: pagination.page || 1,
    pageSize: pagination.pageSize || list.length,
    totalCount: pagination.total || list.length,
    spuList: list.map(adaptProductItem),
  };
}

function adaptCategoryNode(node = {}) {
  const children = Array.isArray(node.children) ? node.children.map(adaptCategoryNode) : [];

  return {
    id: node.id,
    name: node.name || node.category_name || '',
    thumbnail: normalizeImageUrl(node.thumbnail || node.icon_url || node.primary_image || ''),
    disabled: Boolean(node.disabled),
    children,
  };
}

function adaptCategoryTreeResponse(response = {}) {
  const list = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
  return list.map(adaptCategoryNode);
}

module.exports = {
  DEFAULT_PRODUCT_IMAGE,
  normalizeImageUrl,
  adaptProductCollectionResponse,
  adaptProductItem,
  adaptCategoryTreeResponse,
};
