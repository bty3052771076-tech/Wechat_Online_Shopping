const test = require('node:test');
const assert = require('node:assert/strict');

const {
  adaptCategoryTreeResponse,
  normalizeImageUrl,
  DEFAULT_PRODUCT_IMAGE,
} = require('../services/_utils/catalog-adapters');
const { buildAdminCategoryOptions } = require('../services/_utils/admin-adapters');
const {
  buildGoodsDetailCartPayload,
  buildCatalogAddCartPayload,
  buildRebuyGoodsRequestList,
} = require('../services/_utils/order-action-helpers');

const PRODUCT_APPLE_IMAGE = '/assets/images/products/apple.png';
const DEFAULT_CATEGORY_IMAGE = '/assets/images/categories/default.png';

test('normalizeImageUrl uses scene-aware mapping for placeholders and defaults', () => {
  assert.equal(normalizeImageUrl('https://example.com/products/apple.jpg', 'product'), PRODUCT_APPLE_IMAGE);
  assert.equal(normalizeImageUrl('https://cdn.example.com/products/apple.jpg', 'product'), PRODUCT_APPLE_IMAGE);
  assert.equal(normalizeImageUrl('', 'product'), DEFAULT_PRODUCT_IMAGE);
  assert.equal(normalizeImageUrl('', 'category'), DEFAULT_CATEGORY_IMAGE);
  assert.equal(
    normalizeImageUrl('https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png'),
    PRODUCT_APPLE_IMAGE,
  );
});

test('adaptCategoryTreeResponse maps backend category tree into goods-category component shape', () => {
  const result = adaptCategoryTreeResponse({
    code: 'Success',
    data: [
      {
        id: 1,
        category_name: '生鲜水果',
        icon_url: 'https://example.com/category-root.png',
        children: [
          {
            id: 11,
            category_name: '苹果',
            icon_url: 'https://example.com/category-child.png',
            children: [],
          },
        ],
      },
    ],
  });

  assert.deepEqual(result, [
    {
      id: 1,
      name: '生鲜水果',
      thumbnail: DEFAULT_CATEGORY_IMAGE,
      disabled: false,
      children: [
        {
          id: 11,
          name: '苹果',
          thumbnail: DEFAULT_CATEGORY_IMAGE,
          disabled: false,
          children: [],
        },
      ],
    },
  ]);
});

test('buildAdminCategoryOptions keeps the current category even when it is absent from stale options', () => {
  const result = buildAdminCategoryOptions(
    [
      { id: 1, category_name: '食品饮料' },
      { id: 2, category_name: '家居生活' },
    ],
    '蔬菜水果',
  );

  assert.deepEqual(result, ['食品饮料', '家居生活', '蔬菜水果']);
});

test('buildGoodsDetailCartPayload uses selected sku and quantity for real add-to-cart requests', () => {
  const result = buildGoodsDetailCartPayload({
    buyNum: 2,
    selectedItem: {
      skuId: 'sku-101',
    },
    details: {
      spuId: 'spu-9',
      skuList: [{ skuId: 'sku-100' }],
    },
  });

  assert.deepEqual(result, {
    skuId: 'sku-101',
    quantity: 2,
  });
});

test('buildCatalogAddCartPayload falls back to the first sku for list-page add-to-cart', () => {
  const payload = buildCatalogAddCartPayload({
    goods: {
      spuId: 'spu-9',
      title: '测试商品',
    },
    details: {
      skuList: [{ skuId: 'sku-100' }, { skuId: 'sku-101' }],
    },
  });

  assert.deepEqual(payload, {
    skuId: 'sku-100',
    quantity: 1,
  });
});

test('buildRebuyGoodsRequestList converts order goods into order-confirm request payload', () => {
  const result = buildRebuyGoodsRequestList({
    storeId: 'default-store',
    storeName: '默认店铺',
    goodsList: [
      {
        spuId: '88',
        skuId: '301',
        title: '测试商品',
        thumb: 'https://example.com/goods.png',
        num: 2,
        price: 2990,
        specs: ['黑色', '256G'],
      },
    ],
  });

  assert.deepEqual(result, [
    {
      storeId: 'default-store',
      storeName: '默认店铺',
      spuId: '88',
      skuId: '301',
      goodsName: '测试商品',
      title: '测试商品',
      quantity: 2,
      price: 2990,
      primaryImage: DEFAULT_PRODUCT_IMAGE,
      thumb: DEFAULT_PRODUCT_IMAGE,
      specInfo: [
        { specTitle: 'spec', specValue: '黑色' },
        { specTitle: 'spec', specValue: '256G' },
      ],
    },
  ]);
});
