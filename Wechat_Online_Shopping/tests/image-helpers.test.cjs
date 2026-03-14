const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeImageUrl } = require('../services/_utils/image-helpers');

const PRODUCT_APPLE_IMAGE = '/assets/images/products/apple.png';
const PRODUCT_CARROT_IMAGE = '/assets/images/products/carrot.png';
const DEFAULT_PRODUCT_IMAGE = '/assets/images/products/default.png';
const DEFAULT_CATEGORY_IMAGE = '/assets/images/categories/default.png';
const DEFAULT_AVATAR_IMAGE = '/assets/images/avatar/default.png';
const DEFAULT_COMMENT_IMAGE = '/assets/images/comments/proof.png';
const BANNER_SPRING_IMAGE = '/assets/images/banners/spring-sale.png';

test('normalizeImageUrl maps different seeded product placeholders to different product images', () => {
  const apple = normalizeImageUrl('https://example.com/products/apple.jpg', 'product');
  const carrot = normalizeImageUrl('https://example.com/products/carrot.jpg', 'product');

  assert.equal(apple, PRODUCT_APPLE_IMAGE);
  assert.equal(carrot, PRODUCT_CARROT_IMAGE);
  assert.notEqual(apple, carrot);
});

test('normalizeImageUrl uses scene-specific defaults instead of a single global image', () => {
  assert.equal(normalizeImageUrl('', 'product'), DEFAULT_PRODUCT_IMAGE);
  assert.equal(normalizeImageUrl('', 'category'), DEFAULT_CATEGORY_IMAGE);
  assert.equal(normalizeImageUrl('', 'avatar'), DEFAULT_AVATAR_IMAGE);
  assert.equal(normalizeImageUrl('', 'comment'), DEFAULT_COMMENT_IMAGE);
});

test('normalizeImageUrl maps banner placeholders to banner assets', () => {
  assert.equal(normalizeImageUrl('https://example.com/banners/spring-sale.jpg', 'banner'), BANNER_SPRING_IMAGE);
});

test('normalizeImageUrl keeps packaged asset paths instead of falling back to remote defaults', () => {
  assert.equal(normalizeImageUrl('/assets/images/products/apple.png', 'product'), PRODUCT_APPLE_IMAGE);
  assert.equal(normalizeImageUrl('/assets/images/categories/fresh.png', 'category'), '/assets/images/categories/fresh.png');
});

test('normalizeImageUrl replaces retired tdesign product URLs with packaged semantic assets', () => {
  assert.equal(
    normalizeImageUrl('https://tdesign.gtimg.com/miniprogram/template/retail/goods/sp-1a.png', 'product'),
    PRODUCT_CARROT_IMAGE,
  );
});
