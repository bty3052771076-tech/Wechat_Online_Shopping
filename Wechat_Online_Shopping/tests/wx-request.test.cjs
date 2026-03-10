const test = require('node:test');
const assert = require('node:assert/strict');

test('requestJson wraps callback-style wx.request into a Promise', async () => {
  global.wx = {
    request(options) {
      setImmediate(() => {
        options.success({
          statusCode: 200,
          data: {
            code: 'Success',
            data: { token: 'abc123' },
            msg: '登录成功',
          },
        });
      });

      return {
        abort() {},
      };
    },
  };

  const { requestJson } = require('../services/_utils/request');
  const response = await requestJson({
    url: 'http://localhost:3000/api/users/login',
    method: 'POST',
    data: {
      username: 'testuser',
      password: '123456',
    },
  });

  assert.deepEqual(response, {
    code: 'Success',
    data: { token: 'abc123' },
    msg: '登录成功',
  });
});

test('requestJson rejects non-2xx responses from callback-style wx.request', async () => {
  global.wx = {
    request(options) {
      setImmediate(() => {
        options.success({
          statusCode: 401,
          data: {
            code: 'LoginFailed',
            msg: '用户名或密码错误',
          },
        });
      });

      return {
        abort() {},
      };
    },
    showToast() {},
  };

  const { requestJson } = require('../services/_utils/request');

  await assert.rejects(
    requestJson({
      url: 'http://localhost:3000/api/users/login',
      method: 'POST',
      data: {
        username: 'testuser',
        password: 'wrong',
      },
    }),
    (error) => {
      assert.equal(error.code, 'LoginFailed');
      assert.equal(error.msg, '用户名或密码错误');
      return true;
    },
  );
});
