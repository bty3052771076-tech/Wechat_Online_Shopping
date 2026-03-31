// import { getCommentDetail } from '../../../../services/good/comments/fetchCommentDetail';
import Toast from 'tdesign-miniprogram/toast/index';
import { config } from '../../../../config/index';

const { buildAuthHeader } = require('../../../../services/_utils/auth');

Page({
  data: {
    serviceRateValue: 1,
    goodRateValue: 1,
    conveyRateValue: 1,
    isAnonymous: false,
    uploadFiles: [],
    gridConfig: {
      width: 218,
      height: 218,
      column: 3,
    },
    isAllowedSubmit: false,
    imgUrl: '',
    title: '',
    goodsDetail: '',
    orderNo: '',
    spuId: '',
    imageProps: {
      mode: 'aspectFit',
    },
  },

  onLoad(options) {
    this.setData({
      imgUrl: options.imgUrl,
      title: options.title,
      goodsDetail: options.specs,
      orderNo: options.orderNo || '',
      spuId: options.spuId || '',
    });
  },

  onRateChange(e) {
    const { value } = e?.detail;
    const item = e?.currentTarget?.dataset?.item;
    this.setData({ [item]: value }, () => {
      this.updateButtonStatus();
    });
  },

  onAnonymousChange(e) {
    const status = !!e?.detail?.checked;
    this.setData({ isAnonymous: status });
  },

  handleSuccess(e) {
    const { files } = e.detail;

    this.setData({
      uploadFiles: files,
    });
  },

  handleRemove(e) {
    const { index } = e.detail;
    const { uploadFiles } = this.data;
    uploadFiles.splice(index, 1);
    this.setData({
      uploadFiles,
    });
  },

  onTextAreaChange(e) {
    const value = e?.detail?.value;
    this.textAreaValue = value;
    this.updateButtonStatus();
  },

  updateButtonStatus() {
    const { serviceRateValue, goodRateValue, conveyRateValue, isAllowedSubmit } = this.data;
    const { textAreaValue } = this;
    const temp = serviceRateValue && goodRateValue && conveyRateValue && textAreaValue;
    if (temp !== isAllowedSubmit) this.setData({ isAllowedSubmit: temp });
  },

  onSubmitBtnClick() {
    const { isAllowedSubmit, spuId, orderNo, serviceRateValue, isAnonymous, goodsDetail } = this.data;
    if (!isAllowedSubmit) return;

    if (!spuId) {
      // 无商品 ID 时降级到原有 Toast 行为（兼容旧入口）
      Toast({ context: this, selector: '#t-toast', message: '评价提交成功', icon: 'check-circle' });
      setTimeout(() => wx.navigateBack(), 1200);
      return;
    }

    // 调用真实 API 提交评论
    const self = this;
    wx.request({
      url: `${config.apiBaseURL}/products/${spuId}/comments`,
      method: 'POST',
      header: { 'Content-Type': 'application/json', ...buildAuthHeader() },
      data: {
        orderNo: orderNo || '',
        commentScore: serviceRateValue || 5,
        commentContent: self.textAreaValue || '',
        isAnonymous: !!isAnonymous,
        skuSpecInfo: goodsDetail || '',
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          Toast({ context: self, selector: '#t-toast', message: '评价提交成功', icon: 'check-circle' });
          setTimeout(() => wx.navigateBack(), 1200);
        } else {
          Toast({ context: self, selector: '#t-toast', message: (res.data && res.data.msg) || '提交失败，请重试', icon: '' });
        }
      },
      fail() {
        Toast({ context: self, selector: '#t-toast', message: '网络错误，请重试', icon: '' });
      },
    });
  },
});
