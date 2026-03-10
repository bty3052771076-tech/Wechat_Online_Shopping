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
  return requestJson({
    url: `${config.apiBaseURL}/products/categories/tree`,
    method: 'GET',
  }).then((response) => {
    const categories = adaptCategoryTreeResponse(response);
    const swiper = buildHomeSwiper();

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
