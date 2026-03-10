import { shipAdminOrder } from '../../../../services/admin/order';

Page({
  data: {
    orderNo: '',
    expressCompany: '',
    expressNo: '',
    companyOptions: ['顺丰速运', '中通快递', '圆通速递', '韵达快递', '申通快递', 'EMS', '京东物流'],
    showPicker: false,
  },

  onLoad(options) {
    this.setData({ orderNo: options.orderNo || '' });
  },

  onCompanyTap() {
    this.setData({ showPicker: true });
  },

  onPickerConfirm(e) {
    const { value } = e.detail;
    this.setData({ expressCompany: value[0], showPicker: false });
  },

  onPickerCancel() {
    this.setData({ showPicker: false });
  },

  onExpressNoInput(e) {
    this.setData({ expressNo: e.detail.value });
  },

  onSubmit() {
    const { orderNo, expressCompany, expressNo } = this.data;
    if (!expressCompany) {
      wx.showToast({ title: '请选择快递公司', icon: 'none' });
      return;
    }
    if (!expressNo.trim()) {
      wx.showToast({ title: '请输入运单号', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });
    shipAdminOrder(orderNo, expressCompany, expressNo).then((res) => {
      wx.hideLoading();
      if (res.code === 'Success') {
        wx.showToast({ title: '发货成功', icon: 'success' });
        setTimeout(() => {
          const pages = getCurrentPages();
          // 返回到订单列表并刷新
          if (pages.length >= 2) {
            const prevPage = pages[pages.length - 2];
            if (prevPage.loadList) {
              prevPage.loadList();
            }
          }
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: '发货失败', icon: 'none' });
      }
    });
  },
});
