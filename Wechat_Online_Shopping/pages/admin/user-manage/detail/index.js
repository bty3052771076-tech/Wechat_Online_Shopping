import { fetchAdminUserDetail, updateAdminUserRemark } from '../../../../services/admin/user';

Page({
  data: {
    user: null,
    editingRemark: false,
    remarkValue: '',
  },

  onLoad(options) {
    this.userId = options.userId;
    this.loadDetail();
  },

  loadDetail() {
    fetchAdminUserDetail(this.userId).then((res) => {
      const user = res.data;
      this.setData({ user, remarkValue: user ? user.remark : '' });
    });
  },

  onEditRemark() {
    this.setData({ editingRemark: true });
  },

  onRemarkInput(e) {
    this.setData({ remarkValue: e.detail.value });
  },

  onSaveRemark() {
    const { remarkValue } = this.data;
    updateAdminUserRemark(this.userId, remarkValue).then((res) => {
      if (res.code === 'Success') {
        wx.showToast({ title: '备注已保存', icon: 'success' });
        this.setData({ editingRemark: false });
        this.loadDetail();
      }
    });
  },

  onCancelRemark() {
    this.setData({ editingRemark: false, remarkValue: this.data.user.remark });
  },
});
