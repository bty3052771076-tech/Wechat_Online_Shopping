import { fetchHome } from '../../services/home/home';
import { fetchGoodsList } from '../../services/good/fetchGoodsList';
import Toast from 'tdesign-miniprogram/toast/index';

const { buildHomeGoodsQuery } = require('../../services/_utils/home-adapters');

Page({
  data: {
    imgSrcs: [],
    tabList: [],
    goodsList: [],
    goodsListLoadStatus: 0,
    pageLoading: false,
    currentTabValue: 'recommend',
    current: 1,
    autoplay: true,
    duration: '500',
    interval: 5000,
    navigation: { type: 'dots' },
    swiperImageProps: { mode: 'scaleToFill' },
  },

  goodListPagination: {
    pageNum: 1,
    pageSize: 20,
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    this.init();
  },

  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },

  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.loadHomePage();
  },

  loadHomePage() {
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: true,
    });
    fetchHome()
      .then(({ swiper, tabList }) => {
        const currentTabValue = tabList.length > 0 ? tabList[0].key : 'recommend';
        this.setData({
          tabList,
          imgSrcs: swiper,
          currentTabValue,
          pageLoading: false,
        });
        this.loadGoodsList(true);
      })
      .catch(() => {
        this.setData({
          pageLoading: false,
          goodsListLoadStatus: 3,
        });
      });
  },

  tabChangeHandle(e) {
    const value = e && e.detail && e.detail.value !== undefined ? e.detail.value : e.detail;
    this.setData({
      currentTabValue: value,
    });
    this.loadGoodsList(true);
  },

  onReTry() {
    this.loadGoodsList();
  },

  async loadGoodsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({ goodsListLoadStatus: 1 });

    const pageSize = this.goodListPagination.pageSize;
    const pageNum = fresh ? 1 : this.goodListPagination.pageNum + 1;
    const currentTab =
      this.data.tabList.find((item) => String(item.key) === String(this.data.currentTabValue)) || this.data.tabList[0] || {};
    const query = buildHomeGoodsQuery(currentTab, pageNum, pageSize);

    try {
      const response = await fetchGoodsList(query);
      const nextList = Array.isArray(response && response.spuList)
        ? response.spuList.map((item) => ({
            ...item,
            tags: Array.isArray(item.spuTagList) ? item.spuTagList.map((tag) => tag.title).filter(Boolean) : [],
          }))
        : [];
      const totalCount = response && response.totalCount ? response.totalCount : nextList.length;
      const mergedGoodsList = fresh ? nextList : this.data.goodsList.concat(nextList);

      this.setData({
        goodsList: mergedGoodsList,
        goodsListLoadStatus: mergedGoodsList.length >= totalCount || nextList.length === 0 ? 2 : 0,
      });

      this.goodListPagination.pageNum = pageNum;
      this.goodListPagination.pageSize = pageSize;
    } catch (err) {
      this.setData({ goodsListLoadStatus: 3 });
    }
  },

  goodListClickHandle(e) {
    const { index } = e.detail;
    const { spuId } = this.data.goodsList[index];
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
  },

  goodListAddCartHandle() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '点击加入购物车',
    });
  },

  navToSearchPage() {
    wx.navigateTo({ url: '/pages/goods/search/index' });
  },

  navToActivityDetail({ detail }) {
    const { index: promotionID = 0 } = detail || {};
    wx.navigateTo({
      url: `/pages/promotion/promotion-detail/index?promotion_id=${promotionID}`,
    });
  },

  goToAdminLogin() {
    wx.navigateTo({ url: '/pages/admin/login/index' });
  },
});
