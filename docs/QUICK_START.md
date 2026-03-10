# 蹇€熷紑濮嬫寚鍗?
娆㈣繋浣跨敤寰俊灏忕▼搴?鍦ㄧ嚎璐墿"椤圭洰锛佹湰鎸囧崡灏嗗府鍔╂偍鍦?鍒嗛挓鍐呭惎鍔ㄩ」鐩€?
## 鍓嶇疆瑕佹眰

鍦ㄥ紑濮嬩箣鍓嶏紝璇风‘淇濇偍鐨勫紑鍙戠幆澧冩弧瓒充互涓嬭姹傦細

### 蹇呴渶杞欢

- **Node.js**: v22.17.1 鎴栨洿楂樼増鏈?  - 涓嬭浇鍦板潃: https://nodejs.org/
  - 楠岃瘉瀹夎: `node --version`

- **MySQL**: 8.0 鎴栨洿楂樼増鏈?  - 涓嬭浇鍦板潃: https://dev.mysql.com/downloads/mysql/
  - 楠岃瘉瀹夎: `mysql --version`

- **npm**: v10.9.2 鎴栨洿楂樼増鏈紙闅廚ode.js涓€璧峰畨瑁咃級
  - 楠岃瘉瀹夎: `npm --version`

- **寰俊寮€鍙戣€呭伐鍏?*: 鏈€鏂扮増鏈?  - 涓嬭浇鍦板潃: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 鍙€夎蒋浠?
- **Git**: 鐢ㄤ簬鐗堟湰鎺у埗
- **Docker**: 鐢ㄤ簬瀹瑰櫒鍖栭儴缃?- **Postman**: 鐢ㄤ簬API娴嬭瘯

## 5鍒嗛挓蹇€熷惎鍔?
### 姝ラ1: 鍚姩鍚庣鏈嶅姟 (2鍒嗛挓)

```bash
# 1. 杩涘叆鍚庣鐩綍
cd E:/AI/cc+glm/backend

# 2. 瀹夎渚濊禆锛堥娆¤繍琛岄渶瑕侊級
npm install

# 3. 妫€鏌ョ幆澧冮厤缃?# 纭繚 .env 鏂囦欢瀛樺湪骞堕厤缃纭?cat .env

# 4. 鍚姩鍚庣鏈嶅姟
npm start
```

**棰勬湡杈撳嚭**:
```
=================================
馃殌 鏈嶅姟鍣ㄥ惎鍔ㄦ垚鍔?馃搷 绔彛: 3000
馃實 鐜: development
馃敆 API鍦板潃: http://localhost:3000
=================================
```

**鏁呴殰鎺掓煡**:
- 濡傛灉绔彛3000琚崰鐢紝淇敼 `.env` 鏂囦欢涓殑 `PORT` 鍊?- 濡傛灉鏁版嵁搴撹繛鎺ュけ璐ワ紝妫€鏌?`.env` 涓殑鏁版嵁搴撻厤缃?
### 姝ラ2: 楠岃瘉鍚庣鏈嶅姟 (1鍒嗛挓)

```bash
# 鍦ㄦ柊鐨勭粓绔獥鍙ｆ墽琛?
# 1. 妫€鏌ュ仴搴风姸鎬?curl http://localhost:3000/health

# 2. 娴嬭瘯鐢ㄦ埛鐧诲綍
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

# 3. 娴嬭瘯绠＄悊鍛樼櫥褰?curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**棰勬湡杈撳嚭**:
```json
{
  "code": "Success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {...}
  },
  "msg": "鐧诲綍鎴愬姛"
}
```

### 姝ラ3: 杩愯闆嗘垚娴嬭瘯 (1鍒嗛挓)

```bash
# 鍦ㄥ悗绔洰褰曟墽琛?cd E:/AI/cc+glm/backend
node tests/integration-test.js
```

**棰勬湡杈撳嚭**:
```
馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И
寮€濮嬮泦鎴愭祴璇?..
馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И馃И

鉁?鐢ㄦ埛鐧诲綍锛坱estuser/123456锛?鉁?鑾峰彇鐢ㄦ埛淇℃伅
鉁?绠＄悊鍛樼櫥褰?...
```

### 姝ラ4: 鍚姩灏忕▼搴?(1鍒嗛挓)

```bash
# 1. 鎵撳紑寰俊寮€鍙戣€呭伐鍏?
# 2. 瀵煎叆椤圭洰
#    閫夋嫨鐩綍: E:/AI/cc+glm/Wechat_Online_Shopping

# 3. 閰嶇疆寮€鍙戠幆澧?#    鐐瑰嚮鍙充笂瑙?璇︽儏"
#    鈫?"鏈湴璁剧疆"
#    鈫?鍕鹃€?涓嶆牎楠屽悎娉曞煙鍚嶃€亀eb-view锛堜笟鍔″煙鍚嶏級銆乀LS鐗堟湰浠ュ強HTTPS璇佷功"

