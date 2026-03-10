import Toast from 'tdesign-miniprogram/toast/index';
import { userLogin, userWechatLogin } from '../../../services/user/auth';

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
      Toast({ context: this, selector: '#t-toast', message: '请输入用户名' });
      return;
    }

    if (!password) {
      Toast({ context: this, selector: '#t-toast', message: '请输入密码' });
      return;
    }

    this.setData({ loading: true });

    try {
      const res = await userLogin(username, password);

      if (res.code === 'Success') {
        const app = getApp();
        app.globalData.isLoggedIn = true;
        app.globalData.userInfo = res.data.userInfo;
        app.globalData.token = res.data.token;
        wx.setStorageSync('userInfo', res.data.userInfo);
        wx.setStorageSync('token', res.data.token);
        Toast({ context: this, selector: '#t-toast', message: '登录成功', icon: 'check-circle' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
        return;
      }

      Toast({ context: this, selector: '#t-toast', message: res.msg || '登录失败' });
    } catch (err) {
      const message = (err && (err.msg || err.message)) || '登录异常';
      Toast({ context: this, selector: '#t-toast', message });
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleWechatLogin() {
    this.setData({ loading: true });

    try {
      const res = await userWechatLogin();

      if (res.code === 'Success') {
        const app = getApp();
        app.globalData.isLoggedIn = true;
        app.globalData.userInfo = res.data.userInfo;
        app.globalData.token = res.data.token;
        wx.setStorageSync('userInfo', res.data.userInfo);
        wx.setStorageSync('token', res.data.token);
        Toast({ context: this, selector: '#t-toast', message: '微信登录成功', icon: 'check-circle' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
        return;
      }

      Toast({ context: this, selector: '#t-toast', message: res.msg || '登录失败' });
    } catch (err) {
      const message = (err && (err.msg || err.message)) || '登录异常';
      Toast({ context: this, selector: '#t-toast', message });
    } finally {
      this.setData({ loading: false });
    }
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/user/register/index' });
  },
});
