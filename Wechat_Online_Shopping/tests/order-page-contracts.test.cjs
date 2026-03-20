const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  buildAfterSaleSubmitPayload,
  buildCouponDialogData,
  buildOrderConfirmCouponDialogState,
  createEmptyAfterServiceDetailViewModel,
  shouldUseCouponDialogMockData,
} = require('../services/_utils/page-contract-helpers');

const orderConfirmPath = path.join(__dirname, '../pages/order/order-confirm/index.js');
const orderConfirmWxmlPath = path.join(__dirname, '../pages/order/order-confirm/index.wxml');
const selectCouponsPath = path.join(__dirname, '../pages/order/components/selectCoupons/selectCoupons.js');

test('buildAfterSaleSubmitPayload uses the selected apply reason type', () => {
  const payload = buildAfterSaleSubmitPayload({
    query: {
      orderNo: 'ORDER-1',
      skuId: 'SKU-1',
      spuId: 'SPU-1',
    },
    serviceType: 20,
    goodsInfo: {
      paidAmountEach: 500,
    },
    serviceFrom: {
      returnNum: 2,
      receiptStatus: { desc: '已收货', status: 1 },
      applyReason: { desc: '商品有瑕疵', type: 3 },
      amount: { current: 888 },
      remark: '请尽快处理',
      rightsImageUrls: ['https://example.com/proof.png'],
    },
  });

  assert.equal(payload.rights.orderNo, 'ORDER-1');
  assert.equal(payload.rights.rightsReasonType, 3);
  assert.equal(payload.rights.rightsType, 20);
  assert.equal(payload.rightsItem[0].itemTotalAmount, 1000);
  assert.equal(payload.rightsItem[0].rightsQuantity, 2);
  assert.equal(payload.refundMemo, '请尽快处理');
});

test('createEmptyAfterServiceDetailViewModel returns binding-safe defaults', () => {
  const detail = createEmptyAfterServiceDetailViewModel();

  assert.equal(detail.statusIcon, '');
  assert.equal(detail.statusName, '');
  assert.equal(detail.statusDesc, '');
  assert.equal(detail.receiverPhone, '');
  assert.equal(detail.receiverAddress, '');
  assert.deepEqual(detail.refundMethodList, []);
  assert.deepEqual(detail.goodsList, []);
  assert.deepEqual(detail.proofs, []);
});

test('buildCouponDialogData keeps preselected coupons and resolves promotionId safely', () => {
  const result = buildCouponDialogData(
    {
      couponResultList: [
        {
          status: 1,
          couponVO: {
            couponId: 11,
            promotionCode: 90,
            condition: '满100可用',
            endTime: 1584530282686,
            name: '折扣券',
            startTime: 1584530282686,
            value: 550,
            type: 2,
          },
        },
      ],
      reduce: 1000,
    },
    '1000',
  );

  assert.equal(result.selectedNum, 1);
  assert.equal(result.couponsList[0].isSelected, true);
  assert.equal(result.selectedList[0].couponId, 11);
  assert.equal(result.selectedList[0].promotionId, 90);
  assert.equal(result.selectedList[0].storeId, '1000');
  assert.equal(result.selectedList[0].status, 'default');
  assert.equal(result.selectedList[0].value, 5.5);
});

test('buildOrderConfirmCouponDialogState selects goods and coupons for the active store', () => {
  const result = buildOrderConfirmCouponDialogState({
    storeId: 'store-b',
    orderCardList: [
      { id: 'store-a', goodsList: [{ skuId: '1' }] },
      { id: 'store-b', goodsList: [{ skuId: '2' }, { skuId: '3' }] },
    ],
    submitCouponList: [
      { storeId: 'store-a', couponList: [{ couponId: 1 }] },
      { storeId: 'store-b', couponList: [{ couponId: 2 }] },
    ],
  });

  assert.equal(result.currentStoreId, 'store-b');
  assert.deepEqual(result.promotionGoodsList, [{ skuId: '2' }, { skuId: '3' }]);
  assert.deepEqual(result.couponList, [{ couponId: 2 }]);
});

test('shouldUseCouponDialogMockData only enables mock coupons for real preselected coupons', () => {
  assert.equal(shouldUseCouponDialogMockData(), false);
  assert.equal(shouldUseCouponDialogMockData([]), false);
  assert.equal(shouldUseCouponDialogMockData([{ couponId: 11 }]), true);
});

test('order-confirm resets note caches before rebuilding store cards', () => {
  const source = fs.readFileSync(orderConfirmPath, 'utf8');

  assert.match(source, /this\.noteInfo\s*=\s*\[\s*\]/);
  assert.match(source, /this\.tempNoteInfo\s*=\s*\[\s*\]/);
});

test('order-confirm coupon row reflects real coupon availability instead of store entry count', () => {
  const source = fs.readFileSync(orderConfirmWxmlPath, 'utf8');

  assert.doesNotMatch(source, /submitCouponList\.length/);
  assert.match(source, /storeGoodsList\[0\]\.couponList/);
});

test('selectCoupons does not inject mock coupons when the store has no selected coupons', () => {
  const source = fs.readFileSync(selectCouponsPath, 'utf8');

  assert.match(source, /shouldUseCouponDialogMockData/);
  assert.doesNotMatch(source, /if\s*\(\s*coupon\?\.\s*selectedCoupons\s*\)/);
});
