/**
 * 管理端用户管理 Mock 数据
 */

const adminUserList = [
  {
    id: 'user_001',
    nickName: '测试用户',
    avatarUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar-1.png',
    phoneNumber: '13800138000',
    email: 'test@example.com',
    registerTime: '2025-12-01 10:00:00',
    totalOrders: 15,
    totalSpent: 89970,
    remark: 'VIP客户',
    orderHistory: [
      { orderNo: 'ORD20260301001', totalAmount: 59990, statusName: '待发货', createTime: '2026-03-01 10:30:00' },
      { orderNo: 'ORD20260303003', totalAmount: 9900, statusName: '待支付', createTime: '2026-03-03 09:00:00' },
    ],
  },
  {
    id: 'user_002',
    nickName: '张三',
    avatarUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar-2.png',
    phoneNumber: '13900139000',
    email: 'zhangsan@example.com',
    registerTime: '2026-01-15 14:30:00',
    totalOrders: 8,
    totalSpent: 59700,
    remark: '',
    orderHistory: [
      { orderNo: 'ORD20260302002', totalAmount: 29800, statusName: '待收货', createTime: '2026-03-02 14:20:00' },
      { orderNo: 'ORD20260228004', totalAmount: 29900, statusName: '已完成', createTime: '2026-02-28 16:45:00' },
    ],
  },
  {
    id: 'user_003',
    nickName: '李四',
    avatarUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar-3.png',
    phoneNumber: '13700137000',
    email: '',
    registerTime: '2026-02-20 09:15:00',
    totalOrders: 3,
    totalSpent: 15800,
    remark: '新用户',
    orderHistory: [
      { orderNo: 'ORD20260310005', totalAmount: 15800, statusName: '已完成', createTime: '2026-03-10 11:20:00' },
    ],
  },
  {
    id: 'user_004',
    nickName: '王五',
    avatarUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar-4.png',
    phoneNumber: '13600136000',
    email: 'wangwu@example.com',
    registerTime: '2026-03-01 08:00:00',
    totalOrders: 0,
    totalSpent: 0,
    remark: '',
    orderHistory: [],
  },
];

// 获取用户列表
export function getAdminUserList(keyword) {
  if (keyword) {
    return adminUserList.filter(
      (u) => u.nickName.includes(keyword) || u.phoneNumber.includes(keyword)
    );
  }
  return [...adminUserList];
}

// 获取用户详情
export function getAdminUserDetail(userId) {
  return adminUserList.find((u) => u.id === userId) || null;
}

// 更新用户备注
export function updateUserRemark(userId, remark) {
  const user = adminUserList.find((u) => u.id === userId);
  if (user) {
    user.remark = remark;
    return true;
  }
  return false;
}
