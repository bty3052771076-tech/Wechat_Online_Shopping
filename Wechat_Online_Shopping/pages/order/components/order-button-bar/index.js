import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';
import { OrderButtonTypes } from '../../config';
import { cancelOrder, payOrder, confirmOrderReceived } from '../../../../services/order-new';

const {
  buildRebuyGoodsRequestList,
  normalizeActionButtons,
} = require('../../../../services/_utils/order-action-helpers');

Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    order: {
      type: Object,
      observer(order) {
        this.syncButtons(order);
      },
    },
    goodsIndex: {
      type: Number,
      value: null,
      observer() {
        this.syncButtons(this.properties.order);
      },
    },
    isBtnMax: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    currentOrder: {},
    buttonGroups: {
      left: [],
      right: [],
    },
  },

  methods: {
    syncButtons(order = {}) {
      const currentOrder = order || {};
      const goodsIndex = this.properties.goodsIndex;

      if (goodsIndex !== null && goodsIndex !== undefined) {
        const goodsList = Array.isArray(currentOrder.goodsList) ? currentOrder.goodsList : [];
        const goods = goodsList[Number(goodsIndex)] || {};

        this.setData({
          currentOrder,
          buttonGroups: {
            left: [],
            right: normalizeActionButtons(goods.buttons || []).filter(
              (button) => button.type === OrderButtonTypes.APPLY_REFUND,
            ),
          },
        });
        return;
      }

      const buttonsRight = normalizeActionButtons(currentOrder.buttons || []).map((button) => {
        if (button.type === OrderButtonTypes.INVITE_GROUPON && currentOrder.groupInfoVo) {
          const firstGoods = Array.isArray(currentOrder.goodsList) ? currentOrder.goodsList[0] : null;

          return {
            ...button,
            openType: 'share',
            dataShare: {
              goodsImg: firstGoods && (firstGoods.imgUrl || firstGoods.thumb),
              goodsName: firstGoods && (firstGoods.name || firstGoods.title),
              groupId: currentOrder.groupInfoVo.groupId,
              promotionId: currentOrder.groupInfoVo.promotionId,
              remainMember: currentOrder.groupInfoVo.remainMember,
              groupPrice: currentOrder.groupInfoVo.groupPrice,
              storeId: currentOrder.storeId,
            },
          };
        }

        return button;
      });

      const deleteBtnIndex = buttonsRight.findIndex((button) => button.type === OrderButtonTypes.DELETE);
      const buttonsLeft = deleteBtnIndex > -1 ? buttonsRight.splice(deleteBtnIndex, 1) : [];

      this.setData({
        currentOrder,
        buttonGroups: {
          left: buttonsLeft,
          right: buttonsRight,
        },
      });
    },

    showMessage(message, icon = '') {
      Toast({
        context: this,
        selector: '#t-toast',
        message,
        icon,
      });
    },

    getCurrentOrder() {
      return this.data.currentOrder || this.properties.order || {};
    },

    emitRefresh() {
      this.triggerEvent('refresh');
    },

    onOrderBtnTap(e) {
      const { type } = e.currentTarget.dataset;
      const order = this.getCurrentOrder();

      switch (type) {
        case OrderButtonTypes.DELETE:
          this.onDelete(order);
          break;
        case OrderButtonTypes.CANCEL:
          this.onCancel(order);
          break;
        case OrderButtonTypes.CONFIRM:
          this.onConfirm(order);
          break;
        case OrderButtonTypes.PAY:
          this.onPay(order);
          break;
        case OrderButtonTypes.APPLY_REFUND:
          this.onApplyRefund(order);
          break;
        case OrderButtonTypes.VIEW_REFUND:
          this.onViewRefund(order);
          break;
        case OrderButtonTypes.COMMENT:
          this.onAddComment(order);
          break;
        case OrderButtonTypes.REBUY:
          this.onBuyAgain(order);
          break;
        default:
          break;
      }
    },

    onDelete() {
      this.showMessage('当前版本暂不支持删除订单');
    },

    onCancel(order) {
      Dialog.confirm({
        title: '确认取消订单？',
        content: '',
        confirmBtn: '取消订单',
        cancelBtn: '返回',
      })
        .then(() => cancelOrder(order.orderNo, { cancelReason: '用户主动取消订单' }))
        .then(() => {
          this.showMessage('订单已取消', 'check-circle');
          this.emitRefresh();
        })
        .catch(() => {});
    },

    onConfirm(order) {
      Dialog.confirm({
        title: '确认已收到货？',
        content: '',
        confirmBtn: '确认收货',
        cancelBtn: '返回',
      })
        .then(() => confirmOrderReceived(order.orderNo))
        .then(() => {
          this.showMessage('已确认收货', 'check-circle');
          this.emitRefresh();
        })
        .catch(() => {});
    },

    onPay(order) {
      payOrder(order.orderNo)
        .then(() => {
          this.emitRefresh();
          wx.navigateTo({
            url: `/pages/order/pay-result/index?totalPaid=${order.amount || order.totalAmount || 0}&orderNo=${
              order.orderNo
            }`,
          });
        })
        .catch(() => {});
    },

    onBuyAgain(order) {
      const goodsRequestList = buildRebuyGoodsRequestList(order);

      if (!goodsRequestList.length) {
        this.showMessage('当前订单没有可再次购买的商品');
        return;
      }

      wx.navigateTo({
        url: `/pages/order/order-confirm/index?goodsRequestList=${encodeURIComponent(
          JSON.stringify(goodsRequestList),
        )}`,
      });
    },

    onApplyRefund(order) {
      const goodsList = Array.isArray(order.goodsList) ? order.goodsList : [];
      const goods = goodsList[Number(this.properties.goodsIndex)] || goodsList[0] || {};
      const params = {
        orderNo: order.orderNo,
        skuId: goods.skuId || '',
        spuId: goods.spuId || '',
        orderStatus: order.status,
        logisticsNo: order.logisticsNo || '',
        price: goods.price || 0,
        num: goods.num || goods.quantity || 1,
        createTime: order.createTime,
        orderAmt: order.totalAmount,
        payAmt: order.amount,
        canApplyReturn: true,
      };
      const paramsStr = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join('&');

      wx.navigateTo({ url: `/pages/order/apply-service/index?${paramsStr}` });
    },

    onViewRefund() {
      wx.navigateTo({
        url: '/pages/order/after-service-list/index',
      });
    },

    onAddComment(order) {
      const goods = Array.isArray(order.goodsList) ? order.goodsList[0] : {};
      const imgUrl = goods && goods.thumb;
      const title = goods && goods.title;
      const specs = goods && goods.specs;

      wx.navigateTo({
        url: `/pages/goods/comments/create/index?specs=${specs}&title=${title}&orderNo=${order.orderNo}&imgUrl=${imgUrl}`,
      });
    },
  },
});
