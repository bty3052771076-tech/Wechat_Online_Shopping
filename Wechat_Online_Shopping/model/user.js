/**
 * 用户认证 Mock 数据
 */

// 已注册用户列表
const registeredUsers = [
  {
    id: 'user_001',
    username: 'testuser',
    password: '123456',
    nickName: '测试用户',
    avatarUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/components-exp/avatar/avatar-1.jpg',
    phoneNumber: '13800138000',
    email: 'test@example.com',
    gender: 1,
    openId: 'mock_openid_001',
    registerTime: '2026-01-15 10:30:00',
    totalOrders: 12,
    totalSpent: 259800, // 单位：分
  },
  {
    id: 'user_002',
    username: 'zhangsan',
    password: '654321',
    nickName: '张三',
    avatarUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/components-exp/avatar/avatar-1.jpg',
    phoneNumber: '13900139000',
    email: 'zhangsan@example.com',
    gender: 1,
    openId: 'mock_openid_002',
    registerTime: '2026-02-01 08:00:00',
    totalOrders: 5,
    totalSpent: 89900,
  },
];

// 模拟登录
export function mockLogin(username, password) {
  const user = registeredUsers.find(
    (u) => u.username === username && u.password === password,
  );
  if (user) {
    const { password: _, ...userInfo } = user;
    return {
      code: 'Success',
      data: {
        token: `mock_token_${Date.now()}`,
        userInfo,
      },
      msg: '登录成功',
    };
  }
  return {
    code: 'Fail',
    data: null,
    msg: '用户名或密码错误',
  };
}

// 模拟微信登录
export function mockWechatLogin() {
  const user = registeredUsers[0];
  const { password: _, ...userInfo } = user;
  return {
    code: 'Success',
    data: {
      token: `mock_token_wechat_${Date.now()}`,
      userInfo,
    },
    msg: '微信登录成功',
  };
}

// 模拟注册
export function mockRegister(userInfo) {
  const exists = registeredUsers.find(
    (u) => u.username === userInfo.username,
  );
  if (exists) {
    return {
      code: 'Fail',
      data: null,
      msg: '用户名已存在',
    };
  }
  const newUser = {
    id: `user_${Date.now()}`,
    username: userInfo.username,
    password: userInfo.password,
    nickName: userInfo.nickName || userInfo.username,
    avatarUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/components-exp/avatar/avatar-1.jpg',
    phoneNumber: userInfo.phoneNumber || '',
    email: userInfo.email || '',
    gender: 0,
    openId: `mock_openid_${Date.now()}`,
    registerTime: new Date().toISOString(),
    totalOrders: 0,
    totalSpent: 0,
  };
  registeredUsers.push(newUser);
  const { password: _, ...info } = newUser;
  return {
    code: 'Success',
    data: {
      token: `mock_token_${Date.now()}`,
      userInfo: info,
    },
    msg: '注册成功',
  };
}

// 获取所有注册用户列表（管理端使用）
export function getAllUsers() {
  return registeredUsers.map((u) => {
    const { password: _, ...info } = u;
    return info;
  });
}
