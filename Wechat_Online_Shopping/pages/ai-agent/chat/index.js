const { sendChatMessage } = require('../../../services/agent/agent');

/** 消息 ID 自增计数 */
let msgId = 0;

Page({
  data: {
    messages: [],        // 聊天消息列表
    inputValue: '',      // 输入框内容
    streaming: false,    // 是否正在流式接收
    sessionId: null,     // 当前会话 ID
    scrollTarget: '',    // 滚动锚点
    // 快捷问题
    quickQuestions: [
      '帮我推荐一款手机',
      '有什么好看的衣服',
      '100元以内的零食',
    ],
  },

  /** 当前流式请求任务，可用于 abort */
  _requestTask: null,

  onLoad() {
    // 页面加载时可从参数恢复会话
  },

  onUnload() {
    // 页面卸载时中断流式请求
    if (this._requestTask) {
      this._requestTask.abort();
      this._requestTask = null;
    }
  },

  /** 输入框内容变化 */
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  /** 点击快捷问题 */
  onQuickQuestion(e) {
    const q = e.currentTarget.dataset.q;
    this.setData({ inputValue: q }, () => {
      this.onSend();
    });
  },

  /** 发送消息 */
  onSend() {
    const text = (this.data.inputValue || '').trim();
    if (!text || this.data.streaming) return;

    // 追加用户消息
    const userMsg = { id: ++msgId, role: 'user', content: text, products: [] };
    const botMsg = { id: ++msgId, role: 'assistant', content: '', products: [] };

    this.setData({
      inputValue: '',
      streaming: true,
      messages: [...this.data.messages, userMsg, botMsg],
    }, () => {
      this.scrollToBottom();
    });

    const botIndex = this.data.messages.length - 1;

    // 发起 SSE 请求
    this._requestTask = sendChatMessage({
      sessionId: this.data.sessionId,
      message: text,
      // 文本增量
      onDelta: (content) => {
        const key = `messages[${botIndex}].content`;
        this.setData({ [key]: this.data.messages[botIndex].content + content }, () => {
          this.scrollToBottom();
        });
      },
      // 商品推荐
      onProducts: (products) => {
        const key = `messages[${botIndex}].products`;
        this.setData({ [key]: products }, () => {
          this.scrollToBottom();
        });
      },
      // 完成
      onDone: (data) => {
        this._requestTask = null;
        this.setData({
          streaming: false,
          sessionId: data.sessionId || this.data.sessionId,
        });
      },
      // 错误
      onError: (errMsg) => {
        this._requestTask = null;
        const key = `messages[${botIndex}].content`;
        this.setData({
          [key]: this.data.messages[botIndex].content || `抱歉，出了点问题：${errMsg}`,
          streaming: false,
        });
      },
    });
  },

  /** 滚动到底部 */
  scrollToBottom() {
    this.setData({ scrollTarget: 'bottom-anchor' });
  },
});
