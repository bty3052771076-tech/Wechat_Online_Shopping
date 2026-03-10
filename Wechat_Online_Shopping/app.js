import updateManager from './common/updateManager';

App({
  globalData: {
    isLoggedIn: false,
    userInfo: null,
    token: null,
    isAdminLoggedIn: false,
    adminInfo: null,
  },

  onLaunch: function () {
    // 恢复登录态
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    if (userInfo && token) {
      this.globalData.isLoggedIn = true;
      this.globalData.userInfo = userInfo;
      this.globalData.token = token;
    }
  },

  onShow: function () {
    updateManager();
  },
});
