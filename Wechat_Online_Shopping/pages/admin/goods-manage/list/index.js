import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';
import { fetchAdminGoodsList, removeAdminGoods } from '../../../../services/admin/goods';

Page({
  data: {
    goodsList: [],
    keyword: '',
    loading: false,
  },

  onLoad() {
    this.loadList();
  },

  onShow() {
    this.loadList();
  },

  loadList() {
    this.setData({ loading: true });
    fetchAdminGoodsList(this.data.keyword).then((res) => {
      this.setData({
        loading: false,
        goodsList: res.data || [],
      });
    });
  },

  onSearchChange(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadList();
  },

  onClear() {
    this.setData({ keyword: '' });
    this.loadList();
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/admin/goods-manage/edit/index' });
  },

  goEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/admin/goods-manage/edit/index?id=${id}` });
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/admin/goods-manage/edit/index?id=${id}&readonly=1` });
  },

  onDelete(e) {
    const { id, name } = e.currentTarget.dataset;
    Dialog.confirm({
      title: '确认删除',
      content: `确定要删除商品"${name}"吗？`,
      confirmBtn: '确定删除',
      cancelBtn: '取消',
    }).then(() => {
      removeAdminGoods(id).then((res) => {
        if (res.code === 'Success') {
          Toast({ context: this, selector: '#t-toast', message: '删除成功' });
          this.loadList();
        }
      });
    });
  },

  formatPrice(price) {
    return (price / 100).toFixed(2);
  },
});
