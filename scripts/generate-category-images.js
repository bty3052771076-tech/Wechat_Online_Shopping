/**
 * 生成缺失的分类图片（320x320 PNG）
 * 风格匹配现有 assets/images/categories/ 中的图片：
 *   渐变背景 + 左侧竖条 + 右上大圆 + 右下小圆 + 左下半透明圆 + 英文标题 + 副标题
 *
 * 用法: node scripts/generate-category-images.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'Wechat_Online_Shopping', 'assets', 'images', 'categories');

// 每张图的配置：文件名、主色（渐变起止）、标题、副标题
const IMAGES = [
  { file: 'food.png',      colors: ['#e67e22', '#f39c12'], title: 'FOOD',      sub: 'DRINKS' },
  { file: 'digital.png',   colors: ['#2c3e50', '#3498db'], title: 'DIGITAL',   sub: 'TECH' },
  { file: 'baby.png',      colors: ['#9b59b6', '#e8a0bf'], title: 'BABY',      sub: 'CARE' },
  { file: 'dairy.png',     colors: ['#5dade2', '#aed6f1'], title: 'DAIRY',     sub: 'FRESH' },
  { file: 'grain.png',     colors: ['#b7950b', '#d4ac0d'], title: 'GRAIN',     sub: 'OIL' },
  { file: 'storage.png',   colors: ['#7f8c8d', '#bdc3c7'], title: 'STORAGE',   sub: 'HOME' },
  { file: 'oral.png',      colors: ['#1abc9c', '#48c9b0'], title: 'ORAL',      sub: 'CARE' },
  { file: 'hair.png',      colors: ['#8e44ad', '#bb8fce'], title: 'HAIR',      sub: 'CARE' },
  { file: 'snack.png',     colors: ['#e74c3c', '#f5b041'], title: 'SNACK',     sub: 'TREAT' },
  { file: 'drink.png',     colors: ['#6e2c00', '#a04000'], title: 'DRINK',     sub: 'TEA' },
  { file: 'instant.png',   colors: ['#cb4335', '#e67e22'], title: 'INSTANT',   sub: 'FOOD' },
  { file: 'phone-acc.png', colors: ['#1a5276', '#2e86c1'], title: 'PHONE',     sub: 'ACC' },
  { file: 'appliance.png', colors: ['#566573', '#aab7b8'], title: 'APPLIANCE', sub: 'HOME' },
  { file: 'baby-food.png', colors: ['#f0b27a', '#fad7a0'], title: 'BABY FOOD', sub: 'NUTRITION' },
  { file: 'baby-toy.png',  colors: ['#2ecc71', '#f1c40f'], title: 'TOY',       sub: 'PLAY' },
];

const SIZE = 320;

function generateCategoryImage(config) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // 渐变背景（左上→右下）
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, config.colors[0]);
  grad.addColorStop(1, config.colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 半透明叠加色
  const overlayColor = hexToRgba(config.colors[1], 0.3);
  const accentColor = hexToRgba(config.colors[1], 0.5);

  // 左侧竖条（圆角矩形）
  ctx.fillStyle = hexToRgba(config.colors[1], 0.45);
  roundRect(ctx, 30, 40, 22, 220, 11);
  ctx.fill();

  // 右上大圆
  ctx.fillStyle = overlayColor;
  ctx.beginPath();
  ctx.arc(250, 70, 65, 0, Math.PI * 2);
  ctx.fill();

  // 右下小圆
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(230, 240, 25, 0, Math.PI * 2);
  ctx.fill();

  // 左下半透明圆
  ctx.fillStyle = hexToRgba('#ffffff', 0.12);
  ctx.beginPath();
  ctx.arc(80, 260, 50, 0, Math.PI * 2);
  ctx.fill();

  // 英文标题（加粗）
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial, Helvetica, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.title, 70, 130);

  // 副标题（较小、半透明）
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '18px Arial, Helvetica, sans-serif';
  ctx.fillText(config.sub, 80, 235);

  return canvas.toBuffer('image/png');
}

// 辅助：hex 颜色转 rgba
function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// 辅助：圆角矩形
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// 主流程
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

let created = 0;
for (const img of IMAGES) {
  const filePath = path.join(OUTPUT_DIR, img.file);
  if (fs.existsSync(filePath)) {
    console.log(`[skip] ${img.file} already exists`);
    continue;
  }
  const buf = generateCategoryImage(img);
  fs.writeFileSync(filePath, buf);
  console.log(`[created] ${img.file}`);
  created++;
}

console.log(`\nDone. Created ${created} images in ${OUTPUT_DIR}`);
