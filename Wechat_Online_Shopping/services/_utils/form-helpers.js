const DEFAULT_PHONE_REG = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$';
const DEFAULT_NAME_REG = '^[a-zA-Z\\d\\u4e00-\\u9fa5\\s]+$';

function validateAddressForm(locationState = {}, options = {}) {
  const { phoneReg = DEFAULT_PHONE_REG, nameReg = DEFAULT_NAME_REG } = options;
  const { name, phone, detailAddress, districtName } = locationState;
  const nameRegExp = new RegExp(String(nameReg));
  const phoneRegExp = new RegExp(String(phoneReg));

  if (!name || !String(name).trim()) {
    return {
      isLegal: false,
      tips: '请填写收货人',
    };
  }

  if (!nameRegExp.test(String(name).trim())) {
    return {
      isLegal: false,
      tips: '收货人仅支持输入中文、英文（区分大小写）、数字',
    };
  }

  if (!phone || !String(phone).trim()) {
    return {
      isLegal: false,
      tips: '请填写手机号',
    };
  }

  if (!phoneRegExp.test(String(phone).trim())) {
    return {
      isLegal: false,
      tips: '请填写正确的手机号',
    };
  }

  if (!districtName || !String(districtName).trim()) {
    return {
      isLegal: false,
      tips: '请选择省市区信息',
    };
  }

  if (!detailAddress || !String(detailAddress).trim()) {
    return {
      isLegal: false,
      tips: '请完善详细地址',
    };
  }

  if (String(detailAddress).trim().length > 50) {
    return {
      isLegal: false,
      tips: '详细地址不能超过50个字符',
    };
  }

  return {
    isLegal: true,
    tips: '添加成功',
  };
}

function collectChildMethodCalls(children = [], indexes = [], methodName, value) {
  return indexes.reduce((stack, index) => {
    const child = children[index];

    if (!child || typeof child[methodName] !== 'function') {
      return stack;
    }

    stack.push(child[methodName](value));
    return stack;
  }, []);
}

module.exports = {
  validateAddressForm,
  collectChildMethodCalls,
  DEFAULT_PHONE_REG,
  DEFAULT_NAME_REG,
};
