const test = require('node:test');
const assert = require('node:assert/strict');

const {
  adaptAdminGoodsListResponse,
  adaptAdminGoodsDetailResponse,
  buildAdminGoodsPayload,
  adaptAdminOrderListResponse,
  adaptAdminOrderDetailResponse,
  adaptAdminUsersListResponse,
  adaptAdminUserDetailResponse,
  buildAdminCategoryOptions,
} = require('../services/_utils/admin-adapters');
const { DEFAULT_PRODUCT_IMAGE } = require('../services/_utils/catalog-adapters');

const PRODUCT_APPLE_IMAGE = '/assets/images/products/apple.png';
const DEFAULT_AVATAR_IMAGE = '/assets/images/avatar/default.png';

test('adaptAdminGoodsListResponse maps backend products to admin goods cards', () => {
  const result = adaptAdminGoodsListResponse({
    code: 'Success',
    data: [
      {
        id: 3,
        title: '智利车厘子',
        brand: '果园直发',
        primary_image: 'https://example.com/cherry.jpg',
        min_sale_price: '59.90',
        total_stock: 8,
        category: {
          category_name: '食品饮料',
        },
        skus: [{ specs: { weight: '2kg' } }],
      },
    ],
  });

  assert.deepEqual(result, [
    {
      id: 3,
      name: '智利车厘子',
      category: '食品饮料',
      image: DEFAULT_PRODUCT_IMAGE,
      spec: '2kg',
      brand: '果园直发',
      price: 5990,
      stock: 8,
      productionDate: '',
      shelfLife: '',
    },
  ]);
});

test('adaptAdminGoodsDetailResponse maps backend detail to simplified admin form data', () => {
  const result = adaptAdminGoodsDetailResponse({
    code: 'Success',
    data: {
      id: 5,
      title: '云南蓝莓',
      brand: '山野鲜果',
      primary_image: 'https://example.com/berry.jpg',
      product_detail: JSON.stringify({
        spec: '125g*4盒',
        productionDate: '2026-03-01',
        shelfLife: '7天',
      }),
      category: {
        category_name: '食品饮料',
      },
      skus: [
        {
          price: '39.90',
          stock: 12,
          specs: {
            package: '125g*4盒',
          },
        },
      ],
    },
  });

  assert.deepEqual(result, {
    id: 5,
    name: '云南蓝莓',
    category: '食品饮料',
    image: DEFAULT_PRODUCT_IMAGE,
    spec: '125g*4盒',
    brand: '山野鲜果',
    productionDate: '2026-03-01',
    shelfLife: '7天',
    price: 3990,
    stock: 12,
  });
});

test('buildAdminGoodsPayload maps simplified admin form to backend product payload', () => {
  const result = buildAdminGoodsPayload(
    {
      name: '有机番茄',
      category: '食品饮料',
      image: 'https://example.com/tomato.jpg',
      spec: '500g',
      brand: '农场优选',
      productionDate: '2026-03-09',
      shelfLife: '5天',
      price: 1290,
      stock: 30,
    },
    [
      { id: 11, category_name: '食品饮料' },
      { id: 12, category_name: '家居生活' },
    ],
  );

  assert.equal(result.title, '有机番茄');
  assert.equal(result.categoryId, 11);
  assert.equal(result.primaryImage, 'https://example.com/tomato.jpg');
  assert.equal(result.skus.length, 1);
  assert.equal(result.skus[0].price, 12.9);
  assert.equal(result.skus[0].stock, 30);
  assert.deepEqual(JSON.parse(result.productDetail), {
    spec: '500g',
    productionDate: '2026-03-09',
    shelfLife: '5天',
  });
});

test('buildAdminCategoryOptions deduplicates categories and preserves the current category', () => {
  const result = buildAdminCategoryOptions(
    [
      { id: 11, category_name: '食品饮料' },
      { id: 12, category_name: '食品饮料' },
      { id: 13, category_name: '家居生活' },
    ],
    '蔬菜水果',
  );

  assert.deepEqual(result, ['食品饮料', '家居生活', '蔬菜水果']);
});

