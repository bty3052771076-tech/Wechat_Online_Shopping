const test = require('node:test');
const assert = require('node:assert/strict');

const {
  adaptCartListResponse,
  adaptAddressListResponse,
  buildAddressPayload,
  buildSettleDetailResponse,
  buildCreateOrderPayload,
  adaptOrderListResponse,
  buildOrderCountsResponse,
  adaptOrderDetailResponse,
  adaptOrderSubmitResponse,
  pickDefaultAddress,
} = require('../services/_utils/shop-adapters');

const PRODUCT_APPLE_IMAGE = '/assets/images/products/apple.png';

test('adaptCartListResponse maps backend cart payload to cart page shape', () => {
  const response = {
    code: 'Success',
    data: {
      items: [
        {
          id: 12,
          sku_id: 301,
          quantity: 2,
          is_checked: 1,
          sku: {
            id: 301,
            sku_name: '曜石黑 / 256G',
            price: '199.50',
            line_price: '299.00',
            stock: 8,
            specs: {
              color: '曜石黑',
              size: '256G',
            },
            spu: {
              id: 88,
              title: '测试手机',
              primary_image: 'https://example.com/p1.png',
            },
          },
        },
      ],
      summary: {
        totalAmount: '399.00',
        totalQuantity: 2,
      },
    },
  };

  const result = adaptCartListResponse(response);

  assert.equal(result.data.storeGoods.length, 1);
  assert.equal(result.data.storeGoods[0].promotionGoodsList[0].goodsPromotionList.length, 1);
  assert.equal(result.data.storeGoods[0].promotionGoodsList[0].goodsPromotionList[0].cartId, 12);
  assert.equal(result.data.storeGoods[0].promotionGoodsList[0].goodsPromotionList[0].price, 19950);
  assert.equal(result.data.storeGoods[0].promotionGoodsList[0].goodsPromotionList[0].originPrice, 29900);
  assert.deepEqual(result.data.storeGoods[0].promotionGoodsList[0].goodsPromotionList[0].specInfo, [
    { specTitle: 'color', specValue: '曜石黑' },
    { specTitle: 'size', specValue: '256G' },
  ]);
  assert.equal(result.data.storeGoods[0].promotionGoodsList[0].goodsPromotionList[0].thumb, PRODUCT_APPLE_IMAGE);
  assert.equal(result.data.storeGoods[0].promotionGoodsList[0].goodsPromotionList[0].primaryImage, PRODUCT_APPLE_IMAGE);
  assert.equal(result.data.selectedGoodsCount, 2);
  assert.equal(result.data.totalAmount, 39900);
  assert.equal(result.data.isAllSelected, true);
});

test('adaptAddressListResponse maps backend addresses to legacy page shape', () => {
  const response = {
    code: 'Success',
    data: [
      {
        id: 7,
        receiver_name: '张三',
        receiver_phone: '13800138000',
        province_code: '440000',
        province_name: '广东省',
        city_code: '440300',
        city_name: '深圳市',
        district_code: '440305',
        district_name: '南山区',
        detail_address: '科技园 8 栋',
        is_default: 1,
      },
    ],
  };

  const result = adaptAddressListResponse(response);

  assert.equal(result.length, 1);
  assert.equal(result[0].addressId, '7');
  assert.equal(result[0].name, '张三');
  assert.equal(result[0].phoneNumber, '13800138000');
  assert.equal(result[0].address, '广东省深圳市南山区科技园 8 栋');
  assert.equal(result[0].isDefault, 1);
});

test('buildAddressPayload converts edit form state to backend payload', () => {
  const payload = buildAddressPayload({
    name: '李四',
    phone: '13900139000',
    provinceCode: '310000',
    provinceName: '上海市',
    cityCode: '310100',
    cityName: '上海市',
    districtCode: '310115',
    districtName: '浦东新区',
    detailAddress: '张江路 100 号',
    isDefault: true,
  });

  assert.deepEqual(payload, {
    receiverName: '李四',
    receiverPhone: '13900139000',
    provinceCode: '310000',
    provinceName: '上海市',
    cityCode: '310100',
    cityName: '上海市',
    districtCode: '310115',
    districtName: '浦东新区',
    detailAddress: '张江路 100 号',
    isDefault: 1,
  });
});

