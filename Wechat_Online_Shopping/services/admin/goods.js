import { config } from '../../config/index';
import { buildAuthHeader } from '../_utils/auth';
import {
  adaptAdminGoodsListResponse,
  adaptAdminGoodsDetailResponse,
  buildAdminGoodsPayload,
  buildAdminCategoryOptions,
} from '../_utils/admin-adapters';

const { delay } = require('../_utils/delay');
const { getRequestErrorMessage, requestJson } = require('../_utils/request');
const {
  getAdminGoodsList,
  getAdminGoodsDetail,
  addAdminGoods,
  updateAdminGoods,
  deleteAdminGoods,
} = require('../../model/admin-goods');

function showRequestError(err) {
  wx.showToast({
    title: getRequestErrorMessage(err),
    icon: 'none',
  });
}

function fetchCategories() {
  return requestJson({
    url: `${config.apiBaseURL}/products/categories/list`,
    method: 'GET',
    header: {
      ...buildAuthHeader('adminToken'),
    },
  }).then((response) => (Array.isArray(response.data) ? response.data : []));
}

export function fetchAdminGoodsCategories(currentCategory = '') {
  if (config.useMock) {
    return delay().then(() =>
      buildAdminCategoryOptions(
        [
          { category_name: '电子产品' },
          { category_name: '服装鞋包' },
          { category_name: '食品饮料' },
          { category_name: '家居生活' },
          { category_name: '美妆护肤' },
          { category_name: '运动户外' },
        ],
        currentCategory,
      ),
    );
  }

  return fetchCategories().then((categories) => buildAdminCategoryOptions(categories, currentCategory));
}

export function fetchAdminGoodsList(keyword) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      data: getAdminGoodsList(keyword),
    }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/products`,
    method: 'GET',
    data: { keyword },
    header: {
      ...buildAuthHeader('adminToken'),
    },
  })
    .then((response) => ({
      ...response,
      data: adaptAdminGoodsListResponse(response),
    }))
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function fetchAdminGoodsDetail(id) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      data: getAdminGoodsDetail(id),
    }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/products/${id}`,
    method: 'GET',
    header: {
      ...buildAuthHeader('adminToken'),
    },
  })
    .then((response) => ({
      ...response,
      data: adaptAdminGoodsDetailResponse(response),
    }))
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function createAdminGoods(goods) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      data: addAdminGoods(goods),
      msg: '添加成功',
    }));
  }

  return fetchCategories()
    .then((categories) =>
      requestJson({
        url: `${config.apiBaseURL}/admin/products`,
        method: 'POST',
        data: buildAdminGoodsPayload(goods, categories),
        header: {
          ...buildAuthHeader('adminToken'),
          'Content-Type': 'application/json',
        },
      }),
    )
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function editAdminGoods(id, goods) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      data: updateAdminGoods(id, goods),
      msg: '修改成功',
    }));
  }

  return fetchCategories()
    .then((categories) =>
      requestJson({
        url: `${config.apiBaseURL}/admin/products/${id}`,
        method: 'PUT',
        data: buildAdminGoodsPayload(goods, categories),
        header: {
          ...buildAuthHeader('adminToken'),
          'Content-Type': 'application/json',
        },
      }),
    )
    .catch((err) => {
      showRequestError(err);
      return Promise.reject(err);
    });
}

export function removeAdminGoods(id) {
  if (config.useMock) {
    return delay().then(() => ({
      code: 'Success',
      data: deleteAdminGoods(id),
      msg: '删除成功',
    }));
  }

  return requestJson({
    url: `${config.apiBaseURL}/admin/products/${id}`,
    method: 'DELETE',
    header: {
      ...buildAuthHeader('adminToken'),
    },
  }).catch((err) => {
    showRequestError(err);
    return Promise.reject(err);
  });
}
