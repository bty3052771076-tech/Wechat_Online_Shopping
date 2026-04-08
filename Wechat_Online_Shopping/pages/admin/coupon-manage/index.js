import { fetchAdminCouponList, createAdminCoupon, updateAdminCoupon, deleteAdminCoupon } from '../../../services/admin/coupon';

const TYPE_LABELS = { 1: '满减券', 2: '折扣券' };
const STATUS_LABELS = { 0: '已下架', 1: '上架中' };

// 一级分类列表（与 DB categories 表 level=1 数据对齐） (#21)
const CATEGORY_OPTIONS = [
  { label: '生鲜食品', value: 1 },
  { label: '日用百货', value: 2 },
  { label: '美妆个护', value: 3 },
  { label: '食品饮料', value: 18 },
  { label: '数码家电', value: 19 },
  { label: '母婴用品', value: 20 },
];

Page({
  data: {
    list: [],
    showDialog: false,
    isAdd: false,
    editingId: null,
    formData: {
      couponName: '',
      couponType: '1',
      discountValue: '',
      minAmount: '0',
      totalQuantity: '0',
      validDays: '30',
      startTime: '',
      endTime: '',
    },
    categoryOptions: CATEGORY_OPTIONS,  // 分类选项 (#21)
    selectedCategoryIds: [],            // 当前选中的分类 IDs (#21)
  },

  onLoad() {
    this.loadList();
  },

  loadList() {
    fetchAdminCouponList().then((res) => {
      const list = Array.isArray(res && res.data) ? res.data : [];
      // 补充展示字段
      this.setData({
        list: list.map((item) => ({
          ...item,
          typeLabel: TYPE_LABELS[item.couponType] || '未知',
          statusLabel: STATUS_LABELS[item.status] || '未知',
          valueDesc: item.couponType === 2
            ? `${item.discountValue}折`
            : `减${item.discountValue}元`,
          // 适用分类标签 (#21)
          categoryLabel: Array.isArray(item.categoryIds) && item.categoryIds.length > 0
            ? CATEGORY_OPTIONS.filter((o) => item.categoryIds.includes(o.value)).map((o) => o.label).join('/')
            : '全场',
        })),
      });
    });
  },

  onAdd() {
    this.setData({
      showDialog: true,
      isAdd: true,
      editingId: null,
      formData: { couponName: '', couponType: '1', discountValue: '', minAmount: '0', totalQuantity: '0', validDays: '30', startTime: '', endTime: '' },
      selectedCategoryIds: [],  // 重置分类选择 (#21)
    });
  },

  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.list.find((c) => c.id === id);
    if (!item) return;
    this.setData({
      showDialog: true,
      isAdd: false,
      editingId: id,
      formData: {
        couponName: item.couponName,
        couponType: String(item.couponType),
        discountValue: String(item.discountValue),
        minAmount: String(item.minAmount),
        totalQuantity: String(item.totalQuantity),
        validDays: String(item.validDays),
        startTime: item.startTime ? String(item.startTime).slice(0, 10) : '',
        endTime: item.endTime ? String(item.endTime).slice(0, 10) : '',
      },
      // 回填已绑定分类 (#21)
      selectedCategoryIds: Array.isArray(item.categoryIds) ? item.categoryIds : [],
    });
  },

  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  // Radio 单选处理 (#21)
  onRadioChange(e) {
    const { field, value } = e.currentTarget.dataset;
    this.setData({ [`formData.${field}`]: String(value) });
  },

  // 分类单个复选框变化处理 (#21)
  onCategoryCheckboxChange(e) {
    const { value } = e.currentTarget.dataset;
    const { checked } = e.detail;
    let { selectedCategoryIds } = this.data;
    if (checked) {
      if (!selectedCategoryIds.includes(value)) {
        selectedCategoryIds = [...selectedCategoryIds, value];
      }
    } else {
      selectedCategoryIds = selectedCategoryIds.filter((id) => id !== value);
    }
    this.setData({ selectedCategoryIds });
  },

  onSave() {
    const { formData, isAdd, editingId, selectedCategoryIds } = this.data;
    if (!formData.couponName.trim() || !formData.discountValue || !formData.startTime || !formData.endTime) {
      wx.showToast({ title: '请填写必填字段', icon: 'none' });
      return;
    }
    const payload = {
      couponName: formData.couponName.trim(),
      couponType: Number(formData.couponType),
      discountValue: parseFloat(formData.discountValue),
      minAmount: parseFloat(formData.minAmount || 0),
      totalQuantity: Number(formData.totalQuantity || 0),
      validDays: Number(formData.validDays || 30),
      startTime: formData.startTime,
      endTime: formData.endTime,
      categoryIds: selectedCategoryIds,  // 适用分类 (#21)
    };
    const promise = isAdd ? createAdminCoupon(payload) : updateAdminCoupon(editingId, payload);
    promise.then((res) => {
      if (res && res.code === 'Success') {
        wx.showToast({ title: isAdd ? '创建成功' : '更新成功', icon: 'success' });
        this.setData({ showDialog: false });
        this.loadList();
      } else {
        wx.showToast({ title: (res && res.msg) || '操作失败', icon: 'none' });
      }
    });
  },

  onCancel() {
    this.setData({ showDialog: false });
  },

  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认下架',
      content: '确定要下架该优惠券吗？',
      success: (res) => {
        if (res.confirm) {
          deleteAdminCoupon(id).then((result) => {
            if (result && result.code === 'Success') {
              wx.showToast({ title: '已下架', icon: 'success' });
              this.loadList();
            }
          });
        }
      },
    });
  },
});
