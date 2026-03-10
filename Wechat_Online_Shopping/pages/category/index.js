import { getCategoryList } from '../../services/good/fetchCategoryList';

const { pickCategoryDisplayLevel } = require('../../services/_utils/home-adapters');

Page({
  data: {
    list: [],
    categoryLevel: 2,
  },

  async init() {
    try {
      const result = await getCategoryList();
      this.setData({
        list: result,
        categoryLevel: pickCategoryDisplayLevel(result),
      });
    } catch (error) {
      console.error('category init error:', error);
    }
  },

  onShow() {
    const tabBar = this.getTabBar();
    if (tabBar && typeof tabBar.init === 'function') {
      tabBar.init();
    }
  },

  onChange(e) {
    const { item } = e.detail || {};
    const categoryId = item && item.id ? `?categoryId=${item.id}` : '';

    wx.navigateTo({
      url: `/pages/goods/list/index${categoryId}`,
    });
  },

  onLoad() {
    this.init();
  },
});
