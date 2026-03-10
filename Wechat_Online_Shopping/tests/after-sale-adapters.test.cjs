const test = require('node:test');
const assert = require('node:assert/strict');

const {
  adaptRightsListResponse,
  adaptRightsDetailResponse,
  buildAfterSalePreviewResponse,
  buildAfterSaleApplyPayload,
  buildAfterSaleLogisticsPayload,
  buildAfterSaleReasonResponse,
} = require('../services/_utils/after-sale-adapters');

test('adaptRightsListResponse maps backend after-sales list to legacy page payload', () => {
  const response = {
    code: 'Success',
    data: {
      list: [
        {
          rightsNo: 'AS1001',
          orderNo: 'ORDER1001',
          storeId: 'shop-1',
          storeName: '默认店铺',
          rightsType: 10,
          rightsStatus: 10,
          userRightsStatus: 100,
          userRightsStatusName: '待商家审核',
          userRightsStatusDesc: '商家将在 24 小时内审核',
          afterSaleRequireType: 'REFUND_GOODS_MONEY',
          refundAmount: 2990,
          refundRequestAmount: 2990,
          rightsReasonDesc: '商品有瑕疵',
          rightsImageUrls: ['https://example.com/proof.png'],
          createTime: '2026-03-09 18:00:00',
          buttonVOs: [{ type: 2, name: '撤销申请', primary: false }],
          goodsItems: [
            {
              skuId: 301,
              spuId: 88,
              goodsName: '测试商品',
              goodsPictureUrl: 'https://example.com/goods.png',
              specInfo: [{ specTitle: '颜色', specValues: '黑色' }],
              itemRefundAmount: 2990,
              rightsQuantity: 1,
            },
          ],
          logisticsVO: {
            logisticsNo: '',
            logisticsCompanyCode: '',
            logisticsCompanyName: '',
            remark: '',
            receiverName: '张三',
            receiverPhone: '13800138000',
            receiverProvince: '广东省',
            receiverCity: '深圳市',
            receiverCountry: '南山区',
            receiverArea: '',
            receiverAddress: '科技园 8 栋',
          },
          rightsRefund: {
            traceNo: 'TRACE1001',
            refundDesc: '商品瑕疵',
          },
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
      },
      states: {
        audit: 1,
        approved: 0,
        complete: 0,
        closed: 0,
      },
    },
  };

  const result = adaptRightsListResponse(response);

  assert.equal(result.code, 'Success');
  assert.equal(result.data.pageNum, 1);
  assert.equal(result.data.totalCount, 1);
  assert.equal(result.data.states.audit, 1);
  assert.equal(result.data.dataList.length, 1);
  assert.equal(result.data.dataList[0].rights.rightsNo, 'AS1001');
  assert.equal(result.data.dataList[0].rightsItem[0].goodsName, '测试商品');
  assert.equal(result.data.dataList[0].rightsItem[0].specInfo[0].specValues, '黑色');
  assert.equal(result.data.dataList[0].rightsItem[0].rightsQuantity, 1);
  assert.match(String(result.data.dataList[0].rights.createTime), /^\d+$/);
  assert.equal(result.data.dataList[0].logisticsVO.receiverName, '张三');
});

test('adaptRightsDetailResponse exposes detail payload as a single-item list', () => {
  const response = {
    code: 'Success',
    data: {
      rightsNo: 'AS1002',
      orderNo: 'ORDER1002',
      storeId: 'shop-1',
      storeName: '默认店铺',
      rightsType: 20,
      rightsStatus: 50,
      userRightsStatus: 160,
      userRightsStatusName: '已退款',
      userRightsStatusDesc: '退款已原路返回',
      afterSaleRequireType: 'REFUND_MONEY',
      refundAmount: 1990,
      refundRequestAmount: 1990,
      rightsReasonDesc: '不想要了',
      rightsImageUrls: [],
      createTime: '2026-03-09 18:10:00',
      buttonVOs: [],
      goodsItems: [],
      logisticsVO: {
        logisticsNo: 'SF1002',
        logisticsCompanyCode: 'SF',
        logisticsCompanyName: '顺丰速运',
        remark: '上门取件',
        receiverName: '张三',
        receiverPhone: '13800138000',
        receiverProvince: '广东省',
        receiverCity: '深圳市',
        receiverCountry: '南山区',
        receiverArea: '',
        receiverAddress: '科技园 8 栋',
      },
      rightsRefund: {
        traceNo: 'TRACE1002',
        refundDesc: '退款成功',
      },
    },
  };

  const result = adaptRightsDetailResponse(response);

  assert.equal(result.code, 'Success');
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].rights.rightsNo, 'AS1002');
  assert.equal(result.data[0].logisticsVO.logisticsNo, 'SF1002');
});