# 4. 缂栬瘧杩愯
#    鐐瑰嚮"缂栬瘧"鎸夐挳
```

**棰勮娴嬭瘯娴佺▼**:
1. 杩涘叆灏忕▼搴忛椤?2. 鐐瑰嚮"鐧诲綍"
3. 杈撳叆娴嬭瘯璐﹀彿: testuser / 123456
4. 娴忚鍟嗗搧鍒楄〃
5. 鏌ョ湅鍟嗗搧璇︽儏
6. 鍔犲叆璐墿杞?7. 鍒涘缓璁㈠崟

### 姝ラ5: 楠岃瘉鏍稿績鍔熻兘

浣跨敤浠ヤ笅娓呭崟楠岃瘉鍔熻兘鏄惁姝ｅ父锛?
#### 鐢ㄦ埛绔姛鑳?- [ ] 鐢ㄦ埛娉ㄥ唽鐧诲綍
- [ ] 娴忚鍟嗗搧鍒楄〃
- [ ] 鏌ョ湅鍟嗗搧璇︽儏
- [ ] 鍟嗗搧鍒嗙被绛涢€?- [ ] 鍔犲叆璐墿杞?- [ ] 淇敼璐墿杞︽暟閲?- [ ] 娣诲姞鏀惰揣鍦板潃
- [ ] 鍒涘缓璁㈠崟
- [ ] 鏌ョ湅璁㈠崟鍒楄〃

#### 绠＄悊绔姛鑳?- [ ] 绠＄悊鍛樼櫥褰?- [ ] 鏌ョ湅鍟嗗搧鍒楄〃
- [ ] 娣诲姞鏂板晢鍝?- [ ] 缂栬緫鍟嗗搧淇℃伅
- [ ] 鏌ョ湅璁㈠崟鍒楄〃
- [ ] 璁㈠崟鍙戣揣

---

## 璇︾粏閰嶇疆璇存槑

### 鏁版嵁搴撻厤缃?
#### 1. 鍒涘缓鏁版嵁搴擄紙濡傛灉杩樻病鏈夛級

```bash
# 鐧诲綍MySQL
mysql -u root -p

# 鍒涘缓鏁版嵁搴?CREATE DATABASE wechat_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 閫€鍑?EXIT;
```

#### 2. 瀵煎叆鏁版嵁

```bash
cd E:/AI/cc+glm/database/sql

# 瀵煎叆琛ㄧ粨鏋?mysql -u root -p wechat_shop < 01-create-tables.sql

# 瀵煎叆鍒濆鏁版嵁
mysql -u root -p wechat_shop < 02-init-data.sql --default-character-set=utf8mb4
```

#### 3. 楠岃瘉鏁版嵁

```bash
mysql -u root -p wechat_shop

# 鏌ョ湅琛?SHOW TABLES;

# 鏌ョ湅绠＄悊鍛?SELECT id, username, real_name, role FROM admins;

# 鏌ョ湅鐢ㄦ埛
SELECT id, username, phone FROM users;

# 鏌ョ湅鍟嗗搧
SELECT id, title, min_sale_price FROM product_spus;
```

### 鐜鍙橀噺閰嶇疆

鍒涘缓 `.env` 鏂囦欢锛堝鏋滀笉瀛樺湪锛夛細

```env
# 鏈嶅姟鍣ㄩ厤缃?NODE_ENV=development
PORT=3000

# 鏁版嵁搴撻厤缃?DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_shop
DB_USER=root
DB_PASSWORD=<your-db-password>

# JWT閰嶇疆
JWT_SECRET=your_jwt_secret_change_me
JWT_EXPIRES_IN=24h

# 鏂囦欢涓婁紶閰嶇疆
UPLOAD_PATH=./uploads/products
MAX_FILE_SIZE=2097152

# 鏃ュ織閰嶇疆
LOG_LEVEL=debug
LOG_PATH=./logs

