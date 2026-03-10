import Toast from 'tdesign-miniprogram/toast/index';
import { ServiceType, ServiceTypeDesc, ServiceStatus } from '../config';
import { formatTime, getRightsDetail } from './api';

const TitleConfig = {
  [ServiceType.ORDER_CANCEL]: '退款详情',
  [ServiceType.ONLY_REFUND]: '退款详情',
  [ServiceType.RETURN_GOODS]: '退货退款详情',
};

function normalizeCreateTime(value) {
  if (!value) {
    return '';
  }

  if (/^\d+$/.test(String(value))) {
    return formatTime(parseFloat(`${value}`), 'YYYY-MM-DD HH:mm');
  }

  return String(value);
}

Page({
  data: {
    pullDownRefreshing: false,
    pageLoading: true,
    serviceRaw: {},
    service: {},
    deliveryButton: {},
    gallery: {
      current: 0,
      show: false,
      proofs: [],
    },
    showProofs: false,
    backRefresh: false,
  },

  onLoad(query) {
    this.rightsNo = query.rightsNo;
    this.inputDialog = this.selectComponent('#input-dialog');
    this.init();
  },

  onShow() {
    if (!this.data.backRefresh) return;
    this.init();
    this.setData({ backRefresh: false });
  },

  onPullDownRefresh_() {
    this.setData({ pullDownRefreshing: true }, () => {
      this.getService()
        .then(() => {
          this.setData({ pullDownRefreshing: false });
        })
        .catch(() => {
          this.setData({ pullDownRefreshing: false });
        });
    });
  },

  init() {
    this.setData({ pageLoading: true });
    this.getService().then(() => {
      this.setData({ pageLoading: false });
    });
  },

  getService() {
    return getRightsDetail({ rightsNo: this.rightsNo }).then((res) => {
      const serviceRaw = res.data[0];

      if (!serviceRaw) {
        this.setData({
          serviceRaw: {},
          service: {},
          pageLoading: false,
        });
        return;
      }

      if (!serviceRaw.buttonVOs) {
        serviceRaw.buttonVOs = [];
      }

      const proofs = (serviceRaw.rights && serviceRaw.rights.rightsImageUrls) || [];
      const service = {
        id: serviceRaw.rights.rightsNo,
        serviceNo: serviceRaw.rights.rightsNo,
        storeName: serviceRaw.rights.storeName,
        type: serviceRaw.rights.rightsType,
        typeDesc: ServiceTypeDesc[serviceRaw.rights.rightsType],
        status: serviceRaw.rights.rightsStatus,
        statusIcon: this.genStatusIcon(serviceRaw.rights),
        statusName: serviceRaw.rights.userRightsStatusName,
        statusDesc: serviceRaw.rights.userRightsStatusDesc,
        amount: serviceRaw.rights.refundRequestAmount,
        goodsList: (serviceRaw.rightsItem || []).map((item, index) => ({
          id: index,
          thumb: item.goodsPictureUrl,
          title: item.goodsName,
          specs: (item.specInfo || []).map((spec) => spec.specValues || ''),
          itemRefundAmount: item.itemRefundAmount,
          rightsQuantity: item.rightsQuantity,
        })),
        orderNo: serviceRaw.rights.orderNo,
        rightsNo: serviceRaw.rights.rightsNo,
        rightsReasonDesc: serviceRaw.rights.rightsReasonDesc,
        isRefunded: serviceRaw.rights.userRightsStatus === ServiceStatus.REFUNDED,
        refundMethodList: (serviceRaw.refundMethodList || []).map((item) => ({
          name: item.refundMethodName,
          amount: item.refundMethodAmount,
        })),
        refundRequestAmount: serviceRaw.rights.refundRequestAmount,
        payTraceNo: serviceRaw.rightsRefund.traceNo,
        createTime: normalizeCreateTime(serviceRaw.rights.createTime),
        logisticsNo: serviceRaw.logisticsVO.logisticsNo,
        logisticsCompanyName: serviceRaw.logisticsVO.logisticsCompanyName,
        logisticsCompanyCode: serviceRaw.logisticsVO.logisticsCompanyCode,
        remark: serviceRaw.logisticsVO.remark,
        receiverName: serviceRaw.logisticsVO.receiverName,
        receiverPhone: serviceRaw.logisticsVO.receiverPhone,
        receiverAddress: this.composeAddress(serviceRaw),
        applyRemark: serviceRaw.rightsRefund.refundDesc,
        buttons: serviceRaw.buttonVOs || [],
        logistics: serviceRaw.logisticsVO,
      };

      this.setData({
        serviceRaw,
        service,
        deliveryButton: {},
        'gallery.proofs': proofs,
        showProofs:
          serviceRaw.rights.userRightsStatus === ServiceStatus.PENDING_VERIFY &&
          Boolean(service.applyRemark || proofs.length > 0),
      });

      wx.setNavigationBarTitle({
        title: TitleConfig[service.type],
      });
    });
  },

  composeAddress(service) {
    return [
      service.logisticsVO.receiverProvince,
      service.logisticsVO.receiverCity,
      service.logisticsVO.receiverCountry,
      service.logisticsVO.receiverArea,
      service.logisticsVO.receiverAddress,
    ]
      .filter(Boolean)
      .join(' ');
  },

  onRefresh() {
    this.init();
  },

  editLogistices() {
    this.setData({
      inputDialogVisible: true,
    });
    this.inputDialog.setData({
      cancelBtn: '取消',
      confirmBtn: '确定',
    });
    this.inputDialog._onConfirm = () => {
      Toast({
        message: '确认填写物流单号',
      });
    };
  },

  onProofTap(e) {
    if (this.data.gallery.show) {
      this.setData({
        'gallery.show': false,
      });
      return;
    }

    const { index } = e.currentTarget.dataset;
    this.setData({
      'gallery.show': true,
      'gallery.current': index,
    });
  },

  onGoodsCardTap(e) {
    const { index } = e.currentTarget.dataset;
    const goods = this.data.serviceRaw.rightsItem[index];
    wx.navigateTo({ url: `/pages/goods/details/index?spuId=${goods.spuId || goods.skuId}` });
  },

  onServiceNoCopy() {
    wx.setClipboardData({
      data: this.data.service.serviceNo,
    });
  },

  onAddressCopy() {
    wx.setClipboardData({
      data: `${this.data.service.receiverName}  ${this.data.service.receiverPhone}\n${this.data.service.receiverAddress}`,
    });
  },

  genStatusIcon(item) {
    const { userRightsStatus, afterSaleRequireType } = item;

    switch (userRightsStatus) {
      case ServiceStatus.REFUNDED:
        return 'succeed';
      case ServiceStatus.CLOSED:
        return 'indent_close';
      default:
        return afterSaleRequireType === 'REFUND_MONEY' ? 'goods_refund' : 'goods_return';
    }
  },
});
