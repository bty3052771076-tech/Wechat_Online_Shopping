import Toast from 'tdesign-miniprogram/toast/index';
import { adminLogin } from '../../../services/admin/auth';

Page({
  data: {
    username: '',
    password: '',
    loading: false,
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async handleLogin() {
    const { username, password } = this.data;

    if (!username) {
      Toast({ context: this, selector: '#t-toast', message: '请输入账号' });
      return;
    }

    if (!password) {
      Toast({ context: this, selector: '#t-toast', message: '请输入密码' });
      return;
    }

    this.setData({ loading: true });

    try {
      const res = await adminLogin(username, password);

      if (res.code === 'Success') {
        const app = getApp();
        app.globalData.isAdminLoggedIn = true;
        app.globalData.adminInfo = res.data.adminInfo;
        wx.setStorageSync('adminInfo', res.data.adminInfo);
        wx.setStorageSync('adminToken', res.data.token);
        Toast({ context: this, selector: '#t-toast', message: '登录成功', icon: 'check-circle' });
        setTimeout(() => {
          wx.redirectTo({ url: '/pages/admin/dashboard/index' });
        }, 800);
        return;
      }

      Toast({ context: this, selector: '#t-toast', message: res.msg || '登录失败' });
    } catch (err) {
      console.error('[Admin Login] error', err && err.message ? err.message : err);
      Toast({ context: this, selector: '#t-toast', message: `登录异常：${err.message || err}` });
    } finally {
      this.setData({ loading: false });
    }
  },
});
