import {
  getSearchHistory,
  getSearchPopular,
  recordSearchKeyword,
} from '../../../services/good/fetchSearchHistory';

Page({
  data: {
    historyWords: [],
    popularWords: [],
    searchValue: '',
    dialog: {
      title: '确认删除当前历史记录',
      showCancelButton: true,
      message: '',
    },
    dialogShow: false,
  },

  deleteType: 0,
  deleteIndex: '',

  onShow() {
    this.queryHistory();
    this.queryPopular();
  },

  async queryHistory() {
    try {
      const data = await getSearchHistory();
      const code = 'Success';
      if (String(code).toUpperCase() === 'SUCCESS') {
        const { historyWords = [] } = data;
        this.setData({
          historyWords,
        });
      }
    } catch (error) {
      console.error(error);
    }
  },

  async queryPopular() {
    try {
      const data = await getSearchPopular();
      const code = 'Success';
      if (String(code).toUpperCase() === 'SUCCESS') {
        const { popularWords = [] } = data;
        this.setData({
          popularWords,
        });
      }
    } catch (error) {
      console.error(error);
    }
  },

  confirm() {
    const { historyWords } = this.data;
    const { deleteType, deleteIndex } = this;
    historyWords.splice(deleteIndex, 1);
    if (deleteType === 0) {
      this.setData({
        historyWords,
        dialogShow: false,
      });
    } else {
      this.setData({ historyWords: [], dialogShow: false });
    }
  },

  close() {
    this.setData({ dialogShow: false });
  },

  handleClearHistory() {
    const { dialog } = this.data;
    this.deleteType = 1;
    this.setData({
      dialog: {
        ...dialog,
        message: '确认删除所有历史记录',
      },
      dialogShow: true,
    });
  },

  deleteCurr(e) {
    const { index } = e.currentTarget.dataset;
    const { dialog } = this.data;
    this.deleteIndex = index;
    this.setData({
      dialog: {
        ...dialog,
        message: '确认删除当前历史记录',
        deleteType: 0,
      },
      dialogShow: true,
    });
  },

  handleKeywordTap(e) {
    const { historyWords, popularWords } = this.data;
    const { dataset } = e.currentTarget;
    const words = dataset.source === 'popular' ? popularWords : historyWords;
    const _searchValue = words[dataset.index || 0] || '';
    if (_searchValue) {
      recordSearchKeyword(_searchValue);
      wx.navigateTo({
        url: `/pages/goods/result/index?searchValue=${_searchValue}`,
      });
    }
  },

  handleSubmit(e) {
    const { value } = e.detail.value;
    if (value.length === 0) return;
    recordSearchKeyword(value);
    wx.navigateTo({
      url: `/pages/goods/result/index?searchValue=${value}`,
    });
  },
});
