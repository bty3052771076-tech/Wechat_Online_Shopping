/* eslint-disable no-param-reassign */
import { getSearchResult } from '../../../services/good/fetchSearchResult';
import Toast from 'tdesign-miniprogram/toast/index';

const initFilters = {
  overall: 1,
  sorts: '',
  layout: 1,
};

Page({
  data: {
    goodsList: [],
    layout: 1,
    sorts: '',
    overall: 1,
    show: false,
    minVal: '',
    maxVal: '',
    minSalePriceFocus: false,
    maxSalePriceFocus: false,
    filter: initFilters,
    hasLoaded: false,
    keywords: '',
    loadMoreStatus: 0,
    loading: true,
  },

  total: 0,
  pageNum: 1,
  pageSize: 30,

  onLoad(options) {
    const { searchValue = '' } = options || {};
    this.setData(
      {
        keywords: searchValue,
      },
      () => {
        this.init(true);
      },
    );
  },

  generalQueryData(reset = false) {
    const { filter, keywords, minVal, maxVal } = this.data;
    const { pageNum, pageSize } = this;
    const { sorts, overall } = filter;
    const params = {
      sort: 0,
      pageNum: 1,
      pageSize: 30,
      keyword: keywords,
    };

    if (sorts) {
      params.sort = 1;
      params.sortType = sorts === 'desc' ? 1 : 0;
    }

    params.sort = overall ? 0 : 1;
    params.minPrice = minVal ? minVal * 100 : 0;
    params.maxPrice = maxVal ? maxVal * 100 : undefined;

    if (reset) {
      return params;
    }

    return {
      ...params,
      pageNum: pageNum + 1,
      pageSize,
    };
  },

  async init(reset = true) {
    const { loadMoreStatus, goodsList = [] } = this.data;
    const params = this.generalQueryData(reset);
    if (loadMoreStatus !== 0) {
      return;
    }

    this.setData({
      loadMoreStatus: 1,
      loading: true,
    });

    try {
      const data = await getSearchResult(params);
      const { spuList, totalCount = 0 } = data;

      if (totalCount === 0 && reset) {
        this.total = totalCount;
        this.setData({
          hasLoaded: true,
          loadMoreStatus: 0,
          loading: false,
          goodsList: [],
        });
        return;
      }

      const nextGoodsList = reset ? spuList : goodsList.concat(spuList);
      nextGoodsList.forEach((item) => {
        item.tags = (item.spuTagList || []).map((tag) => tag.title);
        item.hideKey = { desc: true };
      });
      this.pageNum = params.pageNum || 1;
      this.total = totalCount;
      this.setData({
        goodsList: nextGoodsList,
        loadMoreStatus: nextGoodsList.length === totalCount ? 2 : 0,
      });
    } catch (error) {
      this.setData({
        loading: false,
      });
    }

    this.setData({
      hasLoaded: true,
      loading: false,
    });
  },

  handleCartTap() {
    wx.switchTab({
      url: '/pages/cart/index',
    });
  },

  handleSubmit() {
    this.setData(
      {
        goodsList: [],
        loadMoreStatus: 0,
      },
      () => {
        this.init(true);
      },
    );
  },

  onReachBottom() {
    const { goodsList } = this.data;
    if (goodsList.length === this.total) {
      this.setData({
        loadMoreStatus: 2,
      });
      return;
    }

    this.init(false);
  },

  handleAddCart() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '请在详情页选择规格后加入购物车',
    });
  },

  gotoGoodsDetail(e) {
    const { index } = e.detail;
    const { spuId } = this.data.goodsList[index];
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
  },

  handleFilterChange(e) {
    const { overall, sorts, layout } = e.detail;
    const filter = {
      sorts,
      overall,
      layout,
    };

    this.setData({
      filter,
      sorts,
      overall,
      layout,
    });

    this.pageNum = 1;
    this.setData(
      {
        goodsList: [],
        loadMoreStatus: 0,
      },
      () => {
        this.total && this.init(true);
      },
    );
  },

  showFilterPopup() {
    this.setData({ show: true });
  },

  showFilterPopupClose() {
    this.setData({ show: false });
  },

  onMinValAction(e) {
    this.setData({ minVal: e.detail.value });
  },

  onMaxValAction(e) {
    this.setData({ maxVal: e.detail.value });
  },

  reset() {
    this.setData({ minVal: '', maxVal: '' });
  },

  confirm() {
    this.pageNum = 1;
    this.setData(
      {
        show: false,
        minVal: '',
        goodsList: [],
        loadMoreStatus: 0,
        maxVal: '',
      },
      () => {
        this.init(true);
      },
    );
  },
});
