import { fetchCouponDetail } from '../../../services/coupon/index';

Page({
  data: {
    detail: null,
    storeInfoList: [],
    storeInfoStr: '',
    showStoreInfoList: false,
  },

  id: '',

  onLoad(query) {
    const id = parseInt(query.id);
    this.id = id;
    this.getGoodsList(id);
  },

  getGoodsList(id) {
    fetchCouponDetail(id).then(({ detail }) => {
      if (detail) {
        // 根据 API 返回的字符串 type 补全详情描述
        if (detail.type === 'discount') {
          detail.desc = detail.base > 0
            ? `满${detail.base / 100}元${detail.value}折`
            : `${detail.value}折`;
        } else if (detail.type === 'price') {
          detail.desc = detail.base > 0
            ? `满${detail.base / 100}元减${detail.value / 100}元`
            : `减${detail.value / 100}元`;
        }
      }
      this.setData({ detail });
    });
  },

  navGoodListHandle() {
    wx.navigateTo({
      url: `/pages/coupon/coupon-activity-goods/index?id=${this.id}`,
    });
  },
});
