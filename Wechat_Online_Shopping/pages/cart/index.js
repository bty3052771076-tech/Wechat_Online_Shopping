import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import { fetchCartGroupData } from '../../services/cart/cart';
import { updateCartItem, deleteCartItem } from '../../services/cart-new';

Page({
  data: {
    cartGroupData: null,
  },

  // 调用自定义tabbar的init函数，使页面与tabbar激活状态保持一致
  onShow() {
    this.getTabBar().init();
    this.refreshData();
  },

  onLoad() {
    this.refreshData();
  },

  refreshData() {
    this.getCartGroupData().then((res) => {
      let isEmpty = true;
      const cartGroupData = res.data;
      // 一些组件中需要的字段可能接口并没有返回，或者返回的数据结构与预期不一致，需要在此先对数据做一些处理
      // 统计门店下加购的商品是否全选、是否存在缺货/无货
      for (const store of cartGroupData.storeGoods) {
        store.isSelected = true; // 该门店已加购商品是否全选
        store.storeStockShortage = false; // 该门店已加购商品是否存在库存不足
        if (!store.shortageGoodsList) {
          store.shortageGoodsList = []; // 该门店已加购商品如果库存为0需单独分组
        }
        for (const activity of store.promotionGoodsList) {
          activity.goodsPromotionList = activity.goodsPromotionList.filter((goods) => {
            goods.originPrice = undefined;

            // 统计是否有加购数大于库存数的商品
            if (goods.quantity > goods.stockQuantity) {
              store.storeStockShortage = true;
            }
            // 统计是否全选
            if (!goods.isSelected) {
              store.isSelected = false;
            }
            // 库存为0（无货）的商品单独分组
            if (goods.stockQuantity > 0) {
              return true;
            }
            store.shortageGoodsList.push(goods);
            return false;
          });

          if (activity.goodsPromotionList.length > 0) {
            isEmpty = false;
          }
        }
        if (store.shortageGoodsList.length > 0) {
          isEmpty = false;
        }
      }
      cartGroupData.invalidGoodItems = cartGroupData.invalidGoodItems.map((goods) => {
        goods.originPrice = undefined;
        return goods;
      });
      cartGroupData.isNotEmpty = !isEmpty;
      this.setData({ cartGroupData });
    });
  },

  findGoods(spuId, skuId) {
    let currentStore;
    let currentActivity;
    let currentGoods;
    const { storeGoods } = this.data.cartGroupData;
    for (const store of storeGoods) {
      for (const activity of store.promotionGoodsList) {
        for (const goods of activity.goodsPromotionList) {
          if (goods.spuId === spuId && goods.skuId === skuId) {
            currentStore = store;
            currentActivity = activity;
            currentGoods = goods;
            return {
              currentStore,
              currentActivity,
              currentGoods,
            };
          }
        }
      }
    }
    return {
      currentStore,
      currentActivity,
      currentGoods,
    };
  },

  // 注：实际场景时应该调用接口获取购物车数据
  getCartGroupData() {
    return fetchCartGroupData();
  },

  // 选择单个商品
  selectGoodsService({ spuId, skuId, isSelected }) {
    const { currentGoods } = this.findGoods(spuId, skuId);

    if (!currentGoods || !currentGoods.cartId) {
      return Promise.reject(new Error('cart item not found'));
    }

    return updateCartItem({
      cartId: currentGoods.cartId,
      isChecked: isSelected ? 1 : 0,
    });
  },

  // 全选门店
  selectStoreService({ storeId, isSelected }) {
    const currentStore = this.data.cartGroupData.storeGoods.find((s) => s.storeId === storeId);

    if (!currentStore) {
      return Promise.reject(new Error('store not found'));
    }

    const requests = [];

    currentStore.promotionGoodsList.forEach((activity) => {
      activity.goodsPromotionList.forEach((goods) => {
        if (goods.cartId) {
          requests.push(
            updateCartItem({
              cartId: goods.cartId,
              isChecked: isSelected ? 1 : 0,
            }),
          );
        }
      });
    });

    return Promise.all(requests);
  },

  // 加购数量变更
  changeQuantityService({ spuId, skuId, quantity }) {
    const { currentGoods } = this.findGoods(spuId, skuId);

    if (!currentGoods || !currentGoods.cartId) {
      return Promise.reject(new Error('cart item not found'));
    }

    return updateCartItem({
      cartId: currentGoods.cartId,
      quantity,
    });
  },

  // 删除加购商品
  deleteGoodsService({ spuId, skuId }) {
    const { currentGoods } = this.findGoods(spuId, skuId);

    if (!currentGoods || !currentGoods.cartId) {
      return Promise.reject(new Error('cart item not found'));
    }

    return deleteCartItem(currentGoods.cartId);
  },

  // 清空失效商品
  clearInvalidGoodsService() {
    const invalidGoodItems = this.data.cartGroupData.invalidGoodItems || [];
    const requests = invalidGoodItems
      .filter((goods) => goods.cartId)
      .map((goods) => deleteCartItem(goods.cartId));

    return Promise.all(requests);
  },

  selectAllGoodsService(isSelected) {
    const requests = [];

    this.data.cartGroupData.storeGoods.forEach((store) => {
      store.promotionGoodsList.forEach((activity) => {
        activity.goodsPromotionList.forEach((goods) => {
          if (goods.cartId) {
            requests.push(
              updateCartItem({
                cartId: goods.cartId,
                isChecked: isSelected ? 1 : 0,
              }),
            );
          }
        });
      });
    });

    return Promise.all(requests);
  },

  onGoodsSelect(e) {
    const {
      goods: { spuId, skuId },
      isSelected,
    } = e.detail;
    const { currentGoods } = this.findGoods(spuId, skuId);
    Toast({
      context: this,
      selector: '#t-toast',
      message: `${isSelected ? '选择' : '取消'}"${
        currentGoods.title.length > 5 ? `${currentGoods.title.slice(0, 5)}...` : currentGoods.title
      }"`,
      icon: '',
    });
    this.selectGoodsService({ spuId, skuId, isSelected }).then(() => this.refreshData());
  },

  onStoreSelect(e) {
    const {
      store: { storeId },
      isSelected,
    } = e.detail;
    this.selectStoreService({ storeId, isSelected }).then(() => this.refreshData());
  },

  onQuantityChange(e) {
    const {
      goods: { spuId, skuId },
      quantity,
    } = e.detail;
    const { currentGoods } = this.findGoods(spuId, skuId);
    const stockQuantity = currentGoods.stockQuantity > 0 ? currentGoods.stockQuantity : 0; // 避免后端返回的是-1
    // 加购数量超过库存数量
    if (quantity > stockQuantity) {
      // 加购数量等于库存数量的情况下继续加购
      if (currentGoods.quantity === stockQuantity && quantity - stockQuantity === 1) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '当前商品库存不足',
        });
        return;
      }
      Dialog.confirm({
        title: '商品库存不足',
        content: `当前商品库存不足，最大可购买数量为${stockQuantity}件`,
        confirmBtn: '修改为最大可购买数量',
        cancelBtn: '取消',
      })
        .then(() => {
          this.changeQuantityService({
            spuId,
            skuId,
            quantity: stockQuantity,
          }).then(() => this.refreshData());
        })
        .catch(() => {});
      return;
    }
    this.changeQuantityService({ spuId, skuId, quantity }).then(() => this.refreshData());
  },

  goCollect() {
    /** 活动肯定有一个活动ID，用来获取活动banner，活动商品列表等 */
    const promotionID = '123';
    wx.navigateTo({
      url: `/pages/promotion/promotion-detail/index?promotion_id=${promotionID}`,
    });
  },

  goGoodsDetail(e) {
    const { spuId, storeId } = e.detail.goods;
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}&storeId=${storeId}`,
    });
  },

  clearInvalidGoods() {
    this.clearInvalidGoodsService().then(() => this.refreshData());
  },

  onGoodsDelete(e) {
    const {
      goods: { spuId, skuId },
    } = e.detail;
    Dialog.confirm({
      content: '确认删除该商品吗?',
      confirmBtn: '确定',
      cancelBtn: '取消',
    }).then(() => {
      this.deleteGoodsService({ spuId, skuId }).then(() => {
        Toast({ context: this, selector: '#t-toast', message: '商品删除成功' });
        this.refreshData();
      });
    });
  },

  onSelectAll(event) {
    const { isAllSelected } = event?.detail ?? {};
    this.selectAllGoodsService(!isAllSelected).then(() => this.refreshData());
  },

  onToSettle() {
    const goodsRequestList = [];
    this.data.cartGroupData.storeGoods.forEach((store) => {
      store.promotionGoodsList.forEach((promotion) => {
        promotion.goodsPromotionList.forEach((m) => {
          if (m.isSelected == 1) {
            goodsRequestList.push(m);
          }
        });
      });
    });
    wx.setStorageSync('order.goodsRequestList', JSON.stringify(goodsRequestList));
    wx.navigateTo({ url: '/pages/order/order-confirm/index?type=cart' });
  },
  onGotoHome() {
    wx.switchTab({ url: '/pages/home/home' });
  },
});
