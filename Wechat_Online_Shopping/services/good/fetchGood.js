import { config } from '../../config/index';

const { normalizeFenAmount } = require('../_utils/shop-adapters');
const { normalizeImageUrl } = require('../_utils/image-helpers');

function mockFetchGood(ID = 0) {
  const { delay } = require('../_utils/delay');
  const { genGood } = require('../../model/good');

  return delay().then(() => genGood(ID));
}

function normalizeSkuSpecs(specs) {
  if (!specs) {
    return {};
  }

  if (typeof specs === 'object') {
    return specs;
  }

  try {
    return JSON.parse(specs);
  } catch (error) {
    return {};
  }
}

function buildSpecListFromSkus(skus = []) {
  const specMap = {};

  skus.forEach((sku) => {
    Object.entries(normalizeSkuSpecs(sku.specs)).forEach(([specId, value]) => {
      if (!specMap[specId]) {
        specMap[specId] = new Map();
      }

      specMap[specId].set(String(value), String(value));
    });
  });

  return Object.keys(specMap).map((specId) => ({
    specId,
    title: specId,
    specValueList: Array.from(specMap[specId].entries()).map(([specValueId, specValue]) => ({
      specValueId,
      specValue,
    })),
  }));
}

function realFetchGood(ID = 0) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.apiBaseURL}/products/detail/${ID}`,
      method: 'GET',
      success(res) {
        if (!(res.statusCode >= 200 && res.statusCode < 300 && res.data && res.data.data)) {
          reject(res.data || { msg: '获取商品详情失败' });
          return;
        }

        const item = res.data.data;
        const primaryImage = normalizeImageUrl(item.primary_image || '');
        const detailImages =
          Array.isArray(item.detail_images) && item.detail_images.length > 0
            ? item.detail_images.map((image) => normalizeImageUrl(image))
            : primaryImage
              ? [primaryImage]
              : [];
        const skuList = (item.skus || []).map((sku) => {
          const specs = normalizeSkuSpecs(sku.specs);

          return {
            skuId: String(sku.id),
            skuImage: normalizeImageUrl(sku.image || item.primary_image || ''),
            price: normalizeFenAmount(sku.price || 0),
            specInfo: Object.entries(specs).map(([specId, value]) => ({
              specId: String(specId),
              specValueId: String(value),
              specValue: String(value),
              specTitle: null,
            })),
            stockInfo: {
              stockQuantity: sku.stock || 0,
              safeStockQuantity: 0,
              soldQuantity: sku.sales || 0,
            },
          };
        });

        resolve({
          spuId: String(item.id),
          title: item.title || '',
          subtitle: item.subtitle || '',
          primaryImage,
          images: detailImages,
          minSalePrice: normalizeFenAmount(item.min_sale_price || 0),
          maxSalePrice: normalizeFenAmount(item.min_sale_price || 0),
          maxLinePrice: normalizeFenAmount(item.max_line_price || 0),
          soldNum: item.sold_num || 0,
          spuStockQuantity: skuList.reduce((sum, sku) => sum + (sku.stockInfo.stockQuantity || 0), 0),
          isPutOnSale: item.status === 1 ? 1 : 0,
          available: item.status === 1 ? 1 : 0,
          tags: item.tags ? item.tags.split(',').filter(Boolean) : [],
          skuList,
          specList: buildSpecListFromSkus(item.skus || []),
          desc: detailImages,
          spuTagList: [],
        });
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

export function fetchGood(ID = 0) {
  if (config.useMock) {
    return mockFetchGood(ID);
  }

  return realFetchGood(ID);
}
