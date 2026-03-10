/**
 * API集成测试脚本
 * 全面测试所有API端点的功能
 * 测试范围：用户认证、管理员认证、商品、购物车、收货地址、订单、管理端功能
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';

// 测试凭证
const TEST_USER = {
  username: 'testuser',
  password: '123456'
};

const TEST_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'yellow');
}

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  tests: [],
  sections: []
};

// 辅助测试函数
async function test(name, testFn) {
  try {
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'PASSED' });
    logSuccess(name);
    return true;
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
    logError(`${name} - ${error.message}`);
    return false;
  }
}

// ========================================
// 1. 用户认证测试 (3个)
// ========================================
async function testUserAuth() {
  logSection('=== 用户认证测试 ===');

  let userToken;

  await test('用户登录（testuser/123456）', async () => {
    const response = await axios.post(`${API_BASE}/api/users/login`, {
      username: TEST_USER.username,
      password: TEST_USER.password
    });

    if (response.data.code !== 'Success') throw new Error('登录失败');
    if (!response.data.data.token) throw new Error('未返回token');
    if (!response.data.data.user) throw new Error('未返回用户信息');

    userToken = response.data.data.token;
    logInfo(`用户: ${response.data.data.user.username}`);
    logInfo(`Token: ${userToken.substring(0, 20)}...`);
  });

  await test('获取用户信息', async () => {
    const response = await axios.get(`${API_BASE}/api/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('获取用户信息失败');
    if (!response.data.data.id) throw new Error('缺少用户ID');
    if (response.data.data.password) throw new Error('不应返回密码字段');

    logInfo(`用户信息: ${response.data.data.username} - ${response.data.data.nickname || '无昵称'}`);
  });

  await test('验证token有效性', async () => {
    // 通过再次获取用户信息来验证token
    const response = await axios.get(`${API_BASE}/api/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('token验证失败');
    logInfo('Token有效');
  });

  return userToken;
}

// ========================================
// 2. 管理员认证测试 (2个)
// ========================================
async function testAdminAuth() {
  logSection('=== 管理员认证测试 ===');

  let adminToken;

  await test('管理员登录（admin/admin123）', async () => {
    const response = await axios.post(`${API_BASE}/api/admin/login`, {
      username: TEST_ADMIN.username,
      password: TEST_ADMIN.password
    });

    if (response.data.code !== 'Success') throw new Error('管理员登录失败');
    if (!response.data.data.token) throw new Error('未返回token');
    if (!response.data.data.adminInfo) throw new Error('未返回管理员信息');

    adminToken = response.data.data.token;
    logInfo(`管理员: ${response.data.data.adminInfo.username} (${response.data.data.adminInfo.role})`);
    logInfo(`Token: ${adminToken.substring(0, 20)}...`);
  });

  await test('获取管理员信息', async () => {
    const response = await axios.get(`${API_BASE}/api/admin/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('获取管理员信息失败');
    if (!response.data.data.id) throw new Error('缺少管理员ID');

    logInfo(`管理员信息: ${response.data.data.username} - ${response.data.data.real_name || '无姓名'}`);
  });

  return adminToken;
}

// ========================================
// 3. 商品API测试 (4个)
// ========================================
async function testProductAPI() {
  logSection('=== 商品API测试 ===');

  let productId;

  await test('获取商品列表', async () => {
    const response = await axios.get(`${API_BASE}/api/products/list`, {
      params: { page: 1, pageSize: 10 }
    });

    if (response.data.code !== 'Success') throw new Error('获取商品列表失败');
    if (!response.data.data.list) throw new Error('缺少商品列表数据');
    if (!response.data.data.pagination) throw new Error('缺少分页信息');

    logInfo(`商品数量: ${response.data.data.list.length}`);
    if (response.data.data.list.length > 0) {
      productId = response.data.data.list[0].id;
      logInfo(`第一个商品ID: ${productId}`);
    }
  });

  await test('获取商品详情', async () => {
    if (!productId) {
      // 如果没有商品，使用默认ID
      productId = 1;
    }

    const response = await axios.get(`${API_BASE}/api/products/detail/${productId}`);

    if (response.data.code !== 'Success') throw new Error('获取商品详情失败');
    if (!response.data.data.id) throw new Error('缺少商品ID');
    if (!response.data.data.name) throw new Error('缺少商品名称');

    logInfo(`商品详情: ${response.data.data.name} - ¥${response.data.data.price}`);
  });

  await test('获取分类列表', async () => {
    const response = await axios.get(`${API_BASE}/api/products/categories/list`);

    if (response.data.code !== 'Success') throw new Error('获取分类列表失败');
    if (!Array.isArray(response.data.data)) throw new Error('分类列表应为数组');

    logInfo(`分类数量: ${response.data.data.length}`);
  });

  await test('获取分类树', async () => {
    const response = await axios.get(`${API_BASE}/api/products/categories/tree`);

    if (response.data.code !== 'Success') throw new Error('获取分类树失败');
    if (!Array.isArray(response.data.data)) throw new Error('分类树应为数组');

    logInfo(`分类树层级: ${JSON.stringify(response.data.data).substring(0, 100)}...`);
  });
}

// ========================================
// 4. 购物车API测试 (4个)
// ========================================
async function testCartAPI(userToken) {
  logSection('=== 购物车API测试 ===');

  let cartItemId;

  await test('加入购物车', async () => {
    const response = await axios.post(`${API_BASE}/api/cart/add`, {
      product_id: 1,
      quantity: 2
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('加入购物车失败');
    if (!response.data.data.id) throw new Error('缺少购物车项ID');

    cartItemId = response.data.data.id;
    logInfo(`购物车项ID: ${cartItemId}`);
  });

  await test('获取购物车列表', async () => {
    const response = await axios.get(`${API_BASE}/api/cart/list`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('获取购物车列表失败');
    if (!Array.isArray(response.data.data)) throw new Error('购物车列表应为数组');

    logInfo(`购物车商品数量: ${response.data.data.length}`);
  });

  await test('修改购物车', async () => {
    if (!cartItemId) {
      logInfo('没有购物车项可修改，跳过');
      return;
    }

    const response = await axios.put(`${API_BASE}/api/cart/update`, {
      id: cartItemId,
      quantity: 3
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('修改购物车失败');
    if (response.data.data.quantity !== 3) throw new Error('数量未更新');

    logInfo(`修改后数量: ${response.data.data.quantity}`);
  });

  await test('删除购物车商品', async () => {
    if (!cartItemId) {
      logInfo('没有购物车项可删除，跳过');
      return;
    }

    const response = await axios.delete(`${API_BASE}/api/cart/delete/${cartItemId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('删除购物车商品失败');

    logInfo('删除成功');
  });
}

// ========================================
// 5. 收货地址API测试 (3个)
// ========================================
async function testAddressAPI(userToken) {
  logSection('=== 收货地址API测试 ===');

  let addressId;

  await test('添加收货地址', async () => {
    const response = await axios.post(`${API_BASE}/api/addresses`, {
      receiver_name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail_address: '某某街道123号',
      is_default: 0
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('添加收货地址失败');
    if (!response.data.data.id) throw new Error('缺少地址ID');

    addressId = response.data.data.id;
    logInfo(`地址ID: ${addressId}`);
    logInfo(`地址: ${response.data.data.province}${response.data.data.city}${response.data.data.district}`);
  });

  await test('获取地址列表', async () => {
    const response = await axios.get(`${API_BASE}/api/addresses`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('获取地址列表失败');
    if (!Array.isArray(response.data.data)) throw new Error('地址列表应为数组');

    logInfo(`地址数量: ${response.data.data.length}`);
  });

  await test('设置默认地址', async () => {
    if (!addressId) {
      logInfo('没有地址可设置，跳过');
      return;
    }

    const response = await axios.put(`${API_BASE}/api/addresses/${addressId}/default`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('设置默认地址失败');
    if (response.data.data.is_default !== 1) throw new Error('默认地址未设置');

    logInfo('默认地址设置成功');
  });
}

// ========================================
// 6. 订单API测试 (3个)
// ========================================
async function testOrderAPI(userToken) {
  logSection('=== 订单API测试 ===');

  let orderId;

  await test('创建订单', async () => {
    const response = await axios.post(`${API_BASE}/api/orders/create`, {
      items: [
        { product_id: 1, quantity: 1 }
      ],
      address_id: 1
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('创建订单失败');
    if (!response.data.data.id) throw new Error('缺少订单ID');

    orderId = response.data.data.id;
    logInfo(`订单ID: ${orderId}`);
    logInfo(`订单号: ${response.data.data.order_no}`);
    logInfo(`总金额: ¥${response.data.data.total_amount}`);
  });

  await test('获取订单列表', async () => {
    const response = await axios.get(`${API_BASE}/api/orders/list`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('获取订单列表失败');
    if (!Array.isArray(response.data.data)) throw new Error('订单列表应为数组');

    logInfo(`订单数量: ${response.data.data.length}`);
  });

  await test('获取订单详情', async () => {
    if (!orderId) {
      logInfo('没有订单可查询，跳过');
      return;
    }

    const response = await axios.get(`${API_BASE}/api/orders/detail/${orderId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('获取订单详情失败');
    if (!response.data.data.id) throw new Error('缺少订单详情');

    logInfo(`订单状态: ${response.data.data.status}`);
  });
}

// ========================================
// 7. 管理端商品API测试 (3个)
// ========================================
async function testAdminProductAPI(adminToken) {
  logSection('=== 管理端商品API测试 ===');

  let productId;

  await test('获取商品列表（管理端）', async () => {
    const response = await axios.get(`${API_BASE}/api/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('获取商品列表失败');
    if (!response.data.data.list) throw new Error('缺少商品列表数据');

    logInfo(`商品数量: ${response.data.data.list.length}`);
  });

  await test('添加商品（测试数据）', async () => {
    const response = await axios.post(`${API_BASE}/api/admin/products`, {
      name: '集成测试商品',
      category_id: 1,
      price: 99.99,
      stock: 100,
      description: '这是一个集成测试添加的商品'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('添加商品失败');
    if (!response.data.data.id) throw new Error('缺少商品ID');

    productId = response.data.data.id;
    logInfo(`新商品ID: ${productId}`);
    logInfo(`商品名称: ${response.data.data.name}`);
  });

  await test('更新商品状态', async () => {
    if (!productId) {
      logInfo('没有商品可更新，跳过');
      return;
    }

    const response = await axios.put(`${API_BASE}/api/admin/products/${productId}`, {
      status: 0  // 下架
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('更新商品状态失败');
    if (response.data.data.status !== 0) throw new Error('状态未更新');

    logInfo('商品已下架');
  });
}

// ========================================
// 8. 管理端订单API测试 (2个)
// ========================================
async function testAdminOrderAPI(adminToken) {
  logSection('=== 管理端订单API测试 ===');

  let orderId;

  await test('获取订单列表（管理端）', async () => {
    const response = await axios.get(`${API_BASE}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('获取订单列表失败');
    if (!response.data.data.list) throw new Error('缺少订单列表数据');

    logInfo(`订单数量: ${response.data.data.list.length}`);
    if (response.data.data.list.length > 0) {
      orderId = response.data.data.list[0].id;
      logInfo(`第一个订单ID: ${orderId}`);
    }
  });

  await test('订单发货', async () => {
    if (!orderId) {
      logInfo('没有订单可发货，跳过');
      return;
    }

    const response = await axios.put(`${API_BASE}/api/admin/orders/${orderId}/ship`, {
      tracking_number: 'SF1234567890'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('订单发货失败');
    if (response.data.data.status !== 'shipped') throw new Error('订单状态未更新');

    logInfo('订单已发货');
    logInfo(`物流单号: ${response.data.data.tracking_number}`);
  });
}

// ========================================
// 主测试流程
// ========================================
async function runTests() {
  const startTime = Date.now();

  console.log('\n' + '🧪'.repeat(30));
  log('开始集成测试...', 'cyan');
  console.log('🧪'.repeat(30) + '\n');

  logInfo(`测试地址: ${API_BASE}`);
  logInfo(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
  logInfo(`测试用户: ${TEST_USER.username}`);
  logInfo(`测试管理员: ${TEST_ADMIN.username}\n`);

  try {
    // 1. 用户认证测试
    const userToken = await testUserAuth();

    // 2. 管理员认证测试
    const adminToken = await testAdminAuth();

    // 3. 商品API测试（无需认证）
    await testProductAPI();

    // 4. 购物车API测试（需要用户token）
    await testCartAPI(userToken);

    // 5. 收货地址API测试（需要用户token）
    await testAddressAPI(userToken);

    // 6. 订单API测试（需要用户token）
    await testOrderAPI(userToken);

    // 7. 管理端商品API测试（需要管理员token）
    await testAdminProductAPI(adminToken);

    // 8. 管理端订单API测试（需要管理员token）
    await testAdminOrderAPI(adminToken);

  } catch (error) {
    logError(`测试过程中发生严重错误: ${error.message}`);
    console.error(error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // ========================================
  // 测试结果汇总
  // ========================================
  console.log('\n' + '='.repeat(60));
  log('📊 测试结果汇总', 'cyan');
  console.log('='.repeat(60));

  const total = results.passed + results.failed;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

  log(`总测试数: ${total}`, 'reset');
  logSuccess(`通过: ${results.passed}`);
  logError(`失败: ${results.failed}`);
  logInfo(`通过率: ${passRate}%`);
  logInfo(`执行时间: ${duration}秒`);

  if (results.failed > 0) {
    console.log('\n失败的测试:');
    results.tests
      .filter(t => t.status === 'FAILED')
      .forEach(t => {
        logError(`  - ${t.name}: ${t.error}`);
      });
  }

  console.log('\n' + '='.repeat(60));
  if (results.failed === 0) {
    log(`📊 测试结果: ${results.passed}/${total} 通过`, 'green');
    log(`✅ 通过率: ${passRate}%`, 'green');
  } else {
    log(`📊 测试结果: ${results.passed}/${total} 通过`, 'yellow');
    log(`⚠️  通过率: ${passRate}%`, 'yellow');
  }
  console.log('='.repeat(60) + '\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

// 运行测试
runTests().catch(error => {
  logError(`致命错误: ${error.message}`);
  console.error(error);
  process.exit(1);
});
