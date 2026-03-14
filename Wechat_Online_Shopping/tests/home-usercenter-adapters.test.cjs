const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  buildHomeSwiper,
  buildHomeTabs,
  buildHomeGoodsQuery,
  pickCategoryDisplayLevel,
} = require('../services/_utils/home-adapters');
const {
  buildUserCenterPayload,
  buildPersonProfile,
} = require('../services/_utils/usercenter-adapters');

test('buildHomeSwiper uses reachable tdesign banner assets instead of retired COS paths', () => {
  const swiper = buildHomeSwiper();

  assert.ok(Array.isArray(swiper));
  assert.ok(swiper.length >= 3);
  assert.ok(swiper.every((item) => item.startsWith('/assets/images/banners/')));
});

test('buildHomeTabs maps backend categories into real category tabs after curated tabs', () => {
  const tabs = buildHomeTabs([
    { id: 1, name: '生鲜食品' },
    { id: 2, category_name: '日用百货' },
  ]);

  assert.deepEqual(
    tabs.map((item) => ({ text: item.text, key: item.key, type: item.type, categoryId: item.categoryId || null })),
    [
      { text: '精选推荐', key: 'recommend', type: 'recommend', categoryId: null },
      { text: '热销商品', key: 'hot', type: 'hot', categoryId: null },
      { text: '新品上架', key: 'new', type: 'new', categoryId: null },
      { text: '生鲜食品', key: 'category-1', type: 'category', categoryId: 1 },
      { text: '日用百货', key: 'category-2', type: 'category', categoryId: 2 },
    ],
  );
});

test('buildHomeGoodsQuery maps category tabs to category filters and curated tabs to sort queries', () => {
  assert.deepEqual(buildHomeGoodsQuery({ type: 'recommend' }, 1, 20), {
    pageNum: 1,
    pageSize: 20,
  });

  assert.deepEqual(buildHomeGoodsQuery({ type: 'hot' }, 2, 10), {
    pageNum: 2,
    pageSize: 10,
    sortBy: 'sold_num',
    sortOrder: 'DESC',
  });

  assert.deepEqual(buildHomeGoodsQuery({ type: 'new' }, 3, 8), {
    pageNum: 3,
    pageSize: 8,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  assert.deepEqual(buildHomeGoodsQuery({ type: 'category', categoryId: 9 }, 1, 20), {
    pageNum: 1,
    pageSize: 20,
    categoryId: 9,
  });
});

test('pickCategoryDisplayLevel uses 2-level rendering when the backend tree has no grandchildren', () => {
  const level = pickCategoryDisplayLevel([
    {
      id: 1,
      name: '生鲜食品',
      children: [{ id: 4, name: '蔬菜水果', children: [] }],
    },
  ]);

  assert.equal(level, 2);
});

test('buildUserCenterPayload creates logged-in usercenter data from profile and order counts', () => {
  const payload = buildUserCenterPayload({
    profile: {
      id: 1,
      username: 'testuser',
      nickname: '测试用户',
      avatar_url: '',
      phone: '13800138000',
    },
    orderCounts: [
      { tabType: 5, orderNum: 2 },
      { tabType: 10, orderNum: 1 },
      { tabType: 40, orderNum: 3 },
    ],
    afterSaleCount: 4,
  });

  assert.deepEqual(payload.userInfo, {
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    avatar_url: '',
    phone: '13800138000',
    nickName: '测试用户',
    avatarUrl: '',
    phoneNumber: '13800138000',
  });
  assert.deepEqual(payload.orderTagInfos, [
    { orderNum: 2, tabType: 5 },
    { orderNum: 1, tabType: 10 },
    { orderNum: 3, tabType: 40 },
    { orderNum: 0, tabType: 60 },
    { orderNum: 4, tabType: 0 },
  ]);
  assert.deepEqual(payload.customerServiceInfo, {
    servicePhone: '400-800-1234',
    serviceTimeDuration: '周一至周日 09:00-18:00',
  });
});

test('buildPersonProfile combines profile and first address for person-info page', () => {
  const person = buildPersonProfile({
    profile: {
      nickname: '测试用户',
      avatar_url: '',
      phone: '13800138000',
      gender: 1,
    },
    addresses: [
      {
        province_name: '北京',
        province_code: '110000',
        city_name: '北京',
        city_code: '110100',
      },
    ],
  });

  assert.deepEqual(person, {
    avatarUrl: '',
    nickName: '测试用户',
    phoneNumber: '13800138000',
    gender: 1,
    address: {
      provinceName: '北京',
      provinceCode: '110000',
      cityName: '北京',
      cityCode: '110100',
    },
  });
});

test('usercenter menu only renders t-icon when a menu item provides an icon', () => {
  const wxml = fs.readFileSync('pages/usercenter/index.wxml', 'utf8');

  assert.match(wxml, /<t-icon[^>]*wx:if="\{\{xitem\.icon\}\}"/);
});
