const HOME_SWIPER_IMAGES = [
  '/assets/images/banners/spring-sale.png',
  '/assets/images/banners/new-user.png',
  '/assets/images/banners/featured.png',
];

function getCategoryName(category = {}) {
  return category.name || category.category_name || '';
}

function buildHomeSwiper() {
  return HOME_SWIPER_IMAGES.slice();
}

function buildHomeTabs(categories = []) {
  const categoryTabs = categories
    .map((item) => {
      const id = Number(item && item.id);
      const text = String(getCategoryName(item) || '').trim();

      if (!Number.isFinite(id) || !text) {
        return null;
      }

      return {
        text,
        key: `category-${id}`,
        type: 'category',
        categoryId: id,
      };
    })
    .filter(Boolean);

  return [
    { text: '精选推荐', key: 'recommend', type: 'recommend' },
    { text: '热销商品', key: 'hot', type: 'hot' },
    { text: '新品上架', key: 'new', type: 'new' },
    ...categoryTabs,
  ];
}

function buildHomeGoodsQuery(tab = {}, pageNum = 1, pageSize = 20) {
  const query = {
    pageNum,
    pageSize,
  };

  switch (tab.type) {
    case 'hot':
      return {
        ...query,
        sortBy: 'sold_num',
        sortOrder: 'DESC',
      };
    case 'new':
      return {
        ...query,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      };
    case 'category':
      return {
        ...query,
        categoryId: tab.categoryId,
      };
    default:
      return query;
  }
}

function pickCategoryDisplayLevel(categories = []) {
  const hasGrandchildren = categories.some(
    (category) =>
      Array.isArray(category && category.children) &&
      category.children.some((child) => Array.isArray(child && child.children) && child.children.length > 0),
  );

  return hasGrandchildren ? 3 : 2;
}

module.exports = {
  buildHomeSwiper,
  buildHomeTabs,
  buildHomeGoodsQuery,
  pickCategoryDisplayLevel,
};