test('buildSettleDetailResponse builds order-confirm data from selected goods and address', () => {
  const response = buildSettleDetailResponse({
    goodsRequestList: [
      {
        storeId: 'default-store',
        storeName: '默认店铺',
        spuId: '88',
        skuId: '301',
        title: '测试手机',
        primaryImage: 'https://example.com/p1.png',
        quantity: 2,
        price: 19950,
        specInfo: [
          { specTitle: 'color', specValue: '曜石黑' },
          { specTitle: 'size', specValue: '256G' },
        ],
      },
    ],
    userAddressReq: {
      id: '7',
      addressId: '7',
      name: '张三',
      phone: '13800138000',
      provinceName: '广东省',
      cityName: '深圳市',
      districtName: '南山区',
      detailAddress: '科技园 8 栋',
    },
  });

  assert.equal(response.code, 'Success');
  assert.equal(response.data.settleType, 1);
  assert.equal(response.data.totalGoodsCount, 2);
  assert.equal(response.data.totalSalePrice, 39900);
  assert.equal(response.data.totalPayAmount, 39900);
  assert.equal(response.data.storeGoodsList.length, 1);
  assert.deepEqual(response.data.storeGoodsList[0].skuDetailVos[0].skuSpecLst, [
    { specTitle: 'color', specValue: '曜石黑' },
    { specTitle: 'size', specValue: '256G' },
  ]);
});

test('buildCreateOrderPayload converts order-confirm params to backend payload', () => {
  const payload = buildCreateOrderPayload({
    goodsRequestList: [
      { skuId: '301', quantity: 2 },
      { skuId: '302', quantity: 1 },
    ],
    userAddressReq: {
      addressId: '7',
    },
    storeInfoList: [
      { remark: '工作日送达' },
      { remark: '' },
    ],
  });

  assert.deepEqual(payload, {
    addressId: '7',
    deliveryFee: 0,
    remark: '工作日送达',
    items: [
      { skuId: '301', quantity: 2 },
      { skuId: '302', quantity: 1 },
    ],
  });
});

test('adaptOrderListResponse maps backend orders to legacy order-list shape', () => {
  const response = {
    code: 'Success',
    data: {
      list: [
        {
          id: 9,
          order_no: 'ORDER123',
          order_status: 1,
          total_amount: '29.90',
          discount_amount: '0.00',
          delivery_fee: '0.00',
          pay_amount: '29.90',
          order_remark: '尽快发货',
          created_at: '2026-03-07T09:40:00.000Z',
          previewItem: {
            id: 21,
            spu_id: 1,
            sku_id: 1,
            product_title: '新疆阿克苏苹果',
            product_image: 'https://example.com/apple.jpg',
            sku_spec_info: '{"size":"小果"}',
            price: '29.90',
            quantity: 1,
          },
        },
      ],
    },
  };

  const result = adaptOrderListResponse(response);

  assert.equal(result.data.orders.length, 1);
  assert.equal(result.data.orders[0].orderNo, 'ORDER123');
  assert.equal(result.data.orders[0].orderStatus, 5);
  assert.equal(result.data.orders[0].paymentAmount, 2990);
  assert.equal(result.data.orders[0].orderItemVOs[0].actualPrice, 2990);
  assert.equal(result.data.orders[0].orderItemVOs[0].goodsPictureUrl, PRODUCT_APPLE_IMAGE);
  assert.deepEqual(result.data.orders[0].buttonVOs.map((button) => button.type), [2, 1]);
});

test('buildOrderCountsResponse aggregates backend status counts for order tabs', () => {
  const response = {
    code: 'Success',
    data: {
      list: [
        { order_status: 1 },
        { order_status: 1 },
        { order_status: 3 },
        { order_status: 4 },
      ],
    },
  };

  const result = buildOrderCountsResponse(response);

  assert.deepEqual(result.data, [
    { tabType: 5, orderNum: 2 },
    { tabType: 40, orderNum: 1 },
    { tabType: 60, orderNum: 1 },
  ]);
});

