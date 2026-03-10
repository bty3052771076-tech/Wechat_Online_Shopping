import { fetchAdminUsers } from '../../../../services/admin/user';

Page({
  data: {
    keyword: '',
    userList: [],
  },

  onLoad() {
    this.loadUsers();
  },

  onShow() {
    this.loadUsers();
  },

  loadUsers() {
    fetchAdminUsers(this.data.keyword).then((res) => {
      this.setData({ userList: res.data || [] });
    });
  },

  onSearchChange(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadUsers();
  },

  onClear() {
    this.setData({ keyword: '' });
    this.loadUsers();
  },

  goDetail(e) {
    const { userid } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/admin/user-manage/detail/index?userId=${userid}` });
  },
});
