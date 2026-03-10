# 鍚庣API蹇€熶娇鐢ㄦ寚鍗?
> **鏈€鍚庢洿鏂?*: 2026-03-04
> **鐘舵€?*: 鉁?鎵€鏈夋祴璇曢€氳繃

---

## 馃殌 蹇€熷紑濮?
### 1. 鍚姩鍚庣鏈嶅姟

```bash
# 杩涘叆鍚庣鐩綍
cd E:/AI/cc+glm/backend

# 鍚姩鏈嶅姟
node src/app.js
```

鐪嬪埌浠ヤ笅杈撳嚭琛ㄧず鍚姩鎴愬姛锛?```
=================================
馃殌 鏈嶅姟鍣ㄥ惎鍔ㄦ垚鍔?馃搷 绔彛: 3000
馃實 鐜: development
馃敆 API鍦板潃: http://localhost:3000
=================================
鉁?鏁版嵁搴撹繛鎺ユ垚鍔?```

### 2. 鍋滄鏈嶅姟

鍦ㄥ懡浠よ绐楀彛鎸?`Ctrl + C`

---

## 馃摑 API浣跨敤绀轰緥

### 绠＄悊鍛樼櫥褰?
**璇锋眰**:
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**鍝嶅簲**:
```json
{
  "code": "Success",
  "data": {
    "adminInfo": {
      "id": 1,
      "username": "admin",
      "real_name": "Admin",
      "role": "super_admin",
      "phone": "13800000001"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "msg": "鐧诲綍鎴愬姛"
}
```

### 鐢ㄦ埛娉ㄥ唽

**璇锋眰**:
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"newuser\",\"password\":\"123456\",\"phone\":\"13912345678\"}"
```

### 鐢ㄦ埛鐧诲綍

**璇锋眰**:
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"newuser\",\"password\":\"123456\"}"
```

### 鑾峰彇鐢ㄦ埛淇℃伅锛堥渶瑕乀oken锛?
**璇锋眰**:
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <your_token_here>"
```

---

## 馃攽 鍙敤璐﹀彿

### 绠＄悊鍛?
```
鐢ㄦ埛鍚? admin
瀵嗙爜: admin123
```

```
鐢ㄦ埛鍚? staff01
瀵嗙爜: 123456
```

### 娴嬭瘯鐢ㄦ埛

```
鐢ㄦ埛鍚? testuser
瀵嗙爜: 123456
```

```
鐢ㄦ埛鍚? zhangsan
瀵嗙爜: 123456
```

---

## 馃摎 API鎺ュ彛鍒楄〃

### 绠＄悊绔?(鍓嶇紑: /api/admin)

| 鏂规硶 | 璺緞 | 璇存槑 | 璁よ瘉 |
|------|------|------|------|
| POST | /login | 绠＄悊鍛樼櫥褰?| 鉂?|
| GET | /profile | 鑾峰彇绠＄悊鍛樹俊鎭?| 鉁?|
| PUT | /password | 淇敼瀵嗙爜 | 鉁?|

### 鐢ㄦ埛绔?(鍓嶇紑: /api/users)

| 鏂规硶 | 璺緞 | 璇存槑 | 璁よ瘉 |
|------|------|------|------|
| POST | /register | 鐢ㄦ埛娉ㄥ唽 | 鉂?|
| POST | /login | 鐢ㄦ埛鐧诲綍 | 鉂?|
| GET | /profile | 鑾峰彇鐢ㄦ埛淇℃伅 | 鉁?|
| PUT | /profile | 鏇存柊鐢ㄦ埛淇℃伅 | 鉁?|

### 绯荤粺

| 鏂规硶 | 璺緞 | 璇存槑 |
|------|------|------|
| GET | /health | 鍋ュ悍妫€鏌?|

---

## 馃攼 浣跨敤Token

### 濡備綍浣跨敤Token

鐧诲綍鎴愬姛鍚庯紝浼氳繑鍥炰竴涓猔token`銆傚湪鍚庣画闇€瑕佽璇佺殑璇锋眰涓紝闇€瑕佸湪璇锋眰澶翠腑鎼哄甫锛?
```bash
Authorization: Bearer <your_token_here>
```

### Token绀轰緥

