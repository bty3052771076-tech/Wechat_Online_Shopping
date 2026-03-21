Component({
  properties: {
    // 商品数据: { id, title, priceYuan, image, url }
    product: {
      type: Object,
      value: {},
    },
  },
  methods: {
    // 点击"去看看"跳转商品详情页
    onTapView() {
      const { url } = this.data.product || {};
      if (url) {
        wx.navigateTo({ url });
      }
    },
  },
});