test('adaptAdminOrderListResponse maps backend order list to admin order cards', () => {
  const result = adaptAdminOrderListResponse({
    code: 'Success',
    data: [
      {
        id: 9,
        order_no: 'ORDER123',
        order_status: 2,
        total_amount: '29.90',
        receiver_name: '张三',
        receiver_phone: '13800138000',
        created_at: '2026-03-07T09:40:00.000Z',
        user: {
          username: 'testuser',
          nickname: '测试用户',
        },
        previewItem: {
          product_title: '新疆阿克苏苹果',
          quantity: 1,
        },
      },
    ],
  });

  assert.deepEqual(result, [
    {
      id: 9,
      orderNo: 'ORDER123',
      status: 10,
      statusName: '待发货',
      userName: '测试用户',
      phone: '13800138000',
      address: '',
      createTime: '2026-03-07 09:40:00',
      totalAmount: 2990,
      freightFee: 0,
      remark: '',
      goodsList: [{ name: '新疆阿克苏苹果', quantity: 1 }],
      expressCompany: '',
      expressNo: '',
    },
  ]);
});

test('adaptAdminOrderDetailResponse maps backend order detail to admin detail page shape', () => {
  const result = adaptAdminOrderDetailResponse({
    code: 'Success',
    data: {
      id: 9,
      order_no: 'ORDER123',
      order_status: 3,
      total_amount: '29.90',
      delivery_fee: '0.00',
      order_remark: '尽快发货',
      receiver_name: '张三',
      receiver_phone: '13800138000',
      receiver_address: '广东省深圳市南山区科技园 8 号',
      created_at: '2026-03-07T09:40:00.000Z',
      delivery_company: '顺丰速运',
      delivery_no: 'SF123456',
      items: [
        {
          product_title: '新疆阿克苏苹果',
          product_image: 'https://example.com/apple.jpg',
          sku_spec_info: '{"size":"小果"}',
          price: '29.90',
          quantity: 1,
        },
      ],
    },
  });

  assert.equal(result.orderNo, 'ORDER123');
  assert.equal(result.status, 40);
  assert.equal(result.statusName, '待收货');
  assert.equal(result.userName, '张三');
  assert.equal(result.phone, '13800138000');
  assert.equal(result.address, '广东省深圳市南山区科技园 8 号');
  assert.equal(result.goodsList[0].spec, '小果');
  assert.equal(result.goodsList[0].image, PRODUCT_APPLE_IMAGE);
  assert.equal(result.expressCompany, '顺丰速运');
  assert.equal(result.expressNo, 'SF123456');
});

test('adaptAdminUsersListResponse maps backend users to admin list cards', () => {
  const result = adaptAdminUsersListResponse({
    code: 'Success',
    data: [
      {
        id: 7,
        nickname: '测试用户',
        avatar_url: 'https://example.com/u.jpg',
        phone: '13800138000',
        total_orders: 3,
        total_spent: '99.50',
        register_time: '2026-03-01T08:00:00.000Z',
        remark: 'VIP客户',
      },
    ],
  });

  assert.deepEqual(result, [
    {
      id: 7,
      nickName: '测试用户',
      avatarUrl: DEFAULT_AVATAR_IMAGE,
      phoneNumber: '13800138000',
      totalOrders: 3,
      totalSpent: 9950,
      registerTime: '2026-03-01 08:00:00',
      remark: 'VIP客户',
    },
  ]);
});

test('adaptAdminUserDetailResponse maps backend user detail to admin detail page shape', () => {
  const result = adaptAdminUserDetailResponse({
    code: 'Success',
    data: {
      id: 7,
      nickname: '测试用户',
      avatar_url: 'https://example.com/u.jpg',
      phone: '13800138000',
      email: 'test@example.com',
      total_orders: 3,
      total_spent: '99.50',
      register_time: '2026-03-01T08:00:00.000Z',
      remark: 'VIP客户',
      orderHistory: [
        {
          order_no: 'ORDER123',
          order_status: 3,
          total_amount: '29.90',
          created_at: '2026-03-07T09:40:00.000Z',
        },
      ],
    },
  });

  assert.equal(result.id, 7);
  assert.equal(result.nickName, '测试用户');
  assert.equal(result.avatarUrl, DEFAULT_AVATAR_IMAGE);
  assert.equal(result.totalSpent, 9950);
  assert.equal(result.orderHistory.length, 1);
  assert.equal(result.orderHistory[0].orderNo, 'ORDER123');
  assert.equal(result.orderHistory[0].statusName, '待收货');
});
