import { fetchAdminOrders } from '../../../../services/admin/order';

Page({
  data: {
    orderList: [],
    filters: { orderNo: '', userName: '', phone: '', status: -1, startDate: '', endDate: '' },
    statusTabs: [
      { key: -1, text: '全部' },
      { key: 5, text: '待支付' },
      { key: 10, text: '待发货' },
      { key: 40, text: '待收货' },
      { key: 50, text: '已完成' },
    ],
    curTab: -1,
    showFilter: false,
  },

  onLoad() { this.loadList(); },
  onShow() { this.loadList(); },

  loadList() {
    const filters = { ...this.data.filters, status: this.data.curTab };
    fetchAdminOrders(filters).then((res) => {
      this.setData({ orderList: res.data || [] });
    });
  },

  onTabChange(e) {
    this.setData({ curTab: e.detail.value });
    this.loadList();
  },

  onFilterInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`filters.${field}`]: e.detail.value });
  },

  onSearch() {
    this.loadList();
    this.setData({ showFilter: false });
  },

  onClearFilter() {
    this.setData({ filters: { orderNo: '', userName: '', phone: '', status: -1, startDate: '', endDate: '' } });
    this.loadList();
  },

  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  onStartDateChange(e) {
    this.setData({ 'filters.startDate': e.detail.value });
  },

  onEndDateChange(e) {
    this.setData({ 'filters.endDate': e.detail.value });
  },

  goDetail(e) {
    const { orderno } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/admin/order-manage/detail/index?orderNo=${orderno}` });
  },

  goShip(e) {
    const { orderno } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/admin/order-manage/ship/index?orderNo=${orderno}` });
  },
});