```bash
# 鑾峰彇绠＄悊鍛樹俊鎭?curl -X GET http://localhost:3000/api/admin/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token鏈夋晥鏈?
- 榛樿鏈夋晥鏈? 24灏忔椂
- 杩囨湡鍚庨渶瑕侀噸鏂扮櫥褰曡幏鍙栨柊Token

---

## 馃И 杩愯娴嬭瘯

### 瀹屾暣API娴嬭瘯

```bash
cd E:/AI/cc+glm/backend
node tests/api-test.js
```

**娴嬭瘯鍐呭**:
- 鍋ュ悍妫€鏌?- 绠＄悊鍛樼櫥褰曞拰淇℃伅鑾峰彇
- 鐢ㄦ埛娉ㄥ唽銆佺櫥褰曞拰淇℃伅绠＄悊
- 閿欒澶勭悊

---

## 馃搨 椤圭洰缁撴瀯

```
backend/
鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ app.js                    # 涓诲簲鐢ㄦ枃浠?鈹?  鈹溾攢鈹€ config/
鈹?  鈹?  鈹斺攢鈹€ database.js           # 鏁版嵁搴撻厤缃?鈹?  鈹溾攢鈹€ models/
鈹?  鈹?  鈹溾攢鈹€ User.js               # 鐢ㄦ埛妯″瀷
鈹?  鈹?  鈹斺攢鈹€ Admin.js              # 绠＄悊鍛樻ā鍨?鈹?  鈹溾攢鈹€ controllers/
鈹?  鈹?  鈹溾攢鈹€ user.controller.js    # 鐢ㄦ埛鎺у埗鍣?鈹?  鈹?  鈹斺攢鈹€ admin.controller.js   # 绠＄悊鍛樻帶鍒跺櫒
鈹?  鈹溾攢鈹€ routes/
鈹?  鈹?  鈹溾攢鈹€ user.js               # 鐢ㄦ埛璺敱
鈹?  鈹?  鈹斺攢鈹€ admin.js              # 绠＄悊鍛樿矾鐢?鈹?  鈹溾攢鈹€ middlewares/
鈹?  鈹?  鈹斺攢鈹€ auth.js               # JWT璁よ瘉涓棿浠?鈹?  鈹斺攢鈹€ utils/
鈹?      鈹斺攢鈹€ response.js           # 鍝嶅簲宸ュ叿
鈹溾攢鈹€ tests/
鈹?  鈹斺攢鈹€ api-test.js               # API娴嬭瘯鑴氭湰
鈹溾攢鈹€ scripts/
鈹?  鈹溾攢鈹€ reset-admin-password.js   # 閲嶇疆绠＄悊鍛樺瘑鐮?鈹?  鈹斺攢鈹€ reset-user-passwords.js   # 閲嶇疆鐢ㄦ埛瀵嗙爜
鈹溾攢鈹€ .env                          # 鐜閰嶇疆
鈹斺攢鈹€ package.json
```

---

## 鈿欙笍 鐜閰嶇疆

`.env` 鏂囦欢鍐呭锛?
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_shop
DB_USER=root
DB_PASSWORD=<your-db-password>

JWT_SECRET=your_jwt_secret_change_me
JWT_EXPIRES_IN=24h
```

---

## 馃洜锔?甯哥敤鍛戒护

### 鍚姩鏈嶅姟

```bash
# 鏅€氬惎鍔?node src/app.js

# 寮€鍙戞ā寮忥紙闇€瑕佸厛瀹夎nodemon锛?npm run dev
```

### 鏌ョ湅鏃ュ織

鏈嶅姟鍣ㄤ細鍦ㄦ帶鍒跺彴杈撳嚭璇锋眰鏃ュ織锛?
```
[2026-03-04T14:55:22.123Z] POST /api/admin/login
[2026-03-04T14:55:23.456Z] GET /api/admin/profile
```

### 鏁版嵁搴撴搷浣?
```bash
# 杩炴帴鏁版嵁搴?mysql -u root -p<your-db-password>

# 浣跨敤鏁版嵁搴?USE wechat_shop;

# 鏌ョ湅琛?SHOW TABLES;

# 鏌ョ湅绠＄悊鍛?SELECT id, username, real_name, role FROM admins;

# 鏌ョ湅鐢ㄦ埛
SELECT id, username, phone FROM users;
```

---

## 鉂?甯歌闂

### Q: 绔彛3000琚崰鐢ㄦ€庝箞鍔烇紵

**A**: 淇敼`.env`鏂囦欢涓殑PORT鍊硷細

```env
PORT=3001
```

### Q: 鏁版嵁搴撹繛鎺ュけ璐ワ紵

**A**: 妫€鏌ワ細
1. MySQL鏈嶅姟鏄惁杩愯
2. `.env`涓殑瀵嗙爜鏄惁姝ｇ‘
3. 鏁版嵁搴揱wechat_shop`鏄惁瀛樺湪

### Q: Token杩囨湡鎬庝箞鍔烇紵

**A**: 閲嶆柊鐧诲綍鑾峰彇鏂癟oken

### Q: 濡備綍閲嶇疆绠＄悊鍛樺瘑鐮侊紵

**A**: 杩愯瀵嗙爜閲嶇疆鑴氭湰锛?
```bash
cd E:/AI/cc+glm/backend
node scripts/reset-admin-password.js
```

---

## 馃摉 鏇村鏂囨。

- [鏁版嵁搴撹璁℃枃妗(../database/docs/01-鏁版嵁搴撹璁¤缁嗘枃妗?md)
- [API鎺ュ彛鏂囨。](../database/docs/03-API鎺ュ彛璇︾粏鏂囨。.md)
- [娴嬭瘯鎶ュ憡](tests/TEST_REPORT.md)
- [瀹炴柦瀹屾垚鎶ュ憡](../database/docs/瀹炴柦瀹屾垚鎶ュ憡.md)

---

**鏈€鍚庢洿鏂?*: 2026-03-04
**鐗堟湰**: v1.0
**鐘舵€?*: 鉁?鐢熶骇灏辩华

