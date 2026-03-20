import { couponsData } from './mock';

const {
  buildCouponDialogData,
  buildCouponSelectionPayload,
  normalizeCouponDialogStoreId,
  shouldUseCouponDialogMockData,
} = require('../../../../services/_utils/page-contract-helpers');

const emptyCouponImg = `https://tdesign.gtimg.com/miniprogram/template/retail/coupon/ordersure-coupon-newempty.png`;

Component({
  properties: {
    storeId: {
      type: String,
      value: '',
    },
    promotionGoodsList: {
      type: Array,
      value: [],
    },
    orderSureCouponList: {
      type: Array,
      value: [],
    },
    couponsShow: {
      type: Boolean,
      value: false,
      observer(couponsShow) {
        if (couponsShow) {
          const { promotionGoodsList, orderSureCouponList, storeId } = this.data;
          const products = (promotionGoodsList || []).map((goods) => ({
            skuId: goods.skuId,
            spuId: goods.spuId,
            storeId: normalizeCouponDialogStoreId(goods.storeId),
            selected: true,
            quantity: goods.num,
            prices: {
              sale: goods.settlePrice,
            },
          }));
          const selectedCoupons = (orderSureCouponList || []).map((ele) => ({
            promotionId: ele.promotionId,
            storeId: normalizeCouponDialogStoreId(ele.storeId),
            couponId: ele.couponId,
          }));
          this.storeId = normalizeCouponDialogStoreId(storeId || (products[0] && products[0].storeId));
          this.setData({
            products,
          });
          this.coupons({
            products,
            selectedCoupons,
            storeId: this.storeId,
          }).then((res) => {
            this.initData(res);
          });
        }
      },
    },
  },
  data: {
    emptyCouponImg,
    goodsList: [],
    selectedList: [],
    couponsList: [],
  },
  methods: {
    initData(data = {}) {
      const { selectedList, couponsList, reduce, selectedNum } = buildCouponDialogData(data, this.storeId);
      this.setData({
        selectedList,
        couponsList,
        reduce,
        selectedNum,
      });
    },
    selectCoupon(e) {
      const { key } = e.currentTarget.dataset;
      const { couponsList, selectedList } = this.data;
      couponsList.forEach((coupon) => {
        if (coupon.key === key) {
          coupon.isSelected = !coupon.isSelected;
        }
      });

      const couponSelected = couponsList
        .filter((coupon) => coupon.isSelected === true)
        .map((coupon) => buildCouponSelectionPayload(coupon, this.storeId));

      this.setData({
        selectedList: couponSelected,
        couponsList: [...couponsList],
        selectedNum: couponSelected.length,
      });

      this.triggerEvent('sure', {
        selectedList: couponSelected,
      });
    },
    hide() {
      this.setData({
        couponsShow: false,
      });
    },
    coupons(coupon = {}) {
      return new Promise((resolve) => {
        if (shouldUseCouponDialogMockData(coupon && coupon.selectedCoupons)) {
          resolve({
            couponResultList: couponsData.couponResultList,
            reduce: couponsData.reduce,
          });
          return;
        }

        resolve({
          couponResultList: [],
          reduce: 0,
        });
      });
    },
  },
});
