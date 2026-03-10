# 娴嬭瘯蹇€熷弬鑰冨崱

> 馃搷 鎵撳嵃杩欏紶鍗＄墖锛岃创鍦ㄧ數鑴戞梺杈癸紝闅忔椂鏌ョ湅

---

## 馃殌 蹇€熷紑濮嬶紙3姝ュ惎鍔級

### 1锔忊儯 鍚姩鏈嶅姟鍣?```bash
cd E:/AI/cc+glm/backend
npm start
```
鈫?鐪嬪埌"馃殌 鏈嶅姟鍣ㄥ惎鍔ㄦ垚鍔?琛ㄧず鎴愬姛

### 2锔忊儯 楠岃瘉鏈嶅姟
```bash
curl http://localhost:3000/health
```
鈫?杩斿洖 `{"status":"ok"}` 琛ㄧず姝ｅ父

### 3锔忊儯 杩愯娴嬭瘯
```bash
node tests/integration-test.js
```
鈫?鐪嬪埌娴嬭瘯缁撴灉姹囨€?
---

## 馃摑 甯哥敤娴嬭瘯鍛戒护

### 鐧诲綍绫?
**鐢ㄦ埛鐧诲綍**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"123456\"}"
```

**绠＄悊鍛樼櫥褰?*
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### 鏌ヨ绫伙紙GET锛?
**鍟嗗搧鍒楄〃**
```bash
curl http://localhost:3000/api/products/list
```

**鍟嗗搧璇︽儏**
```bash
curl http://localhost:3000/api/products/detail/1
```

**鍒嗙被鍒楄〃**
```bash
curl http://localhost:3000/api/products/categories/list
```

### 涓氬姟绫伙紙闇€瑕乀oken锛?
**鑾峰彇Token**
```bash
# 鍏堢櫥褰曪紝浠庤繑鍥炵粨鏋滃鍒秚oken
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"123456\"}"
```

**璐墿杞﹀垪琛?*
```bash
curl -X GET http://localhost:3000/api/cart/list \
  -H "Authorization: Bearer 浣犵殑token"
```

**璁㈠崟鍒楄〃**
```bash
curl -X GET http://localhost:3000/api/orders/list \
  -H "Authorization: Bearer 浣犵殑token"
```

---

## 馃梽锔?鏁版嵁搴撳揩閫熷懡浠?
```bash
# 杩炴帴鏁版嵁搴?mysql -u root -p<your-db-password>

# 浣跨敤鏁版嵁搴?USE wechat_shop;

# 鏌ョ湅鎵€鏈夎〃
SHOW TABLES;

# 鏌ョ湅鐢ㄦ埛
SELECT id, username FROM users;

# 鏌ョ湅鍟嗗搧
SELECT id, title, min_sale_price FROM product_spus;

# 閫€鍑?EXIT;
```

---

## 馃И 娴嬭瘯妫€鏌ユ竻鍗?
### 鏈嶅姟鍣ㄥ惎鍔?- [ ] 鐪嬪埌"馃殌 鏈嶅姟鍣ㄥ惎鍔ㄦ垚鍔?
- [ ] 绔彛鏄剧ず 3000
- [ ] 鏁版嵁搴撹繛鎺ユ垚鍔?
### 鍩虹鍔熻兘
- [ ] 鍋ュ悍妫€鏌ヨ繑鍥?ok
- [ ] 鐢ㄦ埛鐧诲綍鎴愬姛
- [ ] 绠＄悊鍛樼櫥褰曟垚鍔?- [ ] 鍟嗗搧鍒楄〃鏈夋暟鎹?
### 涓氬姟鍔熻兘
- [ ] 鍟嗗搧璇︽儏姝ｅ父
- [ ] 鍒嗙被鍒楄〃鏈?2涓?- [ ] 璐墿杞﹀彲浠ヨ闂?- [ ] 璁㈠崟鍙互鍒涘缓

### 鏁版嵁搴?- [ ] 24寮犺〃瀛樺湪
- [ ] 鏈夋祴璇曠敤鎴?- [ ] 鏈夋祴璇曞晢鍝?- [ ] 鏈塖KU鏁版嵁

---

## 馃攽 娴嬭瘯璐﹀彿

