import { fetchAdminPromotionList, createAdminPromotion, updateAdminPromotion, deleteAdminPromotion } from '../../../services/admin/promotion';

const TYPE_LABELS = { MYJ: '满减', MYG: '满折' };
const STATUS_LABELS = { 0: '已禁用', 1: '启用中' };

Page({
  data: {
    list: [],
    showDialog: false,
    isAdd: false,
    editingId: null,
    formData: {
      title: '',
      promotionSubCode: 'MYJ',
      description: '',
      ladderDesc: '',
      startTime: '',
      endTime: '',
    },
  },

  onLoad() {
    this.loadList();
  },

  loadList() {
    fetchAdminPromotionList().then((res) => {
      const list = Array.isArray(res && res.data) ? res.data : [];
      this.setData({
        list: list.map((item) => ({
          ...item,
          typeLabel: TYPE_LABELS[item.promotionSubCode] || item.promotionSubCode,
          statusLabel: STATUS_LABELS[item.status] || '未知',
        })),
      });
    });
  },

  onAdd() {
    this.setData({
      showDialog: true,
      isAdd: true,
      editingId: null,
      formData: { title: '', promotionSubCode: 'MYJ', description: '', ladderDesc: '', startTime: '', endTime: '' },
    });
  },

  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.list.find((p) => p.id === id);
    if (!item) return;
    this.setData({
      showDialog: true,
      isAdd: false,
      editingId: id,
      formData: {
        title: item.title,
        promotionSubCode: item.promotionSubCode || 'MYJ',
        description: item.description || '',
        ladderDesc: item.ladderDesc || '',
        startTime: item.startTime ? String(item.startTime).slice(0, 10) : '',
        endTime: item.endTime ? String(item.endTime).slice(0, 10) : '',
      },
    });
  },

  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  // Radio 单选处理
  onRadioChange(e) {
    const { field, value } = e.currentTarget.dataset;
    this.setData({ [`formData.${field}`]: value });
  },

  onSave() {
    const { formData, isAdd, editingId } = this.data;
    if (!formData.title.trim() || !formData.startTime || !formData.endTime) {
      wx.showToast({ title: '请填写必填字段', icon: 'none' });
      return;
    }
    const payload = {
      title: formData.title.trim(),
      promotionSubCode: formData.promotionSubCode,
      description: formData.description || null,
      ladderDesc: formData.ladderDesc || null,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };
    const promise = isAdd ? createAdminPromotion(payload) : updateAdminPromotion(editingId, payload);
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
      title: '确认删除',
      content: '确定要禁用该促销活动吗？',
      success: (res) => {
        if (res.confirm) {
          deleteAdminPromotion(id).then((result) => {
            if (result && result.code === 'Success') {
              wx.showToast({ title: '已禁用', icon: 'success' });
              this.loadList();
            }
          });
        }
      },
    });
  },
});
