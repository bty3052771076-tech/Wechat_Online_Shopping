import { config } from '../../config/index';

const { requestJson } = require('../_utils/request');
const { buildAuthHeader } = require('../_utils/auth');
const { buildPersonProfile } = require('../_utils/usercenter-adapters');

function mockFetchPerson() {
  const { delay } = require('../_utils/delay');
  const { genSimpleUserInfo } = require('../../model/usercenter');
  const { genAddress } = require('../../model/address');
  const address = genAddress();
  return delay().then(() => ({
    ...genSimpleUserInfo(),
    address: {
      provinceName: address.provinceName,
      provinceCode: address.provinceCode,
      cityName: address.cityName,
      cityCode: address.cityCode,
    },
  }));
}

export function fetchPerson() {
  if (config.useMock) {
    return mockFetchPerson();
  }

  return Promise.all([
    requestJson({
      url: `${config.apiBaseURL}/users/profile`,
      method: 'GET',
      header: {
        ...buildAuthHeader(),
      },
    }),
    requestJson({
      url: `${config.apiBaseURL}/addresses`,
      method: 'GET',
      header: {
        ...buildAuthHeader(),
      },
    }),
  ]).then(([profileResponse, addressesResponse]) =>
    buildPersonProfile({
      profile: profileResponse && profileResponse.data ? profileResponse.data : {},
      addresses: Array.isArray(addressesResponse && addressesResponse.data) ? addressesResponse.data : [],
    }),
  );
}
