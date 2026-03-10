/**
 * API测试脚本
 * 测试所有已实现的API端点
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log('\n' + '='.repeat(50));
  log(`📋 测试: ${testName}`, 'blue');
  console.log('='.repeat(50));
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
  tests: []
};

async function test(name, testFn) {
  try {
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'PASSED' });
    logSuccess(`${name} - 通过`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
    logError(`${name} - 失败: ${error.message}`);
  }
}

// ========================================
// 健康检查测试
// ========================================
async function testHealthCheck() {
  logTest('健康检查');
  await test('GET /health', async () => {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.status !== 200) throw new Error('状态码不是200');
    if (!response.data.status) throw new Error('响应缺少status字段');
    logInfo(`响应: ${JSON.stringify(response.data)}`);
  });
}

// ========================================
// 管理员认证测试
// ========================================
async function testAdminAuth() {
  logTest('管理员认证');

  let adminToken;

  // 测试登录 - 成功
  await test('POST /api/admin/login (成功)', async () => {
    const response = await axios.post(`${API_BASE}/api/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (response.data.code !== 'Success') throw new Error('登录失败');
    if (!response.data.data.token) throw new Error('未返回token');
    if (!response.data.data.adminInfo) throw new Error('未返回管理员信息');

    adminToken = response.data.data.token;
    logInfo(`Token: ${adminToken.substring(0, 20)}...`);
    logInfo(`管理员: ${response.data.data.adminInfo.username} (${response.data.data.adminInfo.role})`);
  });

  // 测试登录 - 失败（错误的用户名）
  await test('POST /api/admin/login (错误的用户名)', async () => {
    try {
      await axios.post(`${API_BASE}/api/admin/login`, {
        username: 'wronguser',
        password: 'admin123'
      });
      throw new Error('应该返回错误但返回了成功');
    } catch (error) {
      if (error.response && error.response.data.code === 'LoginFailed') {
        logInfo('正确返回了登录失败');
      } else {
        throw error;
      }
    }
  });

  // 测试登录 - 失败（错误的密码）
  await test('POST /api/admin/login (错误的密码)', async () => {
    try {
      await axios.post(`${API_BASE}/api/admin/login`, {
        username: 'admin',
        password: 'wrongpassword'
      });
      throw new Error('应该返回错误但返回了成功');
    } catch (error) {
      if (error.response && error.response.data.code === 'LoginFailed') {
        logInfo('正确返回了登录失败');
      } else {
        throw error;
      }
    }
  });

  // 测试获取管理员信息
  await test('GET /api/admin/profile', async () => {
    const response = await axios.get(`${API_BASE}/api/admin/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('获取失败');
    if (!response.data.data.id) throw new Error('缺少管理员ID');
    if (response.data.data.password) throw new Error('不应返回密码字段');

    logInfo(`管理员信息: ${response.data.data.username} - ${response.data.data.real_name}`);
  });

  // 测试未授权访问
  await test('GET /api/admin/profile (未授权)', async () => {
    try {
      await axios.get(`${API_BASE}/api/admin/profile`);
      throw new Error('应该返回未授权错误');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logInfo('正确返回了未授权错误');
      } else {
        throw error;
      }
    }
  });

  return adminToken;
}

// ========================================
// 用户认证测试
// ========================================
async function testUserAuth() {
  logTest('用户认证');

  let userToken;
  const testUsername = `testuser_${Date.now()}`;
  const testPhone = `139${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

  // 测试用户注册
  await test('POST /api/users/register', async () => {
    const response = await axios.post(`${API_BASE}/api/users/register`, {
      username: testUsername,
      password: '123456',
      phone: testPhone
    });

    if (response.data.code !== 'Success') throw new Error('注册失败');
    if (!response.data.data.token) throw new Error('未返回token');
    if (!response.data.data.user) throw new Error('未返回用户信息');

    userToken = response.data.data.token;
    logInfo(`新用户: ${response.data.data.user.username}`);
    logInfo(`Token: ${userToken.substring(0, 20)}...`);
  });

  // 测试重复注册
  await test('POST /api/users/register (重复用户名)', async () => {
    try {
      await axios.post(`${API_BASE}/api/users/register`, {
        username: testUsername,
        password: '123456'
      });
      throw new Error('应该返回用户已存在错误');
    } catch (error) {
      if (error.response && error.response.data.code === 'UserExists') {
        logInfo('正确返回了用户已存在错误');
      } else {
        throw error;
      }
    }
  });

  // 测试用户登录
  await test('POST /api/users/login', async () => {
    const response = await axios.post(`${API_BASE}/api/users/login`, {
      username: testUsername,
      password: '123456'
    });

    if (response.data.code !== 'Success') throw new Error('登录失败');
    if (!response.data.data.token) throw new Error('未返回token');

    userToken = response.data.data.token;
    logInfo(`登录成功: ${response.data.data.user.username}`);
  });

  // 测试获取用户信息
  await test('GET /api/users/profile', async () => {
    const response = await axios.get(`${API_BASE}/api/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('获取失败');
    if (response.data.data.password) throw new Error('不应返回密码字段');

    logInfo(`用户信息: ${response.data.data.username}`);
  });

  // 测试更新用户信息
  await test('PUT /api/users/profile', async () => {
    const response = await axios.put(`${API_BASE}/api/users/profile`, {
      nickname: '新昵称',
      gender: 1
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.code !== 'Success') throw new Error('更新失败');
    if (response.data.data.nickname !== '新昵称') throw new Error('昵称未更新');

    logInfo(`更新后的昵称: ${response.data.data.nickname}`);
  });

  return userToken;
}

// ========================================
// 已有用户登录测试
// ========================================
async function testExistingUserLogin() {
  logTest('已有用户登录');

  // 测试testuser登录
  await test('POST /api/users/login (testuser)', async () => {
    const response = await axios.post(`${API_BASE}/api/users/login`, {
      username: 'testuser',
      password: '123456'
    });

    if (response.data.code !== 'Success') throw new Error('登录失败');
    logInfo(`testuser登录成功`);
  });
}

// ========================================
// 错误处理测试
// ========================================
async function testErrorHandling() {
  logTest('错误处理');

  // 测试404错误
  await test('GET /api/notfound (404)', async () => {
    try {
      await axios.get(`${API_BASE}/api/notfound`);
      throw new Error('应该返回404');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logInfo('正确返回了404');
      } else {
        throw error;
      }
    }
  });

  // 测试无效参数
  await test('POST /api/users/login (缺少参数)', async () => {
    try {
      await axios.post(`${API_BASE}/api/users/login`, {
        username: 'test'
        // 缺少password
      });
      throw new Error('应该返回参数错误');
    } catch (error) {
      if (error.response && error.response.data.code === 'InvalidParam') {
        logInfo('正确返回了参数错误');
      } else {
        throw error;
      }
    }
  });
}

// ========================================
// 主测试流程
// ========================================
async function runTests() {
  console.log('\n' + '🚀'.repeat(25));
  log('开始API测试', 'blue');
  console.log('🚀'.repeat(25) + '\n');

  logInfo(`测试地址: ${API_BASE}`);
  logInfo(`测试时间: ${new Date().toLocaleString('zh-CN')}\n`);

  try {
    // 1. 健康检查
    await testHealthCheck();

    // 2. 管理员认证测试
    const adminToken = await testAdminAuth();

    // 3. 用户认证测试
    const userToken = await testUserAuth();

    // 4. 已有用户登录测试
    await testExistingUserLogin();

    // 5. 错误处理测试
    await testErrorHandling();

  } catch (error) {
    logError(`测试过程中发生错误: ${error.message}`);
  }

  // ========================================
  // 测试结果汇总
  // ========================================
  console.log('\n' + '='.repeat(50));
  log('📊 测试结果汇总', 'blue');
  console.log('='.repeat(50));

  const total = results.passed + results.failed;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

  log(`总测试数: ${total}`, 'reset');
  logSuccess(`通过: ${results.passed}`);
  logError(`失败: ${results.failed}`);
  logInfo(`通过率: ${passRate}%`);

  if (results.failed > 0) {
    console.log('\n失败的测试:');
    results.tests
      .filter(t => t.status === 'FAILED')
      .forEach(t => {
        logError(`  - ${t.name}: ${t.error}`);
      });
  }

  console.log('\n' + '='.repeat(50));
  if (results.failed === 0) {
    log('🎉 所有测试通过！', 'green');
  } else {
    log('⚠️  部分测试失败，请查看上述错误信息', 'yellow');
  }
  console.log('='.repeat(50) + '\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

// 运行测试
runTests().catch(error => {
  logError(`致命错误: ${error.message}`);
  process.exit(1);
});
