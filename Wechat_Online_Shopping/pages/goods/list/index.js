import { fetchGoodsList } from '../../../services/good/fetchGoodsList';
import Toast from 'tdesign-miniprogram/toast/index';

const initFilters = {
  overall: 1,
  sorts: '',
  layout: 0,
};

Page({
  data: {
    goodsList: [],
    layout: 0,
    sorts: '',
    overall: 1,
    categoryId: '',
    show: false,
    minVal: '',
    maxVal: '',
    filter: initFilters,
    hasLoaded: false,
    loadMoreStatus: 0,
    loading: true,
  },

  pageNum: 1,
  pageSize: 30,
  total: 0,

  handleFilterChange(e) {
    const { layout, overall, sorts } = e.detail;
    this.pageNum = 1;
    this.setData({
      layout,
      sorts,
      overall,
      filter: {
        layout,
        overall,
        sorts,
      },
      loadMoreStatus: 0,
    });
    this.init(true);
  },

  generalQueryData(reset = false) {
    const { filter, minVal, maxVal, categoryId } = this.data;
    const { pageNum, pageSize } = this;
    const { sorts, overall } = filter;
    const params = {
      sort: 0,
      pageNum: 1,
      pageSize: 30,
      categoryId,
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
      const data = await fetchGoodsList(params);
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

  onLoad(options = {}) {
    this.setData(
      {
        categoryId: options.categoryId || '',
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

  tagClickHandle() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '标签功能暂未开放',
    });
  },

  gotoGoodsDetail(e) {
    const { index } = e.detail;
    const { spuId } = this.data.goodsList[index];
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
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
        goodsList: [],
        loadMoreStatus: 0,
      },
      () => {
        this.init(true);
      },
    );
  },
});
