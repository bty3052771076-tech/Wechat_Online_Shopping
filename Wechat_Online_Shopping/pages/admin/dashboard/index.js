Page({
  data: {
    adminInfo: {},
    menuList: [
      {
        title: '商品管理',
        desc: '新增、编辑、删除商品信息',
        icon: 'shop',
        url: '/pages/admin/goods-manage/list/index',
      },
      {
        title: '订单管理',
        desc: '查询订单、发货操作',
        icon: 'order',
        url: '/pages/admin/order-manage/list/index',
      },
      {
        title: '售后管理',
        desc: '处理退款/退货申请',
        icon: 'service',
        url: '/pages/admin/after-sale-manage/list/index',
      },
      {
        title: '用户管理',
        desc: '查看注册用户信息',
        icon: 'usergroup',
        url: '/pages/admin/user-manage/list/index',
      },
      {
        title: '配送管理',
        desc: '设置区域配送费用',
        icon: 'deliver',
        url: '/pages/admin/delivery-manage/index',
      },
      {
        title: '优惠券管理',
        desc: '创建、编辑、下架优惠券',
        icon: 'discount',
        url: '/pages/admin/coupon-manage/index',
      },
      {
        title: '促销管理',
        desc: '创建、编辑促销活动',
        icon: 'discount-fill',
        url: '/pages/admin/promotion-manage/index',
      },
      {
        title: 'Banner管理',
        desc: '管理首页轮播图',
        icon: 'image',
        url: '/pages/admin/banner-manage/index',
      },
    ],
  },

  onLoad() {
    const adminInfo = wx.getStorageSync('adminInfo') || {};
    this.setData({ adminInfo });
  },

  onMenuTap(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({ url });
  },

  handleLogout() {
    const app = getApp();
    app.globalData.isAdminLoggedIn = false;
    app.globalData.adminInfo = null;
    wx.removeStorageSync('adminInfo');
    wx.removeStorageSync('adminToken');
    wx.redirectTo({ url: '/pages/admin/login/index' });
  },
});
