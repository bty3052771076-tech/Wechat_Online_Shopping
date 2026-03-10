function request(options = {}) {
  const { success: onSuccess, fail: onFail, ...requestOptions } = options;

  return new Promise((resolve, reject) => {
    if (typeof wx === 'undefined' || !wx || typeof wx.request !== 'function') {
      reject(new Error('wx.request is not available'));
      return;
    }

    try {
      wx.request({
        ...requestOptions,
        success(response) {
          if (typeof onSuccess === 'function') {
            onSuccess(response);
          }

          resolve(response);
        },
        fail(error) {
          if (typeof onFail === 'function') {
            onFail(error);
          }

          reject(error);
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}

function requestJson(options = {}) {
  return request(options).then((response) => {
    if (response && response.statusCode >= 200 && response.statusCode < 300) {
      return response.data;
    }

    return Promise.reject((response && response.data) || response);
  });
}

function getRequestErrorMessage(error, fallback = '网络错误') {
  if (!error) {
    return fallback;
  }

  return error.msg || error.message || error.errMsg || fallback;
}

module.exports = {
  getRequestErrorMessage,
  request,
  requestJson,
};
