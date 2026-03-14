const { DEFAULT_AVATAR_IMAGE, IMAGE_SCENES, normalizeImageUrl } = require('./image-helpers');

const DEFAULT_COMMENT_AVATAR = DEFAULT_AVATAR_IMAGE;

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
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
        src: normalizeImageUrl(resource.src || resource.url || '', IMAGE_SCENES.comment),
        type: resource.type || 'image',
      };
    })
    .filter((resource) => resource && resource.src);
}

function normalizeSpecInfo(specInfo) {
  if (!specInfo) {
    return [];
  }

  if (Array.isArray(specInfo)) {
    return specInfo.map((item) => ({
      specTitle: item.specTitle || item.title || item.name || 'spec',
      specValue: item.specValue || item.specValues || item.value || '',
    }));
  }

  if (typeof specInfo === 'string') {
    return [{ specTitle: 'spec', specValue: specInfo }];
  }

  return Object.keys(specInfo).map((key) => ({
    specTitle: key,
    specValue: specInfo[key],
  }));
}

function buildGoodsDetailInfo(item = {}) {
  const detailText = String(item.goodsDetailInfo || '').trim();

  if (detailText) {
    return detailText;
  }

  const specInfo = normalizeSpecInfo(item.specInfo);
  if (specInfo.length === 0) {
    return '';
  }

  return `规格: ${specInfo.map((spec) => spec.specValue).filter(Boolean).join(' / ')}`;
}

function adaptCommentItem(item = {}) {
  const commentResources = normalizeCommentResources(item.commentResources);

  return {
    id: item.id || '',
    goodsSpu: item.spuId,
    spuId: item.spuId,
    skuId: item.skuId,
    specInfo: normalizeSpecInfo(item.specInfo),
    commentContent: item.commentContent || '',
    commentResources,
    commentScore: toNumber(item.commentScore, 0),
    uid: item.uid || '',
    userName: item.isAnonymity ? '匿名用户' : item.userName || '',
    userHeadUrl: item.isAnonymity
      ? DEFAULT_COMMENT_AVATAR
      : normalizeImageUrl(item.userHeadUrl || '', IMAGE_SCENES.avatar) || DEFAULT_COMMENT_AVATAR,
    isAnonymity: Boolean(item.isAnonymity),
    commentTime: item.commentTime ? String(item.commentTime) : '',
    isAutoComment: Boolean(item.isAutoComment),
    sellerReply: item.sellerReply || '',
    goodsDetailInfo: buildGoodsDetailInfo(item),
  };
}

function adaptCommentSummaryResponse(response = {}) {
  const data = response.data || response;

  return {
    badCount: toNumber(data.badCount, 0),
    commentCount: toNumber(data.commentCount, 0),
    goodCount: toNumber(data.goodCount, 0),
    goodRate: toNumber(data.goodRate, 0),
    hasImageCount: toNumber(data.hasImageCount, 0),
    middleCount: toNumber(data.middleCount, 0),
    uidCount: toNumber(data.uidCount, 0),
  };
}

function adaptCommentsListResponse(response = {}) {
  const data = response.data || {};
  const list = Array.isArray(data.list) ? data.list : [];
  const pagination = data.pagination || {};

  return {
    pageNum: toNumber(pagination.page, 1),
    pageSize: toNumber(pagination.pageSize, list.length || 10),
    totalCount: toNumber(pagination.total, list.length),
    pageList: list.map(adaptCommentItem),
  };
}

function adaptGoodsDetailsCommentListResponse(response = {}, limit = 3) {
  const adapted = adaptCommentsListResponse(response);

  return {
    homePageComments: adapted.pageList.slice(0, limit),
    totalCount: adapted.totalCount,
  };
}

module.exports = {
  DEFAULT_COMMENT_AVATAR,
  adaptCommentItem,
  adaptCommentSummaryResponse,
  adaptCommentsListResponse,
  adaptGoodsDetailsCommentListResponse,
};
