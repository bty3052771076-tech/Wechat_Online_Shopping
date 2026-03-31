import { fetchAdminBannerList, createAdminBanner, updateAdminBanner, deleteAdminBanner } from '../../../services/admin/banner';

const STATUS_LABELS = { 0: '已隐藏', 1: '显示中' };

Page({
  data: {
    list: [],
    showDialog: false,
    isAdd: false,
    editingId: null,
    formData: {
      title: '',
      imageUrl: '',
      linkValue: '',
      sortOrder: '0',
      startTime: '',
      endTime: '',
    },
  },

  onLoad() {
    this.loadList();
  },

  loadList() {
    fetchAdminBannerList().then((res) => {
      const list = Array.isArray(res && res.data) ? res.data : [];
      this.setData({
        list: list.map((item) => ({
          ...item,
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
      formData: { title: '', imageUrl: '', linkValue: '', sortOrder: '0', startTime: '', endTime: '' },
    });
  },

  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.list.find((b) => b.id === id);
    if (!item) return;
    this.setData({
      showDialog: true,
      isAdd: false,
      editingId: id,
      formData: {
        title: item.title,
        imageUrl: item.imageUrl,
        linkValue: item.linkValue || '',
        sortOrder: String(item.sortOrder),
        startTime: item.startTime ? String(item.startTime).slice(0, 10) : '',
        endTime: item.endTime ? String(item.endTime).slice(0, 10) : '',
      },
    });
  },

  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  onSave() {
    const { formData, isAdd, editingId } = this.data;
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      wx.showToast({ title: '请填写标题和图片URL', icon: 'none' });
      return;
    }
    const payload = {
      title: formData.title.trim(),
      imageUrl: formData.imageUrl.trim(),
      linkValue: formData.linkValue || null,
      sortOrder: Number(formData.sortOrder || 0),
      startTime: formData.startTime || null,
      endTime: formData.endTime || null,
    };
    const promise = isAdd ? createAdminBanner(payload) : updateAdminBanner(editingId, payload);
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
      content: '确定要隐藏该Banner吗？',
      success: (res) => {
        if (res.confirm) {
          deleteAdminBanner(id).then((result) => {
            if (result && result.code === 'Success') {
              wx.showToast({ title: '已隐藏', icon: 'success' });
              this.loadList();
            }
          });
        }
      },
    });
  },
});
