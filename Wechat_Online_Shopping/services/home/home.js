import { config } from '../../config/index';

const { requestJson } = require('../_utils/request');
const { adaptCategoryTreeResponse } = require('../_utils/catalog-adapters');
const { buildHomeSwiper, buildHomeTabs } = require('../_utils/home-adapters');

function mockFetchHome() {
  const { delay } = require('../_utils/delay');

  return delay().then(() => ({
    swiper: buildHomeSwiper(),
    tabList: buildHomeTabs([
      { id: 1, name: '生鲜食品' },
      { id: 2, name: '日用百货' },
      { id: 3, name: '美妆个护' },
    ]),
    activityImg: buildHomeSwiper()[0] || '',
  }));
}

function realFetchHome() {
  // 并发请求分类树和轮播图，轮播图失败时静默降级
  const categoriesReq = requestJson({
    url: `${config.apiBaseURL}/products/categories/tree`,
    method: 'GET',
  });
  const bannersReq = requestJson({
    url: `${config.apiBaseURL}/banners`,
    method: 'GET',
  }).catch(() => ({ data: [] }));

  return Promise.all([categoriesReq, bannersReq]).then(([catResp, bannerResp]) => {
    const categories = adaptCategoryTreeResponse(catResp);
    const banners = Array.isArray(bannerResp && bannerResp.data) ? bannerResp.data : [];
    const swiper = buildHomeSwiper(banners);

    return {
      swiper,
      tabList: buildHomeTabs(categories),
      activityImg: swiper[0] || '',
    };
  });
}

export function fetchHome() {
  if (config.useMock) {
    return mockFetchHome();
  }

  return realFetchHome();
}
