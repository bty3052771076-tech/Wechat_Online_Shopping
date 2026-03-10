import Toast from 'tdesign-miniprogram/toast/index';
import { fetchGood } from '../../../services/good/fetchGood';
import { fetchActivityList } from '../../../services/activity/fetchActivityList';
import { addToCart } from '../../../services/cart-new';
import {
  getGoodsDetailsCommentList,
  getGoodsDetailsCommentsCount,
} from '../../../services/good/fetchGoodsDetailsComments';
import { cdnBase } from '../../../config/index';

const { buildGoodsDetailCartPayload } = require('../../../services/_utils/order-action-helpers');
const { DEFAULT_COMMENT_AVATAR } = require('../../../services/_utils/comment-adapters');

const imgPrefix = `${cdnBase}/`;
const recLeftImg = `${imgPrefix}common/rec-left.png`;
const recRightImg = `${imgPrefix}common/rec-right.png`;

function obj2Params(obj = {}, encode = false) {
  return Object.keys(obj)
    .map((key) => `${key}=${encode ? encodeURIComponent(obj[key]) : obj[key]}`)
    .join('&');
}

Page({
  data: {
    commentsList: [],
    commentsStatistics: {
      badCount: 0,
      commentCount: 0,
      goodCount: 0,
      goodRate: 0,
      hasImageCount: 0,
      middleCount: 0,
    },
    isShowPromotionPop: false,
    activityList: [],
    recLeftImg,
    recRightImg,
    details: {
      images: [],
      desc: [],
      specList: [],
      limitInfo: [{}],
    },
    goodsTabArray: [
      { name: '商品', value: '' },
      { name: '详情', value: 'goods-page' },
    ],
    storeLogo: `${imgPrefix}common/store-logo.png`,
    storeName: 'Mall 标准旗舰店',
    jumpArray: [
      { title: '首页', url: '/pages/home/home', iconName: 'home' },
      { title: '购物车', url: '/pages/cart/index', iconName: 'cart', showCartNum: true },
    ],
    isStock: true,
    cartNum: 0,
    soldout: false,
    buttonType: 1,
    buyNum: 1,
    selectedAttrStr: '',
    skuArray: [],
    skuList: [],
    primaryImage: '',
    specImg: '',
    isSpuSelectPopupShow: false,
    isAllSelectedSku: false,
    buyType: 0,
    outOperateStatus: false,
    selectSkuSellsPrice: 0,
    maxLinePrice: 0,
    minSalePrice: 0,
    maxSalePrice: 0,
    list: [],
    spuId: '',
    navigation: { type: 'fraction' },
    current: 0,
    autoplay: true,
    duration: 500,
    interval: 5000,
    soldNum: 0,
    selectItem: null,
    intro: '',
    promotionSubCode: '',
    anonymityAvatar: DEFAULT_COMMENT_AVATAR,
  },

  handlePopupHide() {
    this.setData({
      isSpuSelectPopupShow: false,
    });
  },

  showSkuSelectPopup(type = 0) {
    this.setData({
      buyType: type,
      outOperateStatus: type >= 1,
      isSpuSelectPopupShow: true,
    });
  },

  buyItNow() {
    this.showSkuSelectPopup(1);
  },

  toAddCart() {
    this.showSkuSelectPopup(2);
  },

  toNav(e) {
    const { url } = e.detail;
    wx.switchTab({ url });
  },

  showCurImg(e) {
    const { index } = e.detail;
    const { images = [] } = this.data.details;
    if (!images[index]) {
      return;
    }

    wx.previewImage({
      current: images[index],
      urls: images,
    });
  },

  onPageScroll({ scrollTop }) {
    const goodsTab = this.selectComponent('#goodsTab');
    if (goodsTab && typeof goodsTab.onScroll === 'function') {
      goodsTab.onScroll(scrollTop);
    }
  },

  chooseSpecItem(e) {
    const { specList = [] } = this.data.details;
    const { selectedSku, isAllSelectedSku } = e.detail;

    this.setData({
      isAllSelectedSku,
      selectSkuSellsPrice: isAllSelectedSku ? this.data.selectSkuSellsPrice : 0,
    });

    this.getSkuItem(specList, selectedSku || {});
  },

  getSkuItem(specList, selectedSku) {
    const { skuArray, primaryImage } = this.data;
    const selectedSkuValues = this.getSelectedSkuValues(specList, selectedSku);
    const selectedAttrStr = selectedSkuValues.length > 0 ? ` 已选 ${selectedSkuValues.map((item) => item.specValue).join(' ')}` : '';
    const skuItem =
      skuArray.find((item) =>
        (item.specInfo || []).every(
          (subItem) => selectedSku[subItem.specId] && selectedSku[subItem.specId] === subItem.specValueId,
        ),
      ) || null;

    this.selectSpecsName(selectedAttrStr);
    this.setData({
      selectItem: skuItem,
      selectSkuSellsPrice: skuItem ? skuItem.price || 0 : 0,
      specImg: skuItem && skuItem.skuImage ? skuItem.skuImage : primaryImage,
    });
  },

  getSelectedSkuValues(skuTree, selectedSku) {
    const normalizedTree = this.normalizeSkuTree(skuTree);

    return Object.keys(selectedSku).reduce((selectedValues, skuKeyStr) => {
      const skuValues = normalizedTree[skuKeyStr] || [];
      const skuValueId = selectedSku[skuKeyStr];

      if (!skuValueId) {
        return selectedValues;
      }

      const skuValue = skuValues.find((value) => value.specValueId === skuValueId);
      if (skuValue) {
        selectedValues.push(skuValue);
      }

      return selectedValues;
    }, []);
  },

  normalizeSkuTree(skuTree = []) {
    return skuTree.reduce((normalizedTree, treeItem) => {
      normalizedTree[treeItem.specId] = treeItem.specValueList || [];
      return normalizedTree;
    }, {});
  },

  selectSpecsName(selectedAttrStr) {
    this.setData({
      selectedAttrStr: selectedAttrStr || '',
    });
  },

  addCart() {
    const { details, isAllSelectedSku, selectItem } = this.data;
    const requiresSelection = Array.isArray(details.specList) && details.specList.length > 0;

    if (requiresSelection && !isAllSelectedSku && !selectItem) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择规格',
        icon: '',
        duration: 1000,
      });
      return Promise.resolve();
    }

    return addToCart(
      buildGoodsDetailCartPayload({
        buyNum: this.data.buyNum,
        selectedItem: selectItem,
        details,
      }),
    ).then(() => {
      this.handlePopupHide();
      this.setData({
        cartNum: this.data.cartNum + this.data.buyNum,
      });
    });
  },

  gotoBuy() {
    const { details, isAllSelectedSku, buyNum, selectItem } = this.data;
    const requiresSelection = Array.isArray(details.specList) && details.specList.length > 0;

    if (requiresSelection && !isAllSelectedSku && !selectItem) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择规格',
        icon: '',
        duration: 1000,
      });
      return;
    }

    const resolvedItem = selectItem || (Array.isArray(details.skuList) ? details.skuList[0] : null) || {};
    const query = {
      quantity: buyNum,
      storeId: '1',
      spuId: this.data.spuId,
      goodsName: details.title,
      skuId: resolvedItem.skuId || '',
      available: details.available,
      price: details.minSalePrice,
      specInfo: Array.isArray(resolvedItem.specInfo)
        ? resolvedItem.specInfo.map((item) => ({
            specTitle: item.specTitle || item.specId || 'spec',
            specValue: item.specValue || '',
          }))
        : [],
      primaryImage: details.primaryImage,
      thumb: details.primaryImage,
      title: details.title,
    };
    const urlQueryStr = obj2Params({
      goodsRequestList: JSON.stringify([query]),
    });

    this.handlePopupHide();
    wx.navigateTo({
      url: `/pages/order/order-confirm/index?${urlQueryStr}`,
    });
  },

  specsConfirm() {
    if (this.data.buyType === 1) {
      this.gotoBuy();
      return;
    }

    this.addCart();
  },

  changeNum(e) {
    this.setData({
      buyNum: e.detail.buyNum,
    });
  },

  closePromotionPopup() {
    this.setData({
      isShowPromotionPop: false,
    });
  },

  promotionChange(e) {
    const { index } = e.detail;
    wx.navigateTo({
      url: `/pages/promotion/promotion-detail/index?promotion_id=${index}`,
    });
  },

  showPromotionPopup() {
    this.setData({
      isShowPromotionPop: true,
    });
  },

  getDetail(spuId) {
    Promise.all([fetchGood(spuId), fetchActivityList()]).then(([details, activityList]) => {
      const skuArray = (details.skuList || []).map((item) => ({
        skuId: item.skuId,
        skuImage: item.skuImage,
        price: item.price,
        quantity: item.stockInfo ? item.stockInfo.stockQuantity : 0,
        specInfo: item.specInfo,
      }));
      const promotionArray = (activityList || []).map((item) => ({
        tag: item.promotionSubCode === 'MYJ' ? '满减' : '满折',
        label: item.promotionName || '活动优惠',
      }));

      this.setData({
        details,
        activityList,
        isStock: details.spuStockQuantity > 0,
        maxSalePrice: parseInt(details.maxSalePrice || 0, 10),
        maxLinePrice: parseInt(details.maxLinePrice || 0, 10),
        minSalePrice: parseInt(details.minSalePrice || 0, 10),
        list: promotionArray,
        skuArray,
        skuList: details.skuList || [],
        primaryImage: details.primaryImage,
        soldout: details.isPutOnSale === 0,
        soldNum: details.soldNum || 0,
        intro: details.subtitle || '',
      });
    });
  },

  async getCommentsList(spuId) {
    try {
      const data = await getGoodsDetailsCommentList(spuId);
      const { homePageComments = [] } = data;

      this.setData({
        commentsList: homePageComments.map((item) => ({
          goodsSpu: item.spuId,
          userName: item.userName || '',
          commentScore: item.commentScore,
          commentContent: item.commentContent || '用户未填写评价',
          userHeadUrl: item.userHeadUrl || this.data.anonymityAvatar,
        })),
      });
    } catch (error) {
      console.error('comments error:', error);
    }
  },

  onShareAppMessage() {
    const { selectedAttrStr, details, spuId } = this.data;
    const shareSubTitle = selectedAttrStr ? ` ${selectedAttrStr}` : '';

    return {
      imageUrl: details.primaryImage,
      title: `${details.title || ''}${shareSubTitle}`,
      path: `/pages/goods/details/index?spuId=${spuId}`,
    };
  },

  async getCommentsStatistics(spuId) {
    try {
      const data = await getGoodsDetailsCommentsCount(spuId);
      const { badCount, commentCount, goodCount, goodRate, hasImageCount, middleCount } = data;

      this.setData({
        commentsStatistics: {
          badCount: parseInt(`${badCount}`, 10),
          commentCount: parseInt(`${commentCount}`, 10),
          goodCount: parseInt(`${goodCount}`, 10),
          goodRate: Math.floor(goodRate * 10) / 10,
          hasImageCount: parseInt(`${hasImageCount}`, 10),
          middleCount: parseInt(`${middleCount}`, 10),
        },
      });
    } catch (error) {
      console.error('comments statistics error:', error);
    }
  },

  navToCommentsListPage() {
    wx.navigateTo({
      url: `/pages/goods/comments/index?spuId=${this.data.spuId}`,
    });
  },

  onLoad(query) {
    const { spuId = '' } = query || {};

    this.setData({
      spuId,
    });

    this.getDetail(spuId);
    this.getCommentsList(spuId);
    this.getCommentsStatistics(spuId);
  },
});