| 瑙掕壊 | 鐢ㄦ埛鍚?| 瀵嗙爜 | Token鐢ㄩ€?|
|------|--------|------|----------|
| 鏅€氱敤鎴?| testuser | 123456 | 璐墿杞︺€佽鍗?|
| 绠＄悊鍛?| admin | admin123 | 鍟嗗搧绠＄悊 |
| 鏁版嵁搴?| root | <your-db-password> | SQL鏌ヨ |

---

## 鈿狅笍 甯歌閿欒閫熸煡

| 閿欒淇℃伅 | 鍘熷洜 | 瑙ｅ喅鏂规硶 |
|---------|------|---------|
| `EADDRINUSE` | 绔彛琚崰鐢?| 淇敼 `.env` 鐨?PORT |
| `Unable to connect` | 鏁版嵁搴撴湭鍚姩 | 鍚姩 MySQL 鏈嶅姟 |
| `Unauthorized` | Token鏃犳晥 | 閲嶆柊鐧诲綍鑾峰彇Token |
| `404 Not Found` | API璺緞閿欒 | 妫€鏌RL鎷煎啓 |
| `command not found` | 鍛戒护涓嶅瓨鍦?| 瀹夎 Node.js 鎴?curl |

---

## 馃搳 鍒ゆ柇鏍囧噯

### 鉁?鎴愬姛鐨勬爣蹇?- 杩斿洖 `"code": "Success"`
- HTTP鐘舵€佺爜 200
- 鏈?`data` 瀛楁骞跺寘鍚暟鎹?
### 鉂?澶辫触鐨勬爣蹇?- 杩斿洖 `"code": "Error"`
- HTTP鐘舵€佺爜 4xx 鎴?5xx
- 鏈?`error` 鎴?`message` 閿欒淇℃伅

---

## 馃幆 9姝ュ畬鏁存祴璇曟祦绋?
```
1锔忊儯 鍚姩鏈嶅姟 (npm start)
   鈫?2锔忊儯 鍋ュ悍妫€鏌?(curl /health)
   鈫?3锔忊儯 鐢ㄦ埛鐧诲綍 (POST /login)
   鈫?4锔忊儯 鍟嗗搧鏌ヨ (GET /products)
   鈫?5锔忊儯 鍟嗗搧璇︽儏 (GET /products/:id)
   鈫?6锔忊儯 璐墿杞︽祴璇?(GET /cart)
   鈫?7锔忊儯 鏁版嵁搴撻獙璇?(mysql鏌ヨ)
   鈫?8锔忊儯 灏忕▼搴忔祴璇?(寰俊寮€鍙戣€呭伐鍏?
   鈫?9锔忊儯 鑷姩鍖栨祴璇?(integration-test.js)
```

---

## 馃摫 灏忕▼搴忔祴璇曡鐐?
1. 鎵撳紑寰俊寮€鍙戣€呭伐鍏?2. 瀵煎叆椤圭洰锛歚E:/AI/cc+glm/Wechat_Online_Shopping`
3. 鉁?鍕鹃€?涓嶆牎楠屽悎娉曞煙鍚?
4. 鐐瑰嚮缂栬瘧
5. 娴嬭瘯鐧诲綍 鈫?娴忚鍟嗗搧 鈫?鍔犺喘鐗╄溅

---

## 馃啒 閬囧埌闂锛?
1. **妫€鏌ユ湇鍔″櫒鏄惁杩愯**
   ```bash
   curl http://localhost:3000/health
   ```

2. **鏌ョ湅閿欒鏃ュ織**
   - 鏌ョ湅杩愯鏈嶅姟鍣ㄧ殑绐楀彛
   - 鏌ョ湅灏忕▼搴忚皟璇曞櫒Console

3. **閲嶅惎鏈嶅姟鍣?*
   - 鎸?`Ctrl + C` 鍋滄
   - 閲嶆柊杩愯 `npm start`

4. **鏌ョ湅璇︾粏鏁欑▼**
   - 鎵撳紑 `docs/HOW_TO_TEST_STEP_BY_STEP.md`

---

**淇濆瓨浣嶇疆**: `E:/AI/cc+glm/docs/TEST_QUICK_REFERENCE.md`
**鎵撳嵃寤鸿**: 鎺ㄨ崘鎵撳嵃锛岃创鍦ㄦ樉绀哄櫒鏃佽竟