# 寰俊灏忕▼搴忛厤缃?WECHAT_APPID=wx06e38f82f0bafd80
WECHAT_SECRET=your-wechat-secret
```

**閲嶈鎻愮ず**:
- 鐢熶骇鐜璇蜂慨鏀?`JWT_SECRET` 涓洪殢鏈哄瓧绗︿覆
- 鐢熶骇鐜璇蜂慨鏀规暟鎹簱瀵嗙爜
- 鐢熶骇鐜璇烽厤缃湡瀹炵殑寰俊灏忕▼搴忓瘑閽?
### 灏忕▼搴忛厤缃?
淇敼灏忕▼搴忛厤缃枃浠讹細

```javascript
// E:/AI/cc+glm/Wechat_Online_Shopping/config/index.js
export const config = {
  useMock: false,  // 鏀逛负false浠ヨ繛鎺ョ湡瀹炲悗绔?  apiBaseURL: 'http://localhost:3000/api'
};
```

**娉ㄦ剰**:
- `useMock: true` - 浣跨敤Mock鏁版嵁锛堝紑鍙戞祴璇曠敤锛?- `useMock: false` - 杩炴帴鐪熷疄鍚庣API

---

## 娴嬭瘯璐﹀彿

### 鐢ㄦ埛璐﹀彿

| 鐢ㄦ埛鍚?| 瀵嗙爜 | 鎵嬫満鍙?| 璇存槑 |
|--------|------|--------|------|
| testuser | 123456 | 13800138000 | 娴嬭瘯鐢ㄦ埛1 |
| zhangsan | 123456 | 13900139000 | 娴嬭瘯鐢ㄦ埛2 |

### 绠＄悊鍛樿处鍙?
| 鐢ㄦ埛鍚?| 瀵嗙爜 | 瑙掕壊 | 璇存槑 |
|--------|------|------|------|
| admin | admin123 | super_admin | 瓒呯骇绠＄悊鍛?|
| staff01 | 123456 | staff | 鏅€氱鐞嗗憳 |

---

## 甯哥敤鍛戒护

### 鍚庣鏈嶅姟

```bash
# 鍚姩鏈嶅姟
npm start

# 寮€鍙戞ā寮忥紙鑷姩閲嶅惎锛岄渶瑕乶odemon锛?npm run dev

# 杩愯娴嬭瘯
node tests/integration-test.js

# 閲嶇疆绠＄悊鍛樺瘑鐮?node scripts/reset-admin-password.js

# 閲嶇疆鐢ㄦ埛瀵嗙爜
node scripts/reset-user-passwords.js
```

### 鏁版嵁搴撴搷浣?
```bash
# 杩炴帴鏁版嵁搴?mysql -u root -p

# 浣跨敤鏁版嵁搴?USE wechat_shop;

# 鏌ョ湅鎵€鏈夎〃
SHOW TABLES;

# 鏌ョ湅琛ㄧ粨鏋?DESCRIBE users;

# 鏌ョ湅鏁版嵁
SELECT * FROM users LIMIT 10;

# 娓呯┖琛?TRUNCATE TABLE shopping_cart;
```

### Git鎿嶄綔锛堝彲閫夛級

```bash
# 鍒濆鍖栦粨搴?git init

# 娣诲姞鎵€鏈夋枃浠?git add .

# 鎻愪氦
git commit -m "Initial commit"

# 鏌ョ湅鐘舵€?git status

# 鏌ョ湅鏃ュ織
git log
```

---

## 鏁呴殰鎺掓煡

### 闂1: 绔彛琚崰鐢?
**閿欒淇℃伅**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**瑙ｅ喅鏂规**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <杩涚▼ID> /F

# 鎴栦慨鏀?.env 涓殑 PORT
PORT=3001
```

### 闂2: 鏁版嵁搴撹繛鎺ュけ璐?
**閿欒淇℃伅**:
```
Access denied for user 'root'@'localhost'
```

**瑙ｅ喅鏂规**:
1. 妫€鏌?`.env` 涓殑鏁版嵁搴撳瘑鐮?2. 纭繚MySQL鏈嶅姟姝ｅ湪杩愯
3. 楠岃瘉鏁版嵁搴撳凡鍒涘缓

```bash
# 妫€鏌ySQL鏈嶅姟
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
```

### 闂3: 妯″潡鏈壘鍒?
**閿欒淇℃伅**:
```
Error: Cannot find module 'express'
```

**瑙ｅ喅鏂规**:
```bash
cd E:/AI/cc+glm/backend
npm install
```

### 闂4: 灏忕▼搴忔棤娉曡繛鎺ュ悗绔?
**鍙兘鍘熷洜**:
1. 鍚庣鏈嶅姟鏈惎鍔?2. 鏈嬀閫?涓嶆牎楠屽悎娉曞煙鍚?
3. API鍦板潃閰嶇疆閿欒

**瑙ｅ喅鏂规**:
```bash
# 1. 纭鍚庣杩愯
curl http://localhost:3000/health

# 2. 妫€鏌ュ皬绋嬪簭閰嶇疆
#    纭繚鍕鹃€変簡"涓嶆牎楠屽悎娉曞煙鍚?

# 3. 妫€鏌PI鍦板潃
#    config/index.js 涓殑 apiBaseURL 搴斾负 'http://localhost:3000/api'
```

### 闂5: 鐧诲綍澶辫触

**閿欒淇℃伅**:
```
璐﹀彿鎴栧瘑鐮侀敊璇?```

