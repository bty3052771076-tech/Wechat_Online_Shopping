const bcrypt = require('bcrypt');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function resetPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wechat_shop',
  });

  try {
    // 生成密码哈希
    const password = '123456';
    const hash = await bcrypt.hash(password, 10);

    console.log('生成的密码哈希:', hash);

    // 更新test用户密码
    await connection.execute(
      'UPDATE users SET password = ? WHERE username IN (?, ?)',
      [hash, 'testuser', 'zhangsan']
    );

    console.log('✅ testuser和zhangsan的密码已重置为: 123456');

    // 验证密码
    const isValid = await bcrypt.compare(password, hash);
    console.log('密码验证结果:', isValid ? '✅ 成功' : '❌ 失败');

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await connection.end();
  }
}

resetPasswords();
