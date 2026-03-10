const { normalizeImageUrl } = require('./image-helpers');
const { parseSpecInfo } = require('./shop-adapters');

function buildGoodsDetailCartPayload({ buyNum = 1, selectedItem = null, details = {} } = {}) {
  const skuId =
    (selectedItem && selectedItem.skuId) ||
    (Array.isArray(details.skuList) && details.skuList[0] && details.skuList[0].skuId) ||
    '';

  return {
    skuId: String(skuId || ''),
    quantity: Number(buyNum) > 0 ? Number(buyNum) : 1,
  };
}

function buildRebuyGoodsRequestList(order = {}) {
  const storeId = order.storeId || 'default-store';
  const storeName = order.storeName || '默认店铺';
  const goodsList = Array.isArray(order.goodsList) ? order.goodsList : [];

  return goodsList.map((goods) => ({
    storeId,
    storeName,
    spuId: String(goods.spuId || ''),
    skuId: String(goods.skuId || ''),
    goodsName: goods.goodsName || goods.title || '',
    title: goods.title || goods.goodsName || '',
    quantity: Number(goods.quantity || goods.num || goods.buyQuantity || 1),
    price: Number(goods.price || goods.actualPrice || 0),
    primaryImage: normalizeImageUrl(goods.primaryImage || goods.thumb || goods.goodsPictureUrl || ''),
    thumb: normalizeImageUrl(goods.thumb || goods.primaryImage || goods.goodsPictureUrl || ''),
    specInfo: parseSpecInfo(goods.specInfo || goods.specs || goods.specifications),
  }));
}

function normalizeActionButtons(buttons = []) {
  return (Array.isArray(buttons) ? buttons : []).map((button) => ({
    ...button,
    openType: button && button.openType ? String(button.openType) : '',
  }));
}

module.exports = {
  buildGoodsDetailCartPayload,
  buildRebuyGoodsRequestList,
  normalizeActionButtons,
};
