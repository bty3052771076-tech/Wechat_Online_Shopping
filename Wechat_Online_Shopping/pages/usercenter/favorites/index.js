import { fetchFavoriteList, removeFavorite } from '../../../services/favorite/index';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    list: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
  },

  onLoad() {
    this.loadList();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, list: [], hasMore: true });
    this.loadList().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList();
    }
  },

  loadList() {
    const { page, pageSize, list } = this.data;
    this.setData({ loading: true });
    return fetchFavoriteList(page, pageSize).then((data) => {
      const items = Array.isArray(data && data.list) ? data.list : [];
      const pagination = data && data.pagination ? data.pagination : {};
      const hasMore = pagination.total ? list.length + items.length < pagination.total : false;
      this.setData({
        list: page === 1 ? items : list.concat(items),
        page: page + 1,
        hasMore,
        loading: false,
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  onRemoveFavorite(e) {
    const { spuId, index } = e.currentTarget.dataset;
    removeFavorite(spuId).then(() => {
      const newList = this.data.list.slice();
      newList.splice(index, 1);
      this.setData({ list: newList });
      Toast({ context: this, selector: '#t-toast', message: '已取消收藏', icon: '', duration: 1500 });
    }).catch(() => {
      Toast({ context: this, selector: '#t-toast', message: '操作失败', icon: '', duration: 1500 });
    });
  },

  onGoods(e) {
    const { spuId } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods/details/index?spuId=${spuId}` });
  },
});
