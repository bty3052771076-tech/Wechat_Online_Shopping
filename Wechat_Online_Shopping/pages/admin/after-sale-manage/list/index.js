import { fetchAdminAfterSales } from '../../../../services/admin/order';

Page({
  data: {
    statusTabs: [
      { text: '全部', key: -1 },
      { text: '待审核', key: 10 },
      { text: '已审核', key: 20 },
      { text: '已完成', key: 50 },
      { text: '已关闭', key: 60 },
    ],
    currentStatus: -1,
    afterSaleList: [],
  },

  onLoad() {
    this.loadList();
  },

  onShow() {
    this.loadList();
  },

  loadList() {
    const status = this.data.currentStatus;
    fetchAdminAfterSales(status === -1 ? undefined : status).then((res) => {
      this.setData({ afterSaleList: res.data || [] });
    });
  },

  onTabChange(e) {
    this.setData({ currentStatus: e.detail.value });
    this.loadList();
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/admin/after-sale-manage/detail/index?id=${id}` });
  },
});
