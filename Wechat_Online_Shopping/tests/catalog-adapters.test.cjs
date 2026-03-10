const test = require('node:test');
const assert = require('node:assert/strict');

const {
  adaptProductCollectionResponse,
  DEFAULT_PRODUCT_IMAGE,
} = require('../services/_utils/catalog-adapters');

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
    thumb: DEFAULT_PRODUCT_IMAGE,
    primaryImage: DEFAULT_PRODUCT_IMAGE,
    title: '新疆阿克苏苹果',
    price: 2990,
    minSalePrice: 2990,
    originPrice: 3990,
    maxLinePrice: 3990,
    spuTagList: [{ title: '新品' }, { title: '包邮' }],
  });
});
