/**
 * 管理员 Mock 数据
 */

const adminUsers = [
  {
    id: 'admin_001',
    username: 'admin',
    password: 'admin123',
    realName: '系统管理员',
    role: 'super_admin',
    phone: '13800000001',
    lastLoginTime: '2026-03-04 09:00:00',
  },
  {
    id: 'admin_002',
    username: 'staff01',
    password: '123456',
    realName: '张工',
    role: 'staff',
    phone: '13800000002',
    lastLoginTime: '2026-03-03 14:30:00',
  },
];

// 管理员登录
export function mockAdminLogin(username, password) {
  const admin = adminUsers.find(
    (a) => a.username === username && a.password === password,
  );
  if (admin) {
    const { password: _, ...adminInfo } = admin;
    return {
      code: 'Success',
      data: {
        token: `admin_token_${Date.now()}`,
        adminInfo,
      },
      msg: '登录成功',
    };
  }
  return {
    code: 'Fail',
    data: null,
    msg: '账号或密码错误',
  };
}
