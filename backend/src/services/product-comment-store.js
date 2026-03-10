function buildCommentTemplates(spu = {}) {
  const title = spu.title || '商品';
  const image = spu.primary_image || '';

  return [
    {
      id: `${spu.id || 'product'}-c1`,
      spuId: spu.id,
      skuId: 0,
      specInfo: '默认规格',
      commentContent: `${title} 到货很快，果品新鲜，口感不错。`,
      commentResources: [
        {
          src: image,
          type: 'image',
        },
      ].filter((item) => item.src),
      commentScore: 5,
      uid: 'u1001',
      userName: '测试用户A',
      userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
      isAnonymity: false,
      commentTime: String(new Date('2026-03-01T10:00:00+08:00').getTime()),
      isAutoComment: false,
      sellerReply: '感谢支持，欢迎再次光临。',
      goodsDetailInfo: '规格: 默认规格',
    },
    {
      id: `${spu.id || 'product'}-c2`,
      spuId: spu.id,
      skuId: 0,
      specInfo: '默认规格',
      commentContent: `${title} 包装完整，和页面描述一致。`,
      commentResources: [],
      commentScore: 4,
      uid: 'u1002',
      userName: '测试用户B',
      userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar2.png',
      isAnonymity: false,
      commentTime: String(new Date('2026-03-02T11:00:00+08:00').getTime()),
      isAutoComment: false,
      sellerReply: '',
      goodsDetailInfo: '规格: 默认规格',
    },
    {
      id: `${spu.id || 'product'}-c3`,
      spuId: spu.id,
      skuId: 0,
      specInfo: '默认规格',
      commentContent: `${title} 整体还可以，价格合适。`,
      commentResources: [],
      commentScore: 3,
      uid: 'u1003',
      userName: '测试用户C',
      userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar3.png',
      isAnonymity: true,
      commentTime: String(new Date('2026-03-03T12:00:00+08:00').getTime()),
      isAutoComment: true,
      sellerReply: '',
      goodsDetailInfo: '规格: 默认规格',
    },
    {
      id: `${spu.id || 'product'}-c4`,
      spuId: spu.id,
      skuId: 0,
      specInfo: '默认规格',
      commentContent: `${title} 本次体验一般，配送稍慢。`,
      commentResources: [],
      commentScore: 2,
      uid: 'u1004',
      userName: '测试用户D',
      userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar4.png',
      isAnonymity: false,
      commentTime: String(new Date('2026-03-04T13:00:00+08:00').getTime()),
      isAutoComment: false,
      sellerReply: '抱歉给您带来不便，我们会持续改进。',
      goodsDetailInfo: '规格: 默认规格',
    },
  ];
}

function filterComments(comments = [], options = {}) {
  const { commentLevel, hasImage } = options;

  return comments.filter((comment) => {
    const score = Number(comment.commentScore || 0);
    const resources = Array.isArray(comment.commentResources) ? comment.commentResources : [];

    if (String(hasImage) === 'true' || String(hasImage) === '1') {
      if (resources.length === 0) {
        return false;
      }
    }

    if (commentLevel === undefined || commentLevel === null || commentLevel === '') {
      return true;
    }

    switch (Number(commentLevel)) {
      case 3:
        return score >= 4;
      case 2:
        return score === 3;
      case 1:
        return score <= 2;
      default:
        return true;
    }
  });
}

function buildSummary(comments = []) {
  const commentCount = comments.length;
  const goodCount = comments.filter((item) => Number(item.commentScore || 0) >= 4).length;
  const middleCount = comments.filter((item) => Number(item.commentScore || 0) === 3).length;
  const badCount = comments.filter((item) => Number(item.commentScore || 0) <= 2).length;
  const hasImageCount = comments.filter(
    (item) => Array.isArray(item.commentResources) && item.commentResources.length > 0,
  ).length;
  const goodRate = commentCount === 0 ? 0 : Math.round((goodCount / commentCount) * 1000) / 10;

  return {
    commentCount,
    badCount,
    middleCount,
    goodCount,
    hasImageCount,
    goodRate,
    uidCount: 0,
  };
}

function paginateComments(comments = [], page = 1, pageSize = 10) {
  const currentPage = Number(page) || 1;
  const currentPageSize = Number(pageSize) || 10;
  const start = (currentPage - 1) * currentPageSize;

  return {
    list: comments.slice(start, start + currentPageSize),
    pagination: {
      page: currentPage,
      pageSize: currentPageSize,
      total: comments.length,
    },
  };
}

module.exports = {
  buildCommentTemplates,
  filterComments,
  buildSummary,
  paginateComments,
};
