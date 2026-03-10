import { fetchDeliveryAreas, updateDeliveryAreaSetting, addDeliveryAreaSetting, deleteDeliveryAreaSetting } from '../../../services/admin/delivery';

Page({
  data: {
    areaList: [],
    showEditDialog: false,
    editingArea: null,
    formData: {
      areaName: '',
      description: '',
      baseFee: '',
      freeThreshold: '',
    },
    isAdd: false,
  },

  onLoad() {
    this.loadAreas();
  },

  loadAreas() {
    fetchDeliveryAreas().then((res) => {
      this.setData({ areaList: res.data || [] });
    });
  },

  onAdd() {
    this.setData({
      showEditDialog: true,
      isAdd: true,
      editingArea: null,
      formData: { areaName: '', description: '', baseFee: '', freeThreshold: '' },
    });
  },

  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    const area = this.data.areaList.find((a) => a.id === id);
    if (area) {
      this.setData({
        showEditDialog: true,
        isAdd: false,
        editingArea: area,
        formData: {
          areaName: area.areaName,
          description: area.description,
          baseFee: String(area.baseFee / 100),
          freeThreshold: String(area.freeThreshold / 100),
        },
      });
    }
  },

  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  onSave() {
    const { formData, isAdd, editingArea } = this.data;
    if (!formData.areaName.trim()) {
      wx.showToast({ title: '请输入区域名称', icon: 'none' });
      return;
    }

    const data = {
      areaName: formData.areaName,
      description: formData.description,
      baseFee: Math.round(parseFloat(formData.baseFee || 0) * 100),
      freeThreshold: Math.round(parseFloat(formData.freeThreshold || 0) * 100),
    };

    const promise = isAdd
      ? addDeliveryAreaSetting(data)
      : updateDeliveryAreaSetting(editingArea.id, data);

    promise.then((res) => {
      if (res.code === 'Success') {
        wx.showToast({ title: isAdd ? '添加成功' : '更新成功', icon: 'success' });
        this.setData({ showEditDialog: false });
        this.loadAreas();
      }
    });
  },

  onCancelEdit() {
    this.setData({ showEditDialog: false });
  },

  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该配送区域吗？',
      success: (res) => {
        if (res.confirm) {
          deleteDeliveryAreaSetting(id).then((result) => {
            if (result.code === 'Success') {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.loadAreas();
            }
          });
        }
      },
    });
  },
});
