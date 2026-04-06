import { fetchCouponDetail, fetchCouponGoods } from '../../../services/coupon/index';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    goods: [],
    detail: {},
    couponTypeDesc: '',
    showStoreInfoList: false,
    cartNum: 2,
    isGlobal: false,       // 是否全场通用 (#21)
    categoryNames: [],     // 适用分类名称列表 (#21)
  },

  id: '',

  onLoad(query) {
    const id = parseInt(query.id);
    this.id = id;

    this.getCouponDetail(id);
    this.getGoodsList(id);
  },

  getCouponDetail(id) {
    fetchCouponDetail(id).then(({ detail }) => {
      this.setData({ detail });
      if (detail.type === 'discount') {
        if (detail.base > 0) {
          this.setData({
            couponTypeDesc: `满${detail.base / 100}元${detail.value}折`,
          });
        } else {
          this.setData({ couponTypeDesc: `${detail.value}折` });
        }
      } else if (detail.type === 'price') {
        if (detail.base > 0) {
          this.setData({
            couponTypeDesc: `满${detail.base / 100}元减${detail.value / 100}元`,
          });
        } else {
          this.setData({ couponTypeDesc: `减${detail.value / 100}元` });
        }
      }
    });
  },

  // 通过 fetchCouponGoods 获取按分类过滤的商品列表 (#21)
  getGoodsList(id) {
    fetchCouponGoods(id).then(({ isGlobal, categoryNames, list }) => {
      this.setData({ goods: list, isGlobal, categoryNames });
    });
  },

  openStoreList() {
    this.setData({
      showStoreInfoList: true,
    });
  },

  closeStoreList() {
    this.setData({
      showStoreInfoList: false,
    });
  },

  goodClickHandle(e) {
    const { index } = e.detail;
    const { spuId } = this.data.goods[index];
    wx.navigateTo({ url: `/pages/goods/details/index?spuId=${spuId}` });
  },

  cartClickHandle() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '点击加入购物车',
    });
  },
});
