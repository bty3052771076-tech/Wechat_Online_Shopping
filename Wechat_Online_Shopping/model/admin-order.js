/**
 * 管理端订单与售后 Mock 数据
 */

const adminOrders = [
  {
    orderNo: 'ORD20260301001',
    userId: 'user_001',
    userName: '测试用户',
    phone: '13800138000',
    address: '广东省深圳市南山区科技园XX路XX号',
    status: 10, // 5待支付 10待发货 40待收货 50已完成 60待评价 80已取消
    statusName: '待发货',
    totalAmount: 59990,
    freightFee: 0,
    remark: '请尽快发货',
    createTime: '2026-03-01 10:30:00',
    expressCompany: '',
    expressNo: '',
    goodsList: [
      { name: '智能手机 Pro Max 5G旗舰', spec: '128GB/黑色', price: 599900, quantity: 1, image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png' },
    ],
  },
  {
    orderNo: 'ORD20260302002',
    userId: 'user_002',
    userName: '张三',
    phone: '13900139000',
    address: '北京市朝阳区建国路XX号',
    status: 40,
    statusName: '待收货',
    totalAmount: 29800,
    freightFee: 500,
    remark: '',
    createTime: '2026-03-02 14:20:00',
    expressCompany: '顺丰速运',
    expressNo: 'SF1234567890',
    goodsList: [
      { name: '白色短袖连衣裙', spec: 'M/白色', price: 29800, quantity: 1, image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png' },
    ],
  },
  {
    orderNo: 'ORD20260303003',
    userId: 'user_001',
    userName: '测试用户',
    phone: '13800138000',
    address: '广东省深圳市南山区科技园XX路XX号',
    status: 5,
    statusName: '待支付',
    totalAmount: 9900,
    freightFee: 0,
    remark: '',
    createTime: '2026-03-03 09:00:00',
    expressCompany: '',
    expressNo: '',
    goodsList: [
      { name: '腾讯极光盒子4', spec: '经典白/经典套装', price: 9900, quantity: 1, image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-3a.png' },
    ],
  },
  {
    orderNo: 'ORD20260228004',
    userId: 'user_002',
    userName: '张三',
    phone: '13900139000',
    address: '北京市朝阳区建国路XX号',
    status: 50,
    statusName: '已完成',
    totalAmount: 29900,
    freightFee: 0,
    remark: '金色款',
    createTime: '2026-02-28 16:45:00',
    expressCompany: '中通快递',
    expressNo: 'ZT9876543210',
    goodsList: [
      { name: '不锈钢刀叉勺套装', spec: '六件套/金色', price: 29900, quantity: 1, image: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2b.png' },
    ],
  },
];

const afterSaleList = [
  {
    id: 'AS20260303001',
    orderNo: 'ORD20260228004',
    userId: 'user_002',
    userName: '张三',
    type: 10, // 10退货退款 20仅退款
    typeName: '退货退款',
    status: 10, // 10待审核 20已审核 50已完成 60已关闭
    statusName: '待审核',
    reason: '商品有划痕',
    evidence: ['https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2b.png'],
    refundAmount: 29900,
    createTime: '2026-03-03 11:00:00',
    goodsName: '不锈钢刀叉勺套装',
    goodsImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2b.png',
  },
  {
    id: 'AS20260302002',
    orderNo: 'ORD20260302002',
    userId: 'user_002',
    userName: '张三',
    type: 20,
    typeName: '仅退款',
    status: 50,
    statusName: '已完成',
    reason: '不想要了',
    evidence: [],
    refundAmount: 29800,
    createTime: '2026-03-02 18:00:00',
    goodsName: '白色短袖连衣裙',
    goodsImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-09a.png',
  },
];

// 获取管理端订单列表
export function getAdminOrderList(filters = {}) {
  let list = [...adminOrders];
  if (filters.orderNo) {
    list = list.filter((o) => o.orderNo.includes(filters.orderNo));
  }
  if (filters.userName) {
    list = list.filter((o) => o.userName.includes(filters.userName));
  }
  if (filters.phone) {
    list = list.filter((o) => o.phone.includes(filters.phone));
  }
  if (filters.status && filters.status !== -1) {
    list = list.filter((o) => o.status === filters.status);
  }
  if (filters.startDate) {
    list = list.filter((o) => o.createTime >= filters.startDate);
  }
  if (filters.endDate) {
    list = list.filter((o) => o.createTime <= filters.endDate + ' 23:59:59');
  }
  return list;
}

// 获取订单详情
export function getAdminOrderDetail(orderNo) {
  return adminOrders.find((o) => o.orderNo === orderNo) || null;
}

// 订单发货
export function shipOrder(orderNo, expressCompany, expressNo) {
  const order = adminOrders.find((o) => o.orderNo === orderNo);
  if (order) {
    order.status = 40;
    order.statusName = '待收货';
    order.expressCompany = expressCompany;
    order.expressNo = expressNo;
    return true;
  }
  return false;
}

// 获取售后列表
export function getAdminAfterSaleList(status) {
  if (status && status !== -1) {
    return afterSaleList.filter((a) => a.status === status);
  }
  return [...afterSaleList];
}

// 获取售后详情
export function getAdminAfterSaleDetail(id) {
  return afterSaleList.find((a) => a.id === id) || null;
}

// 审核售后
export function auditAfterSale(id, approved) {
  const item = afterSaleList.find((a) => a.id === id);
  if (item) {
    item.status = approved ? 50 : 60;
    item.statusName = approved ? '已完成' : '已关闭';
    return true;
  }
  return false;
}