**瑙ｅ喅鏂规**:
```bash
# 閲嶇疆瀵嗙爜
cd E:/AI/cc+glm/backend

# 閲嶇疆绠＄悊鍛樺瘑鐮?node scripts/reset-admin-password.js

# 閲嶇疆鐢ㄦ埛瀵嗙爜
node scripts/reset-user-passwords.js
```

### 闂6: Token楠岃瘉澶辫触

**閿欒淇℃伅**:
```
Unauthorized: Invalid token
```

**瑙ｅ喅鏂规**:
1. 纭繚Token鏈繃鏈燂紙榛樿24灏忔椂锛?2. 纭繚璇锋眰澶存牸寮忔纭? `Authorization: Bearer {token}`
3. 閲嶆柊鐧诲綍鑾峰彇鏂癟oken

---

## 涓嬩竴姝?
### 瀛︿範璧勬簮

- **API鏂囨。**: 鏌ョ湅 `docs/API_ENDPOINTS.md` 浜嗚В鎵€鏈堿PI
- **閮ㄧ讲鎸囧崡**: 鏌ョ湅 `docs/DEPLOYMENT_GUIDE.md` 瀛︿範閮ㄧ讲
- **鏁版嵁搴撴枃妗?*: 鏌ョ湅 `database/docs/` 浜嗚В鏁版嵁搴撶粨鏋?
### 寮€鍙戝缓璁?
1. **鍏堟祴璇曞悗寮€鍙?*
   - 浣跨敤Postman娴嬭瘯API
   - 闃呰娴嬭瘯鐢ㄤ緥浜嗚В鐢ㄦ硶
   - 鏌ョ湅鏁版嵁搴撶悊瑙ｆ暟鎹粨鏋?
2. **閬靛惊椤圭洰瑙勮寖**
   - 浣跨敤缁熶竴鐨勫搷搴旀牸寮?   - 閬靛惊RESTful API璁捐
   - 缂栧啓娓呮櫚鐨勬敞閲?
3. **瀹夊叏鏈€浣冲疄璺?*
   - 涓嶈鎻愪氦 `.env` 鏂囦欢
   - 浣跨敤鐜鍙橀噺绠＄悊閰嶇疆
   - 鐢熶骇鐜浣跨敤HTTPS

### 鍔熻兘鎵╁睍

褰撳墠椤圭洰宸插疄鐜板熀纭€鍔熻兘锛屾偍鍙互缁х画寮€鍙戯細

- 鏀粯鍔熻兘锛堝井淇℃敮浠橈級
- 鐗╂祦杩借釜
- 浼樻儬鍒哥郴缁?- 鍞悗绯荤粺
- 鏁版嵁缁熻
- 娑堟伅鎺ㄩ€?
---

## 鑾峰彇甯姪

### 鏂囨。璧勬簮

- **椤圭洰瀹屾垚鎶ュ憡**: `docs/PROJECT_COMPLETION_REPORT.md`
- **API鎺ュ彛鏂囨。**: `docs/API_ENDPOINTS.md`
- **閮ㄧ讲鎸囧崡**: `docs/DEPLOYMENT_GUIDE.md`
- **娴嬭瘯鎶ュ憡**: `backend/tests/TEST_RESULTS.md`

### 椤圭洰璁板繂

- **寮€鍙戣褰?*: `MEMORY.md` - 鍖呭惈鎵€鏈夊紑鍙戝巻鍙插拰閰嶇疆淇℃伅

### 甯歌闂

**Q: 濡備綍淇敼绔彛锛?*
A: 淇敼 `.env` 鏂囦欢涓殑 `PORT` 閰嶇疆

**Q: 濡備綍娣诲姞鏂癆PI锛?*
A: 鍙傝€冪幇鏈塩ontroller鍜宺outes鐨勫疄鐜?
**Q: 濡備綍閮ㄧ讲鍒扮敓浜х幆澧冿紵**
A: 鏌ョ湅 `docs/DEPLOYMENT_GUIDE.md`

**Q: 灏忕▼搴忓浣曚娇鐢ㄧ湡瀹炲悗绔紵**
A: 淇敼 `config/index.js`锛屽皢 `useMock` 鏀逛负 `false`

---

## 绁濇偍浣跨敤鎰夊揩锛?
馃帀 鎰熻阿浣跨敤寰俊灏忕▼搴?鍦ㄧ嚎璐墿"椤圭洰锛?
濡傛湁闂锛岃鏌ラ槄鏂囨。鎴栨煡鐪?`MEMORY.md` 鏂囦欢銆?
---

**鏂囨。鐗堟湰**: v1.0.0
**鏇存柊鏃ユ湡**: 2026-03-05
**椤圭洰鐘舵€?*: 鉁?宸插畬鎴?
