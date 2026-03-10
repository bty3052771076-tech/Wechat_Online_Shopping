import { fetchAdminAfterSaleDetail, auditAdminAfterSale } from '../../../../services/admin/order';

Page({
  data: {
    detail: null,
  },

  onLoad(options) {
    this.aftersaleId = options.id;
    this.loadDetail();
  },

  loadDetail() {
    fetchAdminAfterSaleDetail(this.aftersaleId).then((res) => {
      this.setData({ detail: res.data });
    });
  },

  onApprove() {
    wx.showModal({
      title: '确认审核',
      content: '确认通过该售后申请？将退款给用户。',
      success: (res) => {
        if (res.confirm) {
          this.doAudit(true);
        }
      },
    });
  },

  onReject() {
    wx.showModal({
      title: '确认驳回',
      content: '确认驳回该售后申请？',
      success: (res) => {
        if (res.confirm) {
          this.doAudit(false);
        }
      },
    });
  },

  doAudit(approved) {
    wx.showLoading({ title: '处理中...' });
    auditAdminAfterSale(this.aftersaleId, approved).then((res) => {
      wx.hideLoading();
      if (res.code === 'Success') {
        wx.showToast({ title: approved ? '已通过' : '已驳回', icon: 'success' });
        this.loadDetail();
        // 刷新列表页
        const pages = getCurrentPages();
        if (pages.length >= 2) {
          const prevPage = pages[pages.length - 2];
          if (prevPage.loadList) {
            prevPage.loadList();
          }
        }
      }
    });
  },
});
