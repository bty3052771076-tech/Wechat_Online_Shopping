const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { startServer } = require('../src/app');

let server;
let api;

test.before(async () => {
  server = await new Promise((resolve, reject) => {
    const instance = startServer(0);
    instance.once('listening', () => resolve(instance));
    instance.once('error', reject);
  });

  const { port } = server.address();
  api = axios.create({
    baseURL: `http://127.0.0.1:${port}`,
    timeout: 15000,
    validateStatus: () => true,
  });
});

test.after(async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function registerUser() {
  const stamp = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  const payload = {
    username: `api_test_user_${stamp}`,
    password: '123456',
    phone: `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
  };

  const response = await api.post('/api/users/register', payload);

  assert.equal(response.status, 201, JSON.stringify(response.data));
  assert.equal(response.data.code, 'Success', JSON.stringify(response.data));

  return payload;
}

test('health and 404 responses use the expected envelope', async () => {
  const healthResponse = await api.get('/health');

  assert.equal(healthResponse.status, 200, JSON.stringify(healthResponse.data));
  assert.equal(healthResponse.data.status, 'ok');

  const missingResponse = await api.get('/api/notfound');
  assert.equal(missingResponse.status, 404, JSON.stringify(missingResponse.data));
  assert.equal(missingResponse.data.code, 'NotFound', JSON.stringify(missingResponse.data));
});

test('admin auth succeeds for seeded admin and rejects anonymous profile access', async () => {
  const loginResponse = await api.post('/api/admin/login', {
    username: 'admin',
    password: 'admin123',
  });

  assert.equal(loginResponse.status, 200, JSON.stringify(loginResponse.data));
  assert.equal(loginResponse.data.code, 'Success', JSON.stringify(loginResponse.data));
  assert.ok(loginResponse.data.data.token);

  const profileResponse = await api.get('/api/admin/profile', {
    headers: authHeaders(loginResponse.data.data.token),
  });

  assert.equal(profileResponse.status, 200, JSON.stringify(profileResponse.data));
  assert.equal(profileResponse.data.code, 'Success', JSON.stringify(profileResponse.data));
  assert.equal(profileResponse.data.data.username, 'admin');
  assert.equal(Object.prototype.hasOwnProperty.call(profileResponse.data.data, 'password'), false);

  const unauthorizedResponse = await api.get('/api/admin/profile');
  assert.equal(unauthorizedResponse.status, 401, JSON.stringify(unauthorizedResponse.data));
});

test('user register, login, profile and profile update work for a fresh user', async () => {
  const credentials = await registerUser();

  const loginResponse = await api.post('/api/users/login', {
    username: credentials.username,
    password: credentials.password,
  });

  assert.equal(loginResponse.status, 200, JSON.stringify(loginResponse.data));
  assert.equal(loginResponse.data.code, 'Success', JSON.stringify(loginResponse.data));
  assert.ok(loginResponse.data.data.token);

  const token = loginResponse.data.data.token;
  const profileResponse = await api.get('/api/users/profile', {
    headers: authHeaders(token),
  });

  assert.equal(profileResponse.status, 200, JSON.stringify(profileResponse.data));
  assert.equal(profileResponse.data.code, 'Success', JSON.stringify(profileResponse.data));
  assert.equal(profileResponse.data.data.username, credentials.username);
  assert.equal(Object.prototype.hasOwnProperty.call(profileResponse.data.data, 'password'), false);

  const updateResponse = await api.put(
    '/api/users/profile',
    {
      nickname: 'API Test Nickname',
      gender: 1,
    },
    {
      headers: authHeaders(token),
    },
  );

  assert.equal(updateResponse.status, 200, JSON.stringify(updateResponse.data));
  assert.equal(updateResponse.data.code, 'Success', JSON.stringify(updateResponse.data));
  assert.equal(updateResponse.data.data.nickname, 'API Test Nickname');
});

test('auth endpoints reject invalid or incomplete credentials', async () => {
  const invalidAdminResponse = await api.post('/api/admin/login', {
    username: 'admin',
    password: 'wrongpassword',
  });
  assert.equal(invalidAdminResponse.status, 401, JSON.stringify(invalidAdminResponse.data));
  assert.equal(invalidAdminResponse.data.code, 'LoginFailed', JSON.stringify(invalidAdminResponse.data));

  const invalidUserResponse = await api.post('/api/users/login', {
    username: 'testuser',
    password: 'wrongpassword',
  });
  assert.equal(invalidUserResponse.status, 401, JSON.stringify(invalidUserResponse.data));
  assert.equal(invalidUserResponse.data.code, 'LoginFailed', JSON.stringify(invalidUserResponse.data));

  const missingParamResponse = await api.post('/api/users/login', {
    username: 'testuser',
  });
  assert.equal(missingParamResponse.status, 400, JSON.stringify(missingParamResponse.data));
  assert.equal(missingParamResponse.data.code, 'InvalidParam', JSON.stringify(missingParamResponse.data));
});