test('adaptOrderDetailResponse maps backend order detail to legacy detail shape', () => {
  const response = {
    code: 'Success',
    data: {
      id: 9,
      order_no: 'ORDER123',
      order_status: 3,
      total_amount: '29.90',
      discount_amount: '0.00',
      delivery_fee: '0.00',
      pay_amount: '29.90',
      receiver_name: '张三',
      receiver_phone: '13800138000',
      receiver_address: '广东省深圳市南山区科技园 8 栋',
      order_remark: '尽快发货',
      created_at: '2026-03-07T09:40:00.000Z',
      delivery_no: 'SF123456',
      delivery_company: '顺丰',
      items: [
        {
          id: 21,
          spu_id: 1,
          sku_id: 1,
          product_title: '新疆阿克苏苹果',
          product_image: 'https://example.com/apple.jpg',
          sku_spec_info: '{"size":"小果"}',
          price: '29.90',
          quantity: 1,
          total_amount: '29.90',
        },
      ],
    },
  };

  const result = adaptOrderDetailResponse(response);

  assert.equal(result.data.orderNo, 'ORDER123');
  assert.equal(result.data.orderStatus, 40);
  assert.equal(result.data.paymentVO.amount, 2990);
  assert.equal(result.data.logisticsVO.receiverName, '张三');
  assert.equal(result.data.logisticsVO.logisticsNo, 'SF123456');
  assert.equal(result.data.orderItemVOs[0].actualPrice, 2990);
  assert.equal(result.data.orderItemVOs[0].goodsPictureUrl, PRODUCT_APPLE_IMAGE);
  assert.deepEqual(result.data.buttonVOs.map((button) => button.type), [3]);
});

test('adaptOrderDetailResponse exposes rebuy for completed orders', () => {
  const response = {
    code: 'Success',
    data: {
      id: 12,
      order_no: 'ORDERCOMPLETED',
      order_status: 5,
      total_amount: '29.90',
      discount_amount: '0.00',
      delivery_fee: '0.00',
      pay_amount: '29.90',
      receiver_name: '张三',
      receiver_phone: '13800138000',
      receiver_address: '北京市朝阳区测试路 1 号',
      order_remark: '',
      created_at: '2026-03-07T09:40:00.000Z',
      items: [
        {
          id: 31,
          spu_id: 1,
          sku_id: 1,
          product_title: '新疆阿克苏苹果',
          product_image: 'https://example.com/apple.jpg',
          sku_spec_info: '{"size":"小果"}',
          price: '29.90',
          quantity: 1,
          total_amount: '29.90',
        },
      ],
    },
  };

  const result = adaptOrderDetailResponse(response);

  assert.equal(result.data.orderStatus, 50);
  assert.deepEqual(result.data.buttonVOs.map((button) => button.type), [9]);
});

test('adaptOrderDetailResponse maps backend cancelled status to cancelled tab', () => {
  const response = {
    code: 'Success',
    data: {
      id: 13,
      order_no: 'ORDERCANCELLED',
      order_status: 6,
      total_amount: '29.90',
      discount_amount: '0.00',
      delivery_fee: '0.00',
      pay_amount: '29.90',
      receiver_name: '张三',
      receiver_phone: '13800138000',
      receiver_address: '北京市朝阳区测试路 1 号',
      order_remark: '',
      created_at: '2026-03-07T09:40:00.000Z',
      items: [],
    },
  };

  const result = adaptOrderDetailResponse(response);

  assert.equal(result.data.orderStatus, 80);
  assert.deepEqual(result.data.buttonVOs.map((button) => button.type), [9]);
});

test('adaptOrderSubmitResponse marks backend order creation as submit-only flow', () => {
  const result = adaptOrderSubmitResponse({
    code: 'Success',
    data: {
      id: 10,
      order_no: 'ORDER123',
    },
  });

  assert.equal(result.data.tradeNo, 'ORDER123');
  assert.equal(result.data.interactId, '10');
  assert.equal(result.data.channel, 'order_submit');
});

test('pickDefaultAddress prefers default address and falls back to first item', () => {
  const address = pickDefaultAddress([
    { id: 1, is_default: 0, receiver_name: '张三' },
    { id: 2, is_default: 1, receiver_name: '李四' },
  ]);

  assert.equal(address.id, 2);

  const fallback = pickDefaultAddress([
    { id: 3, is_default: 0, receiver_name: '王五' },
    { id: 4, is_default: 0, receiver_name: '赵六' },
  ]);

  assert.equal(fallback.id, 3);
  assert.equal(pickDefaultAddress([]), null);
});
