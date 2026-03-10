import Toast from 'tdesign-miniprogram/toast/index';
import { userRegister } from '../../../services/user/auth';

Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    email: '',
    loading: false,
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  handleRegister() {
    const { username, password, confirmPassword, phoneNumber, email } = this.data;

    if (!username) {
      Toast({ context: this, selector: '#t-toast', message: '请输入用户名' });
      return;
    }

    if (!password) {
      Toast({ context: this, selector: '#t-toast', message: '请设定密码' });
      return;
    }

    if (password.length < 6) {
      Toast({ context: this, selector: '#t-toast', message: '密码至少6位' });
      return;
    }

    if (password !== confirmPassword) {
      Toast({ context: this, selector: '#t-toast', message: '两次密码不一致' });
      return;
    }

    if (!phoneNumber && !email) {
      Toast({ context: this, selector: '#t-toast', message: '请绑定手机号或邮箱' });
      return;
    }

    this.setData({ loading: true });

    userRegister({ username, password, phoneNumber, email })
      .then((res) => {
        this.setData({ loading: false });

        if (res.code === 'Success') {
          const app = getApp();
          app.globalData.isLoggedIn = true;
          app.globalData.userInfo = res.data.userInfo;
          app.globalData.token = res.data.token;
          wx.setStorageSync('userInfo', res.data.userInfo);
          wx.setStorageSync('token', res.data.token);
          Toast({ context: this, selector: '#t-toast', message: '注册成功', icon: 'check-circle' });
          setTimeout(() => {
            const pages = getCurrentPages();
            if (pages.length > 2) {
              wx.navigateBack({ delta: 2 });
              return;
            }

            wx.navigateBack();
          }, 1000);
          return;
        }

        Toast({ context: this, selector: '#t-toast', message: res.msg || '注册失败' });
      })
      .catch((err) => {
        this.setData({ loading: false });
        const message = (err && (err.msg || err.message)) || '注册异常';
        Toast({ context: this, selector: '#t-toast', message });
      });
  },

  goLogin() {
    wx.navigateBack();
  },
});
