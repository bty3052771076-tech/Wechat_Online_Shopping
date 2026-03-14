const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  normalizeCouponDialogStoreId,
  buildAfterServiceDetailViewModel,
} = require('../services/_utils/page-contract-helpers');

const selectCouponsPath = path.join(__dirname, '../pages/order/components/selectCoupons/selectCoupons.js');
const orderConfirmPath = path.join(__dirname, '../pages/order/order-confirm/index.js');
const afterServiceTemplatePath = path.join(__dirname, '../pages/order/after-service-detail/index.wxml');

test('normalizeCouponDialogStoreId converts nullish values to empty strings', () => {
  assert.equal(normalizeCouponDialogStoreId(null), '');
  assert.equal(normalizeCouponDialogStoreId(undefined), '');
  assert.equal(normalizeCouponDialogStoreId(1001), '1001');
});

test('selectCoupons component data block does not redeclare prop-backed coupon arrays', () => {
  const source = fs.readFileSync(selectCouponsPath, 'utf8');
  const dataBlock = source.split('data: {')[1].split('methods:')[0];

  assert.equal(dataBlock.includes('orderSureCouponList:'), false);
  assert.equal(dataBlock.includes('promotionGoodsList:'), false);
});

test('order-confirm initializes currentStoreId with an empty string', () => {
  const source = fs.readFileSync(orderConfirmPath, 'utf8');

  assert.match(source, /currentStoreId:\s*''/);
});

test('buildAfterServiceDetailViewModel sanitizes null fields before binding to component props', () => {
  const service = buildAfterServiceDetailViewModel(
    {
      rights: {
        rightsNo: 'AS1001',
        storeName: null,
        rightsType: 20,
        rightsStatus: 10,
        userRightsStatus: 100,
        userRightsStatusName: null,
        userRightsStatusDesc: null,
        refundRequestAmount: 2990,
        orderNo: null,
        rightsReasonDesc: null,
        createTime: null,
      },
      rightsItem: [
        {
          goodsPictureUrl: null,
          goodsName: '新疆阿克苏苹果',
          specInfo: [{ specValues: null }],
          itemRefundAmount: 2990,
          rightsQuantity: 1,
        },
      ],
      refundMethodList: [{ refundMethodName: null, refundMethodAmount: null }],
      rightsRefund: { traceNo: null, refundDesc: null },
      logisticsVO: {
        logisticsNo: null,
        logisticsCompanyName: null,
        logisticsCompanyCode: null,
        remark: null,
        receiverName: '张三',
        receiverPhone: '13800138000',
        receiverProvince: '广东省',
        receiverCity: null,
        receiverCountry: null,
        receiverArea: null,
        receiverAddress: '科技园 8 号',
      },
      buttonVOs: null,
    },
    {
      formatTime: () => '2026-03-14 23:10',
      getStatusIcon: () => null,
    },
  );

  assert.equal(service.statusIcon, '');
  assert.equal(service.statusName, '');
  assert.equal(service.statusDesc, '');
  assert.equal(service.orderNo, '');
  assert.equal(service.rightsReasonDesc, '');
  assert.equal(service.logisticsNo, '');
  assert.equal(service.logisticsCompanyName, '');
  assert.equal(service.refundMethodList[0].name, '');
  assert.equal(service.receiverPhone, '13800138000');
  assert.equal(service.receiverAddress, '广东省 科技园 8 号');
});

test('after-service-detail template renders receiverPhone on the phone line', () => {
  const source = fs.readFileSync(afterServiceTemplatePath, 'utf8');

  assert.equal(source.includes('{{service.receiverPhone}}</view>'), true);
});
