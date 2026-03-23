import {
  getSearchHistory,
  getSearchPopular,
  recordSearchKeyword,
  saveSearchHistory,
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
    let nextWords;
    if (deleteType === 0) {
      // 删除单条：从数组移除指定索引
      historyWords.splice(deleteIndex, 1);
      nextWords = historyWords;
    } else {
      // 清除全部
      nextWords = [];
    }
    // 写回本地存储，确保下次进入页面不再显示已删除的记录
    saveSearchHistory(nextWords);
    this.setData({ historyWords: nextWords, dialogShow: false });
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

  // 同步输入框当前值到 data
  handleChange(e) {
    this.setData({ searchValue: e.detail.value });
  },

  // 键盘回车触发搜索（修复：原来错误地从字符串解构，改为从 e.detail 解构）
  handleSubmit(e) {
    const { value } = e.detail;
    if (!value || value.length === 0) return;
    recordSearchKeyword(value);
    wx.navigateTo({
      url: `/pages/goods/result/index?searchValue=${value}`,
    });
  },

  // 点击"搜索"按钮触发搜索
  doSearch() {
    const { searchValue } = this.data;
    if (!searchValue || searchValue.length === 0) return;
    recordSearchKeyword(searchValue);
    wx.navigateTo({
      url: `/pages/goods/result/index?searchValue=${searchValue}`,
    });
  },
});
