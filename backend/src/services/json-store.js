const fs = require('fs');
const path = require('path');

function getDataDir() {
  return process.env.ADMIN_DATA_DIR
    ? path.resolve(process.env.ADMIN_DATA_DIR)
    : path.resolve(__dirname, '../../data');
}

function ensureDir() {
  const dir = getDataDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function ensureFile(fileName, seedData) {
  const filePath = path.join(ensureDir(), fileName);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(seedData, null, 2), 'utf8');
  }

  return filePath;
}

function readJson(fileName, seedData) {
  const filePath = ensureFile(fileName, seedData);

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fs.writeFileSync(filePath, JSON.stringify(seedData, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(seedData));
  }
}

function writeJson(fileName, data) {
  const filePath = ensureFile(fileName, data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

module.exports = {
  readJson,
  writeJson,
};
