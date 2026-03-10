import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';

import { cancelRights } from '../../after-service-detail/api';
import { ServiceButtonTypes } from '../../config';

Component({
  properties: {
    service: {
      type: Object,
      observer(service) {
        const currentService = service || {};
        const buttonsRight = currentService.buttons || currentService.buttonVOs || [];
        this.setData({
          currentService,
          buttonGroups: {
            left: [],
            right: buttonsRight.map((button) => ({
              ...button,
              openType: button && button.openType ? String(button.openType) : '',
            })),
          },
        });
      },
    },
  },

  data: {
    currentService: {},
    buttonGroups: {
      left: [],
      right: [],
    },
  },

  methods: {
    onServiceBtnTap(e) {
      const { type } = e.currentTarget.dataset;
      const service = this.data.currentService;

      switch (type) {
        case ServiceButtonTypes.REVOKE:
          this.onConfirm(service);
          break;
        case ServiceButtonTypes.FILL_TRACKING_NO:
          this.onFillTrackingNo(service);
          break;
        case ServiceButtonTypes.CHANGE_TRACKING_NO:
          this.onChangeTrackingNo(service);
          break;
        case ServiceButtonTypes.VIEW_DELIVERY:
          this.viewDelivery(service);
          break;
        default:
          break;
      }
    },

    onFillTrackingNo(service) {
      wx.navigateTo({
        url: `/pages/order/fill-tracking-no/index?rightsNo=${service.id}`,
      });
    },

    viewDelivery(service) {
      wx.navigateTo({
        url: `/pages/order/delivery-detail/index?data=${JSON.stringify(
          service.logistics || service.logisticsVO,
        )}&source=2`,
      });
    },

    onChangeTrackingNo(service) {
      wx.navigateTo({
        url: `/pages/order/fill-tracking-no/index?rightsNo=${service.id}&logisticsNo=${service.logisticsNo}&logisticsCompanyName=${service.logisticsCompanyName}&logisticsCompanyCode=${service.logisticsCompanyCode}&remark=${service.remark || ''}`,
      });
    },

    onConfirm(service) {
      Dialog.confirm({
        title: '是否撤销售后申请？',
        content: '',
        confirmBtn: '撤销申请',
        cancelBtn: '返回',
      })
        .then(() => cancelRights({ rightsNo: service.id }))
        .then(() => {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '已撤销售后申请',
          });
          this.triggerEvent('refresh');
        })
        .catch(() => {});
    },
  },
});
