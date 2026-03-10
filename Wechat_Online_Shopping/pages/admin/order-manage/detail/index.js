import { fetchAdminOrderDetail } from '../../../../services/admin/order';
Page({
  data: { order: null },
  onLoad(options) {
    fetchAdminOrderDetail(options.orderNo).then((res) => {
      this.setData({ order: res.data });
    });
  },
  goShip() {
    wx.navigateTo({ url: `/pages/admin/order-manage/ship/index?orderNo=${this.data.order.orderNo}` });
  },
});
