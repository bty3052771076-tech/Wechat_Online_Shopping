import Toast from 'tdesign-miniprogram/toast/index';
import {
  fetchAdminGoodsDetail,
  createAdminGoods,
  editAdminGoods,
  fetchAdminGoodsCategories,
} from '../../../../services/admin/goods';

Page({
  data: {
    isEdit: false,
    readonly: false,
    goodsId: '',
    form: {
      name: '',
      category: '',
      image: '',
      spec: '',
      brand: '',
      productionDate: '',
      shelfLife: '',
      price: '',
      stock: '',
    },
    categoryOptions: [],
    categoryVisible: false,
    dateVisible: false,
  },

  onLoad(options) {
    this.loadCategoryOptions();

    if (options.id) {
      this.setData({
        isEdit: true,
        goodsId: options.id,
        readonly: options.readonly === '1',
      });
      wx.setNavigationBarTitle({
        title: options.readonly === '1' ? '商品详情' : '编辑商品',
      });
      this.loadDetail(options.id);
      return;
    }

    wx.setNavigationBarTitle({ title: '新增商品' });
  },

  loadCategoryOptions(currentCategory = '') {
    fetchAdminGoodsCategories(currentCategory).then((categoryOptions) => {
      this.setData({
        categoryOptions: categoryOptions || [],
      });
    });
  },

  loadDetail(id) {
    fetchAdminGoodsDetail(id).then((res) => {
      if (!res.data) {
        return;
      }

      this.setData({
        form: {
          ...res.data,
          price: String(res.data.price / 100),
          stock: String(res.data.stock),
        },
      });
      this.loadCategoryOptions(res.data.category);
    });
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onCategoryPicker() {
    if (this.data.readonly) {
      return;
    }

    this.setData({ categoryVisible: true });
  },

  onCategoryChange(e) {
    const { value } = e.detail;
    this.setData({
      'form.category': value[0],
      categoryVisible: false,
    });
  },

  onCategoryCancel() {
    this.setData({ categoryVisible: false });
  },

  onDatePicker() {
    if (this.data.readonly) {
      return;
    }

    this.setData({ dateVisible: true });
  },

  onDateChange(e) {
    this.setData({
      'form.productionDate': e.detail.value,
      dateVisible: false,
    });
  },

  onDateCancel() {
    this.setData({ dateVisible: false });
  },

  handleSubmit() {
    const { form, isEdit, goodsId } = this.data;

    if (!form.name) {
      Toast({ context: this, selector: '#t-toast', message: '请填写商品名称' });
      return;
    }
    if (!form.category) {
      Toast({ context: this, selector: '#t-toast', message: '请选择分类' });
      return;
    }
    if (!form.price) {
      Toast({ context: this, selector: '#t-toast', message: '请填写价格' });
      return;
    }

    const submitData = {
      ...form,
      price: Math.round(parseFloat(form.price) * 100),
      stock: parseInt(form.stock, 10) || 0,
    };

    const request = isEdit ? editAdminGoods(goodsId, submitData) : createAdminGoods(submitData);

    request.then((res) => {
      if (res.code !== 'Success') {
        return;
      }

      Toast({
        context: this,
        selector: '#t-toast',
        message: isEdit ? '修改成功' : '添加成功',
        icon: 'check-circle',
      });
      setTimeout(() => wx.navigateBack(), 800);
    });
  },
});
