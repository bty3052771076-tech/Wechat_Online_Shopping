const { normalizeFenAmount } = require('./shop-adapters');
const { IMAGE_SCENES, normalizeImageUrl } = require('./image-helpers');

const BACKEND_TO_ADMIN_STATUS = {
  1: 5,
  2: 10,
  3: 40,
  4: 50,
  5: 50,
  6: 80,
};

function formatDateTime(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
    if (isoMatch) {
      return `${isoMatch[1]} ${isoMatch[2]}`;
    }

    return value.replace('T', ' ').replace(/\.\d+Z?$/, '');
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 19).replace('T', ' ');
  }

  return String(value);
}

function parseMaybeJson(value, fallback = null) {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function firstSpecText(source = {}) {
  if (typeof source === 'string') {
    return source;
  }

  const values = Object.values(source || {}).map((value) => String(value).trim()).filter(Boolean);
  return values.join(' / ');
}

function mapAdminStatus(status) {
  return BACKEND_TO_ADMIN_STATUS[Number(status)] || 80;
}

function getAdminStatusName(status) {
  switch (mapAdminStatus(status)) {
    case 5:
      return '待付款';
    case 10:
      return '待发货';
    case 40:
      return '待收货';
    case 50:
      return '已完成';
    default:
      return '已关闭';
  }
}

function deriveGoodsExtraFields(product = {}, firstSku = {}) {
  const detail = parseMaybeJson(product.product_detail, {}) || {};
  const specFromSku = firstSpecText(parseMaybeJson(firstSku.specs, firstSku.specs) || {});

  return {
    spec: detail.spec || specFromSku || '',
    productionDate: detail.productionDate || '',
    shelfLife: detail.shelfLife || '',
  };
}

function buildAdminCategoryOptions(categories = [], currentCategory = '') {
  const values = categories
    .map((item) => (item && item.category_name ? String(item.category_name).trim() : ''))
    .filter(Boolean);

  const deduped = Array.from(new Set(values));
  const normalizedCurrent = String(currentCategory || '').trim();

  if (normalizedCurrent && !deduped.includes(normalizedCurrent)) {
    deduped.push(normalizedCurrent);
  }

  return deduped;
}

function adaptAdminGoodsListResponse(response = {}) {
  const list = Array.isArray(response.data) ? response.data : [];

  return list.map((item) => {
    const firstSku = Array.isArray(item.skus) && item.skus.length > 0 ? item.skus[0] : {};
    const extraFields = deriveGoodsExtraFields(item, firstSku);

    return {
      id: item.id,
      name: item.title || '',
      category: item.category && item.category.category_name ? item.category.category_name : '',
      image: normalizeImageUrl(item.primary_image || '', IMAGE_SCENES.product),
      spec: extraFields.spec,
      brand: item.brand || '',
      price: normalizeFenAmount(item.min_sale_price || firstSku.price || 0),
      stock: Number(item.total_stock || firstSku.stock || 0),
      productionDate: extraFields.productionDate,
      shelfLife: extraFields.shelfLife,
    };
  });
}

function adaptAdminGoodsDetailResponse(response = {}) {
  const item = response.data || {};
  const firstSku = Array.isArray(item.skus) && item.skus.length > 0 ? item.skus[0] : {};
  const extraFields = deriveGoodsExtraFields(item, firstSku);

  return {
    id: item.id,
    name: item.title || '',
    category: item.category && item.category.category_name ? item.category.category_name : '',
    image: normalizeImageUrl(item.primary_image || '', IMAGE_SCENES.product),
    spec: extraFields.spec,
    brand: item.brand || '',
    productionDate: extraFields.productionDate,
    shelfLife: extraFields.shelfLife,
    price: normalizeFenAmount(firstSku.price || item.min_sale_price || 0),
    stock: Number(firstSku.stock || item.total_stock || 0),
  };
}

function buildAdminGoodsPayload(form = {}, categories = []) {
  const category = categories.find((item) => item.category_name === form.category || String(item.id) === String(form.category));

  if (!category) {
    throw new Error('所选分类不存在');
  }

  const detail = {
    spec: form.spec || '',
    productionDate: form.productionDate || '',
    shelfLife: form.shelfLife || '',
  };

  return {
    title: form.name || '',
    subtitle: '',
    categoryId: category.id,
    brand: form.brand || '',
    primaryImage: form.image || '',
    detailImages: form.image ? [form.image] : [],
    productDetail: JSON.stringify(detail),
    tags: [],
    status: 1,
    skus: [
      {
        sku_name: form.spec || form.name || '默认规格',
        price: Number((Number(form.price || 0) / 100).toFixed(2)),
        stock: Number(form.stock || 0),
        specs: form.spec ? { spec: form.spec } : {},
      },
    ],
  };
}

function adaptAdminOrderListResponse(response = {}) {
  const list = Array.isArray(response.data) ? response.data : [];

  return list.map((order) => ({
    id: order.id,
    orderNo: order.order_no || '',
    status: mapAdminStatus(order.order_status),
    statusName: getAdminStatusName(order.order_status),
    userName: (order.user && (order.user.nickname || order.user.username)) || order.receiver_name || '',
    phone: order.receiver_phone || '',
    address: order.receiver_address || '',
    createTime: formatDateTime(order.created_at),
    totalAmount: normalizeFenAmount(order.total_amount || 0),
    freightFee: normalizeFenAmount(order.delivery_fee || 0),
    remark: order.order_remark || '',
    goodsList: order.previewItem
      ? [{ name: order.previewItem.product_title || '', quantity: Number(order.previewItem.quantity || 0) }]
      : [],
    expressCompany: order.delivery_company || '',
    expressNo: order.delivery_no || '',
  }));
}

function adaptAdminOrderDetailResponse(response = {}) {
  const order = response.data || {};
  const goodsList = Array.isArray(order.items)
    ? order.items.map((item) => {
        const specs = parseMaybeJson(item.sku_spec_info, item.sku_spec_info) || {};

        return {
          name: item.product_title || '',
          image: normalizeImageUrl(item.product_image || '', IMAGE_SCENES.product),
          spec: firstSpecText(specs),
          price: normalizeFenAmount(item.price || 0),
          quantity: Number(item.quantity || 0),
        };
      })
    : [];

  return {
    id: order.id,
    orderNo: order.order_no || '',
    status: mapAdminStatus(order.order_status),
    statusName: getAdminStatusName(order.order_status),
    userName: order.receiver_name || '',
    phone: order.receiver_phone || '',
    address: order.receiver_address || '',
    createTime: formatDateTime(order.created_at),
    totalAmount: normalizeFenAmount(order.total_amount || 0),
    freightFee: normalizeFenAmount(order.delivery_fee || 0),
    remark: order.order_remark || '',
    goodsList,
    expressCompany: order.delivery_company || '',
    expressNo: order.delivery_no || '',
  };
}

function adaptAdminUsersListResponse(response = {}) {
  const list = Array.isArray(response.data) ? response.data : [];

  return list.map((user) => ({
    id: user.id,
    nickName: user.nickname || user.username || '',
    avatarUrl: normalizeImageUrl(user.avatar_url || '', IMAGE_SCENES.avatar),
    phoneNumber: user.phone || '',
    totalOrders: Number(user.total_orders || 0),
    totalSpent: normalizeFenAmount(user.total_spent || 0),
    registerTime: formatDateTime(user.register_time),
    remark: user.remark || '',
  }));
}

function adaptAdminUserDetailResponse(response = {}) {
  const user = response.data || {};
  const orderHistory = Array.isArray(user.orderHistory)
    ? user.orderHistory.map((order) => ({
        orderNo: order.order_no || '',
        status: mapAdminStatus(order.order_status),
        statusName: getAdminStatusName(order.order_status),
        totalAmount: normalizeFenAmount(order.total_amount || 0),
        createTime: formatDateTime(order.created_at),
      }))
    : [];

  return {
    id: user.id,
    nickName: user.nickname || user.username || '',
    avatarUrl: normalizeImageUrl(user.avatar_url || '', IMAGE_SCENES.avatar),
    phoneNumber: user.phone || '',
    email: user.email || '',
    totalOrders: Number(user.total_orders || 0),
    totalSpent: normalizeFenAmount(user.total_spent || 0),
    registerTime: formatDateTime(user.register_time),
    remark: user.remark || '',
    orderHistory,
  };
}

module.exports = {
  adaptAdminGoodsListResponse,
  adaptAdminGoodsDetailResponse,
  buildAdminCategoryOptions,
  buildAdminGoodsPayload,
  adaptAdminOrderListResponse,
  adaptAdminOrderDetailResponse,
  adaptAdminUsersListResponse,
  adaptAdminUserDetailResponse,
  formatDateTime,
};