test('buildAfterSalePreviewResponse maps backend preview to legacy apply-service payload', () => {
  const response = {
    code: 'Success',
    data: {
      spuId: 88,
      skuId: 301,
      paidAmountEach: 2990,
      boughtQuantity: 2,
      refundableAmount: 2990,
      shippingFeeIncluded: 0,
      numOfSku: 1,
      numOfSkuAvailable: 2,
      goodsInfo: {
        goodsName: '测试商品',
        skuImage: 'https://example.com/goods.png',
        specInfo: [
          { specTitle: '颜色', specValue: '黑色' },
          { specTitle: '容量', specValue: '256G' },
        ],
      },
    },
  };

  const result = buildAfterSalePreviewResponse(response);

  assert.equal(result.data.spuId, 88);
  assert.equal(result.data.goodsInfo.goodsName, '测试商品');
  assert.equal(result.data.goodsInfo.specInfo.length, 2);
  assert.equal(result.data.refundableAmount, 2990);
});

test('buildAfterSaleApplyPayload converts apply-service form payload to backend contract', () => {
  const payload = buildAfterSaleApplyPayload({
    rights: {
      orderNo: 'ORDER1003',
      refundRequestAmount: 2990,
      rightsImageUrls: ['https://example.com/proof.png'],
      rightsReasonDesc: '商品有瑕疵',
      rightsReasonType: 2,
      rightsType: 10,
    },
    rightsItem: [
      {
        itemTotalAmount: 2990,
        rightsQuantity: 1,
        skuId: 301,
        spuId: 88,
      },
    ],
    refundMemo: '尽快处理',
  });

  assert.deepEqual(payload, {
    orderNo: 'ORDER1003',
    refundRequestAmount: 2990,
    rightsImageUrls: ['https://example.com/proof.png'],
    rightsReasonDesc: '商品有瑕疵',
    rightsReasonType: 2,
    rightsType: 10,
    refundMemo: '尽快处理',
    items: [
      {
        itemTotalAmount: 2990,
        rightsQuantity: 1,
        skuId: 301,
        spuId: 88,
      },
    ],
  });
});

test('buildAfterSaleLogisticsPayload normalizes fill-tracking form payload', () => {
  const payload = buildAfterSaleLogisticsPayload({
    rightsNo: 'AS1004',
    logisticsCompanyCode: 'SF',
    logisticsCompanyName: '顺丰速运',
    logisticsNo: 'SF123456789',
    remark: '上门取件',
  });

  assert.deepEqual(payload, {
    logisticsCompanyCode: 'SF',
    logisticsCompanyName: '顺丰速运',
    logisticsNo: 'SF123456789',
    remark: '上门取件',
  });
});

test('buildAfterSaleReasonResponse maps backend reasons list to legacy payload', () => {
  const result = buildAfterSaleReasonResponse({
    code: 'Success',
    data: {
      rightsReasonList: [
        { id: 1, desc: '商品有瑕疵' },
        { id: 2, desc: '不想要了' },
      ],
    },
  });

  assert.equal(result.code, 'Success');
  assert.equal(result.data.rightsReasonList.length, 2);
  assert.equal(result.data.rightsReasonList[0].desc, '商品有瑕疵');
});
