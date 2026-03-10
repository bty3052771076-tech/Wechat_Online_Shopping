export function buildAuthHeader(storageKey = 'token') {
  const token = wx.getStorageSync(storageKey) || '';

  if (!token) {
    return {};
  }

  return {
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
  };
}

export function normalizeUserInfo(user = {}) {
  return {
    ...user,
    nickName: user.nickName || user.nickname || user.username || '',
    avatarUrl: user.avatarUrl || user.avatar_url || '',
    phoneNumber: user.phoneNumber || user.phone || '',
  };
}

export function normalizeAdminInfo(admin = {}) {
  return {
    ...admin,
    realName: admin.realName || admin.real_name || admin.username || '',
  };
}

export function normalizeUserAuthResponse(response) {
  if (!response || response.code !== 'Success' || !response.data) {
    return response;
  }

  return {
    ...response,
    data: {
      ...response.data,
      userInfo: normalizeUserInfo(response.data.user || response.data.userInfo || {}),
    },
  };
}

export function normalizeAdminAuthResponse(response) {
  if (!response || response.code !== 'Success' || !response.data) {
    return response;
  }

  return {
    ...response,
    data: {
      ...response.data,
      adminInfo: normalizeAdminInfo(response.data.adminInfo || {}),
    },
  };
}
