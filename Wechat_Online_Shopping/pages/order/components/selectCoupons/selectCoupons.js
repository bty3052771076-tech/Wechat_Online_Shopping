import dayjs from 'dayjs';
import { couponsData } from './mock';

const { normalizeCouponDialogStoreId } = require('../../../../services/_utils/page-contract-helpers');

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
      const { couponResultList = [], reduce = 0 } = data;
      const selectedList = [];
      let selectedNum = 0;
      const couponsList =
        couponResultList &&
        couponResultList.map((coupon) => {
          const { status, couponVO } = coupon;
          const { couponId, condition = '', endTime = 0, name = '', startTime = 0, value, type } = couponVO;
          if (status === 1) {
            selectedNum++;
            selectedList.push({
              couponId,
              promotionId: ruleId,
              storeId: this.storeId,
            });
          }
          const val = type === 2 ? value / 100 : value / 10;
          return {
            key: couponId,
            title: name,
            isSelected: false,
            timeLimit: `${dayjs(+startTime).format('YYYY-MM-DD')}-${dayjs(+endTime).format('YYYY-MM-DD')}`,
            value: val,
            status: status === -1 ? 'useless' : 'default',
            desc: condition,
            type,
            tag: '',
          };
        });
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

      const couponSelected = couponsList.filter((coupon) => coupon.isSelected === true);

      this.setData({
        selectedList: [...selectedList, ...couponSelected],
        couponsList: [...couponsList],
      });

      this.triggerEvent('sure', {
        selectedList: [...selectedList, ...couponSelected],
      });
    },
    hide() {
      this.setData({
        couponsShow: false,
      });
    },
    coupons(coupon = {}) {
      return new Promise((resolve, reject) => {
        if (coupon?.selectedCoupons) {
          resolve({
            couponResultList: couponsData.couponResultList,
            reduce: couponsData.reduce,
          });
        }
        return reject({
          couponResultList: [],
          reduce: undefined,
        });
      });
    },
  },
});
