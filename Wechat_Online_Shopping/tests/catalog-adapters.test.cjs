const test = require('node:test');
const assert = require('node:assert/strict');

const {
  adaptProductCollectionResponse,
  DEFAULT_PRODUCT_IMAGE,
  adaptCategoryTreeResponse,
} = require('../services/_utils/catalog-adapters');

const PRODUCT_APPLE_IMAGE = '/assets/images/products/apple.png';
const CATEGORY_FRUIT_IMAGE = '/assets/images/categories/fruit.png';
const CATEGORY_MEAT_IMAGE = '/assets/images/categories/meat.png';

test('adaptProductCollectionResponse maps backend product pagination to goods/search shape', () => {
  const result = adaptProductCollectionResponse({
    code: 'Success',
    data: [
      {
        id: 1,
        title: '新疆阿克苏苹果',
        primary_image: 'https://example.com/apple.jpg',
        min_sale_price: '29.90',
        max_line_price: '39.90',
        tags: '新品,包邮',
      },
    ],
    pagination: {
      total: 7,
      page: 1,
      pageSize: 30,
    },
  });

  assert.equal(result.totalCount, 7);
  assert.equal(result.pageNum, 1);
  assert.equal(result.pageSize, 30);
  assert.equal(result.spuList.length, 1);
  assert.deepEqual(result.spuList[0], {
    spuId: 1,
    thumb: PRODUCT_APPLE_IMAGE,
    primaryImage: PRODUCT_APPLE_IMAGE,
    title: '新疆阿克苏苹果',
    price: 2990,
    minSalePrice: 2990,
    originPrice: 3990,
    maxLinePrice: 3990,
    spuTagList: [{ title: '新品' }, { title: '包邮' }],
  });
  assert.notEqual(result.spuList[0].thumb, DEFAULT_PRODUCT_IMAGE);
});

test('adaptCategoryTreeResponse derives distinct child thumbnails when runtime data omits icon_url', () => {
  const result = adaptCategoryTreeResponse({
    code: 'Success',
    data: [
      {
        id: 1,
        category_name: '生鲜食品',
        category_code: 'CATEGORY_FRESH',
        icon_url: '',
        children: [
          {
            id: 4,
            category_name: '蔬菜水果',
            category_code: 'FRESH_FRUIT',
            icon_url: '',
            children: [],
          },
          {
            id: 5,
            category_name: '肉禽蛋品',
            category_code: 'FRESH_MEAT',
            icon_url: '',
            children: [],
          },
        ],
      },
    ],
  });

  assert.equal(result[0].children[0].thumbnail, CATEGORY_FRUIT_IMAGE);
  assert.equal(result[0].children[1].thumbnail, CATEGORY_MEAT_IMAGE);
  assert.notEqual(result[0].children[0].thumbnail, result[0].children[1].thumbnail);
});
