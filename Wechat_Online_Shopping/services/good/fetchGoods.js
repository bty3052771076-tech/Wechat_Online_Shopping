import { config } from '../../config/index';

const { normalizeImageUrl } = require('../_utils/image-helpers');

function mockFetchGoodsList(pageIndex = 1, pageSize = 20) {
  const { delay } = require('../_utils/delay');
  const { getGoodsList } = require('../../model/goods');

  return delay().then(() =>
    getGoodsList(pageIndex, pageSize).map((item) => ({
      spuId: item.spuId,
      thumb: item.primaryImage,
      title: item.title,
      price: item.minSalePrice,
      originPrice: item.maxLinePrice,
      tags: item.spuTagList.map((tag) => tag.title),
    })),
  );
}

function realFetchGoodsList(pageIndex = 0, pageSize = 20) {
  const page = Math.floor(pageIndex / pageSize) + 1;

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.apiBaseURL}/products/list`,
      method: 'GET',
      data: { page, pageSize },
      success(res) {
        if (!(res.statusCode >= 200 && res.statusCode < 300 && res.data)) {
          reject(res.data);
          return;
        }

        const list = Array.isArray(res.data.data) ? res.data.data : [];
        resolve(
          list.map((item) => ({
            spuId: item.id,
            thumb: normalizeImageUrl(item.primary_image || ''),
            title: item.title || '',
            price: item.min_sale_price || 0,
            originPrice: item.max_line_price || 0,
            tags: item.tags ? item.tags.split(',').filter(Boolean) : [],
          })),
        );
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

export function fetchGoodsList(pageIndex = 1, pageSize = 20) {
  if (config.useMock) {
    return mockFetchGoodsList(pageIndex, pageSize);
  }

  return realFetchGoodsList(pageIndex, pageSize);
}
