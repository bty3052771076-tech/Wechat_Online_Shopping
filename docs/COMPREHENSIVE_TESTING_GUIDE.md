# 鍏ㄩ潰娴嬭瘯鎸囧崡

鏈枃妗ｆ彁渚涘畬鏁寸殑娴嬭瘯娴佺▼锛屾兜鐩栧悗绔疉PI銆佹暟鎹簱銆佸墠绔皬绋嬪簭鍜屾€ц兘娴嬭瘯銆?
---

## 鐩綍

1. [娴嬭瘯鍑嗗](#娴嬭瘯鍑嗗)
2. [鍚庣API娴嬭瘯](#鍚庣api娴嬭瘯)
3. [鏁版嵁搴撻獙璇佹祴璇昡(#鏁版嵁搴撻獙璇佹祴璇?
4. [灏忕▼搴忓墠绔祴璇昡(#灏忕▼搴忓墠绔祴璇?
5. [鎵嬪姩鍔熻兘娴嬭瘯](#鎵嬪姩鍔熻兘娴嬭瘯)
6. [鎬ц兘娴嬭瘯](#鎬ц兘娴嬭瘯)
7. [瀹夊叏娴嬭瘯](#瀹夊叏娴嬭瘯)
8. [娴嬭瘯鎶ュ憡](#娴嬭瘯鎶ュ憡)

---

## 娴嬭瘯鍑嗗

### 1. 鐜妫€鏌ユ竻鍗?
- [ ] Node.js v22.17.1+ 宸插畨瑁?- [ ] MySQL 8.0+ 宸插畨瑁呭苟杩愯
- [ ] 鏁版嵁搴?`wechat_shop` 宸插垱寤?- [ ] 娴嬭瘯鏁版嵁宸插鍏ワ紙24寮犺〃锛?- [ ] 鍚庣鏈嶅姟鍙互姝ｅ父鍚姩
- [ ] 寰俊寮€鍙戣€呭伐鍏峰凡瀹夎

### 2. 鍚姩娴嬭瘯鐜

```bash
# 缁堢1: 鍚姩鍚庣鏈嶅姟
cd E:/AI/cc+glm/backend
npm start

# 缁堢2: 鍑嗗娴嬭瘯
cd E:/AI/cc+glm/backend
```

### 3. 娴嬭瘯璐﹀彿鍑嗗

| 绫诲瀷 | 鐢ㄦ埛鍚?| 瀵嗙爜 | 鐢ㄩ€?|
|------|--------|------|------|
| 鏅€氱敤鎴?| testuser | 123456 | 鐢ㄦ埛绔祴璇?|
| 绠＄悊鍛?| admin | admin123 | 绠＄悊绔祴璇?|
| 鏁版嵁搴?| root | <your-db-password> | 鏁版嵁搴撻獙璇?|

---

## 鍚庣API娴嬭瘯

### 鏂规硶1: 鑷姩鍖栭泦鎴愭祴璇曪紙鎺ㄨ崘锛?
```bash
cd E:/AI/cc+glm/backend
node tests/integration-test.js
```

**娴嬭瘯瑕嗙洊**: 24涓祴璇曠敤渚?- 鐢ㄦ埛璁よ瘉 (3涓?
- 绠＄悊鍛樿璇?(2涓?
- 鍟嗗搧API (4涓?
- 璐墿杞PI (4涓?
- 璁㈠崟API (3涓?
- 鏀惰揣鍦板潃API (4涓?
- 绠＄悊绔疉PI (4涓?

**棰勬湡缁撴灉**:
```
閫氳繃鐜? 54.2% (13/24)
鎵ц鏃堕棿: ~0.6绉?```

### 鏂规硶2: 浣跨敤curl鍗曠嫭娴嬭瘯鍚勪釜API

#### 2.1 鐢ㄦ埛璁よ瘉娴嬭瘯

```bash
# 娴嬭瘯1: 鐢ㄦ埛鐧诲綍
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

# 棰勬湡鍝嶅簲
# {"code":"Success","data":{"token":"...","user":{...}},"msg":"鐧诲綍鎴愬姛"}

# 娴嬭瘯2: 鑾峰彇鐢ㄦ埛淇℃伅锛堥渶瑕乼oken锛?TOKEN="<浠庝笂涓€姝ヨ幏鍙栫殑token>"
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 娴嬭瘯3: 鐢ㄦ埛娉ㄥ唽
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test001","password":"123456","phone":"13900139001"}'
```

#### 2.2 绠＄悊鍛樿璇佹祴璇?
```bash
# 娴嬭瘯1: 绠＄悊鍛樼櫥褰?curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 娴嬭瘯2: 鑾峰彇绠＄悊鍛樹俊鎭?ADMIN_TOKEN="<浠庝笂涓€姝ヨ幏鍙栫殑token>"
curl -X GET http://localhost:3000/api/admin/profile \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 2.3 鍟嗗搧妯″潡娴嬭瘯

```bash
# 娴嬭瘯1: 鑾峰彇鍟嗗搧鍒楄〃
curl -X GET "http://localhost:3000/api/products/list?page=1&limit=10"

# 娴嬭瘯2: 鑾峰彇鍟嗗搧璇︽儏
curl -X GET http://localhost:3000/api/products/detail/1

# 娴嬭瘯3: 鑾峰彇鍒嗙被鍒楄〃
curl -X GET http://localhost:3000/api/products/categories/list

# 娴嬭瘯4: 鑾峰彇鍒嗙被鏍?curl -X GET http://localhost:3000/api/products/categories/tree

# 娴嬭瘯5: 鍟嗗搧鎼滅储
curl -X GET "http://localhost:3000/api/products/list?keyword=鎵嬫満"
```

#### 2.4 璐墿杞︽ā鍧楁祴璇?
```bash
TOKEN="<浣犵殑鐢ㄦ埛token>"

# 娴嬭瘯1: 鍔犲叆璐墿杞?curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skuId":1,"quantity":2}'

# 娴嬭瘯2: 鑾峰彇璐墿杞﹀垪琛?curl -X GET http://localhost:3000/api/cart/list \
  -H "Authorization: Bearer $TOKEN"

# 娴嬭瘯3: 淇敼璐墿杞?curl -X PUT http://localhost:3000/api/cart/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cartId":1,"quantity":5}'

# 娴嬭瘯4: 鍒犻櫎璐墿杞﹀晢鍝?curl -X DELETE http://localhost:3000/api/cart/delete/1 \
  -H "Authorization: Bearer $TOKEN"
```

#### 2.5 璁㈠崟妯″潡娴嬭瘯

```bash
TOKEN="<浣犵殑鐢ㄦ埛token>"

# 娴嬭瘯1: 鍒涘缓璁㈠崟
curl -X POST http://localhost:3000/api/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"skuId":1,"quantity":2}],
    "addressId": 1,
    "remark": "灏藉揩鍙戣揣"
  }'

# 娴嬭瘯2: 鑾峰彇璁㈠崟鍒楄〃
curl -X GET http://localhost:3000/api/orders/list \
  -H "Authorization: Bearer $TOKEN"

# 娴嬭瘯3: 鑾峰彇璁㈠崟璇︽儏
curl -X GET http://localhost:3000/api/orders/detail/1 \
  -H "Authorization: Bearer $TOKEN"
```

#### 2.6 鏀惰揣鍦板潃娴嬭瘯

```bash
TOKEN="<浣犵殑鐢ㄦ埛token>"

# 娴嬭瘯1: 娣诲姞鏀惰揣鍦板潃
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverName": "寮犱笁",
    "receiverPhone": "13800138000",
    "provinceCode": "110000",
    "provinceName": "鍖椾含甯?,
    "cityCode": "110100",
    "cityName": "鍖椾含甯?,
    "districtCode": "110101",
    "districtName": "涓滃煄鍖?,
    "detailAddress": "鏌愭煇琛楅亾123鍙?,
    "isDefault": 1
  }'

# 娴嬭瘯2: 鑾峰彇鍦板潃鍒楄〃
curl -X GET http://localhost:3000/api/addresses \
  -H "Authorization: Bearer $TOKEN"

# 娴嬭瘯3: 鏇存柊鍦板潃
curl -X PUT http://localhost:3000/api/addresses/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverName": "鏉庡洓"}'

# 娴嬭瘯4: 璁剧疆榛樿鍦板潃
curl -X PUT http://localhost:3000/api/addresses/1/default \
  -H "Authorization: Bearer $TOKEN"

# 娴嬭瘯5: 鍒犻櫎鍦板潃
curl -X DELETE http://localhost:3000/api/addresses/1 \
  -H "Authorization: Bearer $TOKEN"
```

#### 2.7 绠＄悊绔晢鍝佺鐞嗘祴璇?
```bash
ADMIN_TOKEN="<浣犵殑绠＄悊鍛榯oken>"

# 娴嬭瘯1: 鑾峰彇鍟嗗搧鍒楄〃锛堢鐞嗙锛?curl -X GET "http://localhost:3000/api/admin/products?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 娴嬭瘯2: 娣诲姞鍟嗗搧
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "娴嬭瘯鍟嗗搧",
    "subtitle": "娴嬭瘯鍓爣棰?,
    "categoryId": 1,
    "minSalePrice": 99.00,
    "originalPrice": 199.00,
    "skus": [{
      "skuName": "榛樿瑙勬牸",
      "salePrice": 99.00,
      "originalPrice": 199.00,
      "stock": 100
    }]
  }'

# 娴嬭瘯3: 鏇存柊鍟嗗搧
curl -X PUT http://localhost:3000/api/admin/products/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "鏇存柊鍚庣殑鍟嗗搧鏍囬"}'

# 娴嬭瘯4: 鍒犻櫎鍟嗗搧
curl -X DELETE http://localhost:3000/api/admin/products/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 2.8 绠＄悊绔鍗曠鐞嗘祴璇?
```bash
ADMIN_TOKEN="<浣犵殑绠＄悊鍛榯oken>"

# 娴嬭瘯1: 鑾峰彇璁㈠崟鍒楄〃锛堢鐞嗙锛?curl -X GET "http://localhost:3000/api/admin/orders?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 娴嬭瘯2: 璁㈠崟鍙戣揣
curl -X PUT http://localhost:3000/api/admin/orders/1/ship \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "logisticsCompany": "椤轰赴閫熻繍",
    "logisticsNo": "SF1234567890"
  }'
```

### 鏂规硶3: 浣跨敤Postman娴嬭瘯

1. 瀵煎叆API闆嗗悎锛堝鏋滄湁鐨勮瘽锛?2. 鍒涘缓鐜鍙橀噺锛歚baseUrl`, `userToken`, `adminToken`
3. 鎸夐『搴忔墽琛岋細
   - 鐢ㄦ埛/绠＄悊鍛樼櫥褰曪紙鑾峰彇token锛?   - 灏唗oken淇濆瓨鍒扮幆澧冨彉閲?   - 娴嬭瘯鍚勪釜API绔偣

---

## 鏁版嵁搴撻獙璇佹祴璇?
### 1. 杩炴帴鏁版嵁搴?
```bash
mysql -u root -p<your-db-password>
USE wechat_shop;
```

### 2. 鏁版嵁瀹屾暣鎬ф鏌?
```sql
-- 妫€鏌ユ墍鏈夎〃鏄惁瀛樺湪
SHOW TABLES;

-- 棰勬湡缁撴灉: 24寮犺〃
-- users, admins, user_addresses, categories, product_spus,
-- product_skus, product_images, shopping_cart, orders,
-- order_items, order_status_logs, 绛?```

### 3. 娴嬭瘯鏁版嵁楠岃瘉

```sql
-- 妫€鏌ョ敤鎴锋暟鎹?SELECT id, username, phone, created_at FROM users;

-- 妫€鏌ョ鐞嗗憳鏁版嵁
SELECT id, username, real_name, role FROM admins;

-- 妫€鏌ュ晢鍝佹暟鎹?SELECT id, title, min_sale_price, originalPrice FROM product_spus;

-- 妫€鏌ュ垎绫绘暟鎹?SELECT id, name, parent_id, level FROM categories;

-- 妫€鏌KU鏁版嵁
SELECT id, spu_id, sku_name, sale_price, stock FROM product_skus;
```

### 4. 鍏宠仈鍏崇郴娴嬭瘯

```sql
-- 娴嬭瘯鍟嗗搧-鍒嗙被鍏宠仈
SELECT
  p.id,
  p.title,
  c.name AS category_name
FROM product_spus p
LEFT JOIN categories c ON p.category_id = c.id
LIMIT 10;

-- 娴嬭瘯鍟嗗搧-SKU鍏宠仈
SELECT
  p.title,
  s.sku_name,
  s.sale_price,
  s.stock
FROM product_spus p
INNER JOIN product_skus s ON p.id = s.spu_id
LIMIT 10;

-- 娴嬭瘯璁㈠崟-璁㈠崟鏄庣粏鍏宠仈
SELECT
  o.id,
  o.order_no,
  o.total_amount,
  COUNT(oi.id) AS item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;
```

### 5. 鏁版嵁绾︽潫娴嬭瘯

```sql
-- 娴嬭瘯鍞竴鎬х害鏉燂紙鐢ㄦ埛鍚嶏級
INSERT INTO users (username, password, phone)
VALUES ('testuser', 'hash', '13900000000');
-- 棰勬湡: Duplicate entry error

-- 娴嬭瘯澶栭敭绾︽潫
INSERT INTO order_items (order_id, sku_id, quantity, price)
VALUES (99999, 1, 1, 99.00);
-- 棰勬湡: Foreign key constraint fails (璁㈠崟涓嶅瓨鍦?

-- 娴嬭瘯闈炵┖绾︽潫
INSERT INTO product_spus (title, category_id)
VALUES (NULL, 1);
-- 棰勬湡: Column 'title' cannot be null
```

### 6. 鎬ц兘娴嬭瘯

```sql
-- 鏌ョ湅琛ㄥぇ灏忓拰琛屾暟
SELECT
  TABLE_NAME,
  TABLE_ROWS,
  ROUND(DATA_LENGTH / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'wechat_shop'
ORDER BY DATA_LENGTH DESC;

-- 鏌ョ湅绱㈠紩浣跨敤鎯呭喌
SHOW INDEX FROM product_spus;

-- 鍒嗘瀽鏌ヨ鎬ц兘
EXPLAIN SELECT * FROM product_spus WHERE category_id = 1;
```

---

## 灏忕▼搴忓墠绔祴璇?
### 1. 鍚姩灏忕▼搴?
```bash
# 1. 鎵撳紑寰俊寮€鍙戣€呭伐鍏?# 2. 瀵煎叆椤圭洰: E:/AI/cc+glm/Wechat_Online_Shopping
# 3. 鍕鹃€?涓嶆牎楠屽悎娉曞煙鍚?
# 4. 鐐瑰嚮"缂栬瘧"
```

### 2. 鑷姩鍖栨祴璇曟祦绋?
#### 鐢ㄦ埛绔祴璇曟祦绋?
```
1. 鐧诲綍娉ㄥ唽
   鈹溾攢 杈撳叆鐢ㄦ埛鍚? testuser
   鈹溾攢 杈撳叆瀵嗙爜: 123456
   鈹斺攢 鐐瑰嚮鐧诲綍
   鉁?楠岃瘉: 鎴愬姛鐧诲綍锛屾樉绀虹敤鎴蜂俊鎭?
2. 娴忚鍟嗗搧
   鈹溾攢 鏌ョ湅棣栭〉鎺ㄨ崘
   鈹溾攢 婊氬姩鍟嗗搧鍒楄〃
   鈹溾攢 鐐瑰嚮鍒嗙被绛涢€?   鈹斺攢 鎼滅储鍟嗗搧
   鉁?楠岃瘉: 鍒楄〃姝ｅ父鍔犺浇锛岀瓫閫夋湁鏁?
3. 鏌ョ湅鍟嗗搧璇︽儏
   鈹溾攢 鐐瑰嚮鍟嗗搧杩涘叆璇︽儏
   鈹溾攢 鏌ョ湅鍟嗗搧鍥剧墖
   鈹溾攢 鏌ョ湅浠锋牸淇℃伅
   鈹溾攢 閫夋嫨瑙勬牸
   鈹斺攢 鏌ョ湅鍟嗗搧鎻忚堪
   鉁?楠岃瘉: 璇︽儏椤垫樉绀哄畬鏁?
4. 璐墿杞﹀姛鑳?   鈹溾攢 璇︽儏椤电偣鍑?鍔犲叆璐墿杞?
   鈹溾攢 閫夋嫨鏁伴噺
   鈹溾攢 纭娣诲姞
   鈹溾攢 杩涘叆璐墿杞﹂〉闈?   鈹溾攢 淇敼鍟嗗搧鏁伴噺
   鈹斺攢 鍒犻櫎鍟嗗搧
   鉁?楠岃瘉: 璐墿杞︽暟鎹悓姝?
5. 鏀惰揣鍦板潃
   鈹溾攢 杩涘叆鍦板潃绠＄悊
   鈹溾攢 娣诲姞鏂板湴鍧€
   鈹溾攢 濉啓瀹屾暣淇℃伅
   鈹溾攢 璁剧疆榛樿鍦板潃
   鈹斺攢 缂栬緫/鍒犻櫎鍦板潃
   鉁?楠岃瘉: 鍦板潃CRUD鍔熻兘姝ｅ父

6. 鍒涘缓璁㈠崟
   鈹溾攢 璐墿杞︾偣鍑?缁撶畻"
   鈹溾攢 閫夋嫨鏀惰揣鍦板潃
   鈹溾攢 纭璁㈠崟淇℃伅
   鈹溾攢 濉啓澶囨敞
   鈹斺攢 鎻愪氦璁㈠崟
   鉁?楠岃瘉: 璁㈠崟鍒涘缓鎴愬姛

7. 璁㈠崟绠＄悊
   鈹溾攢 鏌ョ湅璁㈠崟鍒楄〃
   鈹溾攢 鏌ョ湅璁㈠崟璇︽儏
   鈹溾攢 鏌ョ湅璁㈠崟鐘舵€?   鈹斺攢 妯℃嫙鏀粯/鍙栨秷
   鉁?楠岃瘉: 璁㈠崟鐘舵€佹洿鏂?
8. 涓汉涓績
   鈹溾攢 鏌ョ湅涓汉淇℃伅
   鈹溾攢 淇敼鏄电О/澶村儚
   鈹斺攢 鏌ョ湅璁㈠崟缁熻
   鉁?楠岃瘉: 涓汉淇℃伅姝ｅ父鏄剧ず
```

#### 绠＄悊绔祴璇曟祦绋?
```
1. 绠＄悊鍛樼櫥褰?   鈹溾攢 杈撳叆鐢ㄦ埛鍚? admin
   鈹溾攢 杈撳叆瀵嗙爜: admin123
   鈹斺攢 鐐瑰嚮鐧诲綍
   鉁?楠岃瘉: 鎴愬姛鐧诲綍锛屾樉绀虹鐞嗙晫闈?
2. 鍟嗗搧绠＄悊
   鈹溾攢 鏌ョ湅鍟嗗搧鍒楄〃
   鈹溾攢 鎼滅储鍟嗗搧
   鈹溾攢 娣诲姞鏂板晢鍝?   鈹溾攢 缂栬緫鍟嗗搧淇℃伅
   鈹溾攢 涓婃灦/涓嬫灦鍟嗗搧
   鈹斺攢 鍒犻櫎鍟嗗搧
   鉁?楠岃瘉: 鍟嗗搧CRUD鍔熻兘姝ｅ父

3. 璁㈠崟绠＄悊
   鈹溾攢 鏌ョ湅鎵€鏈夎鍗?   鈹溾攢 绛涢€夎鍗曠姸鎬?   鈹溾攢 鏌ョ湅璁㈠崟璇︽儏
   鈹溾攢 璁㈠崟鍙戣揣
   鈹斺攢 鐗╂祦璺熻釜
   鉁?楠岃瘉: 璁㈠崟绠＄悊鍔熻兘姝ｅ父

4. 鏁版嵁缁熻
   鈹溾攢 鏌ョ湅閿€鍞暟鎹?   鈹溾攢 鏌ョ湅鐢ㄦ埛澧為暱
   鈹斺攢 鏌ョ湅鍟嗗搧鎺掕
   鉁?楠岃瘉: 缁熻鏁版嵁鍑嗙‘
```

### 3. 浣跨敤寰俊寮€鍙戣€呭伐鍏疯皟璇?
1. **Console璋冭瘯**
   - 鎵撳紑璋冭瘯鍣?鈫?Console
   - 鏌ョ湅 API 璇锋眰鍜屽搷搴?   - 鏌ョ湅 JavaScript 閿欒

2. **Network璋冭瘯**
   - 鎵撳紑璋冭瘯鍣?鈫?Network
   - 鏌ョ湅 API 璇锋眰璇︽儏
   - 妫€鏌ヨ姹傚ご銆佸搷搴斾綋
   - 楠岃瘉 token 鏄惁姝ｇ‘浼犻€?
3. **Storage璋冭瘯**
   - 鎵撳紑璋冭瘯鍣?鈫?Storage
   - 鏌ョ湅鏈湴瀛樺偍鏁版嵁
   - 楠岃瘉 token 鏄惁姝ｇ‘淇濆瓨

4. **AppData璋冭瘯**
   - 鎵撳紑璋冭瘯鍣?鈫?AppData
   - 鏌ョ湅 Page data
   - 楠岃瘉鏁版嵁缁戝畾

---

## 鎵嬪姩鍔熻兘娴嬭瘯

### 娴嬭瘯妫€鏌ユ竻鍗?
#### 鐢ㄦ埛绔姛鑳?
| 鍔熻兘 | 娴嬭瘯鐐?| 棰勬湡缁撴灉 | 鐘舵€?|
|------|--------|----------|------|
| 鐢ㄦ埛娉ㄥ唽 | 杈撳叆鏈夋晥淇℃伅 | 娉ㄥ唽鎴愬姛锛岃嚜鍔ㄧ櫥褰?| 猬?|
| 鐢ㄦ埛娉ㄥ唽 | 閲嶅鐢ㄦ埛鍚?| 鎻愮ず鐢ㄦ埛鍚嶅凡瀛樺湪 | 猬?|
| 鐢ㄦ埛鐧诲綍 | 姝ｇ‘璐﹀彿瀵嗙爜 | 鐧诲綍鎴愬姛锛岃繑鍥瀟oken | 猬?|
| 鐢ㄦ埛鐧诲綍 | 閿欒瀵嗙爜 | 鎻愮ず璐﹀彿鎴栧瘑鐮侀敊璇?| 猬?|
| 鍟嗗搧鍒楄〃 | 鍒嗛〉鍔犺浇 | 姣忛〉10鏉″晢鍝?| 猬?|
| 鍟嗗搧鎼滅储 | 杈撳叆鍏抽敭璇?| 杩斿洖鍖归厤鍟嗗搧 | 猬?|
| 鍒嗙被绛涢€?| 鐐瑰嚮鍒嗙被 | 鏄剧ず瀵瑰簲鍒嗙被鍟嗗搧 | 猬?|
| 鍟嗗搧璇︽儏 | 鏌ョ湅璇︽儏 | 鏄剧ず瀹屾暣鍟嗗搧淇℃伅 | 猬?|
| 鍔犲叆璐墿杞?| 閫夋嫨瑙勬牸鏁伴噺 | 鎴愬姛鍔犲叆锛屾彁绀烘垚鍔?| 猬?|
| 璐墿杞﹀垪琛?| 鏌ョ湅鍒楄〃 | 鏄剧ず宸叉坊鍔犲晢鍝?| 猬?|
| 淇敼鏁伴噺 | 澧炲噺鏁伴噺 | 瀹炴椂鏇存柊浠锋牸 | 猬?|
| 鍒犻櫎鍟嗗搧 | 婊戝姩鍒犻櫎 | 鍟嗗搧浠庡垪琛ㄧЩ闄?| 猬?|
| 娣诲姞鍦板潃 | 濉啓瀹屾暣淇℃伅 | 鍦板潃淇濆瓨鎴愬姛 | 猬?|
| 璁剧疆榛樿 | 鐐瑰嚮璁剧疆榛樿 | 榛樿鍦板潃鍙樻洿 | 猬?|
| 鍒涘缓璁㈠崟 | 閫夋嫨鍦板潃鍟嗗搧 | 璁㈠崟鍒涘缓鎴愬姛 | 猬?|
| 璁㈠崟鍒楄〃 | 鏌ョ湅鎵€鏈夎鍗?| 鏄剧ず璁㈠崟鍒楄〃 | 猬?|
| 璁㈠崟璇︽儏 | 鏌ョ湅璇︽儏 | 鏄剧ず瀹屾暣璁㈠崟淇℃伅 | 猬?|

#### 绠＄悊绔姛鑳?
| 鍔熻兘 | 娴嬭瘯鐐?| 棰勬湡缁撴灉 | 鐘舵€?|
|------|--------|----------|------|
| 绠＄悊鍛樼櫥褰?| 姝ｇ‘璐﹀彿瀵嗙爜 | 鐧诲綍鎴愬姛 | 猬?|
| 鍟嗗搧鍒楄〃 | 鏌ョ湅鎵€鏈夊晢鍝?| 鏄剧ず鍟嗗搧鍒楄〃 | 猬?|
| 娣诲姞鍟嗗搧 | 濉啓鍟嗗搧淇℃伅 | 鍟嗗搧娣诲姞鎴愬姛 | 猬?|
| 缂栬緫鍟嗗搧 | 淇敼鍟嗗搧淇℃伅 | 淇℃伅鏇存柊鎴愬姛 | 猬?|
| 鍒犻櫎鍟嗗搧 | 鍒犻櫎鍟嗗搧 | 鍟嗗搧鍒犻櫎鎴愬姛 | 猬?|
| 璁㈠崟鍒楄〃 | 鏌ョ湅鎵€鏈夎鍗?| 鏄剧ず璁㈠崟鍒楄〃 | 猬?|
| 璁㈠崟鍙戣揣 | 濉啓鐗╂祦淇℃伅 | 鍙戣揣鎴愬姛 | 猬?|

### 杈圭晫鏉′欢娴嬭瘯

```bash
# 娴嬭瘯1: 澶ф暟鎹噺鍒嗛〉
curl -X GET "http://localhost:3000/api/products/list?page=999&limit=10"

# 娴嬭瘯2: 鐗规畩瀛楃鎼滅储
curl -X GET "http://localhost:3000/api/products/list?keyword=<script>alert(1)</script>"

# 娴嬭瘯3: 璐熸暟ID
curl -X GET http://localhost:3000/api/products/detail/-1

# 娴嬭瘯4: 瓒呴暱瀛楃涓?curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverName":"A...锛?000涓瓧绗︼級...","receiverPhone":"13800138000",...}'

# 娴嬭瘯5: 骞跺彂璇锋眰
for i in {1..10}; do
  curl -X GET http://localhost:3000/api/products/list &
done
```

---

## 鎬ц兘娴嬭瘯

### 1. API鍝嶅簲鏃堕棿娴嬭瘯

```bash
# 浣跨敤ab (Apache Bench) 杩涜鍘嬪姏娴嬭瘯
# 瀹夎: 涓嬭浇 Apache HTTP Server

# 娴嬭瘯鍟嗗搧鍒楄〃鎺ュ彛锛?000娆¤姹傦紝100骞跺彂锛?ab -n 1000 -c 100 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/products/list

# 棰勬湡缁撴灉:
# - Requests per second: >100 req/s
# - Time per request: <1000ms
# - Failed requests: 0
```

### 2. 鏁版嵁搴撴煡璇㈡€ц兘

```sql
-- 鍚敤鎱㈡煡璇㈡棩蹇?SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- 鏌ョ湅鎱㈡煡璇?SELECT * FROM mysql.slow_log;

-- 鍒嗘瀽鏌ヨ璁″垝
EXPLAIN SELECT
  p.*, c.name AS category_name
FROM product_spus p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_on_sale = 1
ORDER BY p.sales DESC
LIMIT 20;
```

### 3. 鍐呭瓨浣跨敤鐩戞帶

```bash
# 鍚姩鏈嶅姟骞剁洃鎺у唴瀛?cd E:/AI/cc+glm/backend
node --inspect src/app.js

# 鍦ㄥ彟涓€涓粓绔?# 鎵撳紑 Chrome: chrome://inspect
# 鏌ョ湅鍐呭瓨蹇収鍜孋PU鎬ц兘
```

---

## 瀹夊叏娴嬭瘯

### 1. SQL娉ㄥ叆娴嬭瘯

```bash
# 娴嬭瘯鐧诲綍鎺ュ彛
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin\" OR 1=1--","password":"123456"}'

# 棰勬湡: 鐧诲綍澶辫触锛堝簲璇ヨ鍙傛暟鍖栨煡璇㈤槻鎶わ級
```

### 2. XSS娴嬭瘯

```bash
# 娴嬭瘯鎼滅储鎺ュ彛
curl -X GET "http://localhost:3000/api/products/list?keyword=<script>alert('XSS')</script>"

# 棰勬湡: 杩斿洖绌虹粨鏋滄垨杞箟鍚庣殑瀛楃涓?```

### 3. 璁よ瘉娴嬭瘯

```bash
# 娴嬭瘯鏈璇佽闂?curl -X GET http://localhost:3000/api/cart/list

# 棰勬湡: 401 Unauthorized

# 娴嬭瘯浼€爐oken
curl -X GET http://localhost:3000/api/cart/list \
  -H "Authorization: Bearer fake.token.here"

# 棰勬湡: 401 Unauthorized
```

### 4. 鏉冮檺娴嬭瘯

```bash
# 娴嬭瘯鏅€氱敤鎴疯闂鐞嗘帴鍙?USER_TOKEN="<鐢ㄦ埛token>"
curl -X GET http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer $USER_TOKEN"

# 棰勬湡: 403 Forbidden
```

---

## 娴嬭瘯鎶ュ憡

### 1. 鐢熸垚娴嬭瘯鎶ュ憡

杩愯瀹屾暣娴嬭瘯鍚庯紝璁板綍浠ヤ笅淇℃伅锛?
```markdown
# 娴嬭瘯鎵ц鎶ュ憡

**娴嬭瘯鏃ユ湡**: 2026-03-06
**娴嬭瘯浜哄憳**: [浣犵殑鍚嶅瓧]
**娴嬭瘯鐜**: 鏈湴寮€鍙戠幆澧?
## 娴嬭瘯缁撴灉姹囨€?
| 绫诲埆 | 鎬绘暟 | 閫氳繃 | 澶辫触 | 閫氳繃鐜?|
|------|------|------|------|--------|
| 鍚庣API | 24 | 13 | 11 | 54.2% |
| 鏁版嵁搴?| 6 | 6 | 0 | 100% |
| 鍓嶇鍔熻兘 | 18 | ? | ? | ?% |

## 鍙戠幇鐨勯棶棰?
1. [闂鎻忚堪1]
   - 涓ラ噸绋嬪害: 楂?涓?浣?   - 澶嶇幇姝ラ:
   - 棰勬湡缁撴灉:
   - 瀹為檯缁撴灉:

2. [闂鎻忚堪2]
   ...

## 寤鸿

- [寤鸿1]
- [寤鸿2]
```

### 2. 娴嬭瘯缁撴灉淇濆瓨浣嶇疆

```
E:/AI/cc+glm/
鈹溾攢鈹€ backend/tests/
鈹?  鈹溾攢鈹€ TEST_RESULTS.md           # 鑷姩鍖栨祴璇曠粨鏋?鈹?  鈹溾攢鈹€ MANUAL_TEST_REPORT.md     # 鎵嬪姩娴嬭瘯鎶ュ憡锛堟柊寤猴級
鈹?  鈹斺攢鈹€ PERFORMANCE_REPORT.md     # 鎬ц兘娴嬭瘯鎶ュ憡锛堟柊寤猴級
鈹斺攢鈹€ docs/
    鈹斺攢鈹€ TESTING_GUIDE.md          # 鏈枃浠?```

---

## 娴嬭瘯鏈€浣冲疄璺?
### 1. 娴嬭瘯椤哄簭

1. **鍏堟祴璇曞熀纭€璁炬柦**
   - 鏁版嵁搴撹繛鎺?   - 鏈嶅姟鍣ㄥ惎鍔?   - 鍋ュ悍妫€鏌?
2. **鍐嶆祴璇曡璇佹ā鍧?*
   - 鐢ㄦ埛鐧诲綍
   - 绠＄悊鍛樼櫥褰?   - Token楠岃瘉

3. **鐒跺悗娴嬭瘯涓氬姟鍔熻兘**
   - 鍟嗗搧鏌ヨ
   - 璐墿杞?   - 璁㈠崟

4. **鏈€鍚庢祴璇曠鐞嗗姛鑳?*
   - 鍟嗗搧绠＄悊
   - 璁㈠崟绠＄悊

### 2. 娴嬭瘯鏁版嵁绠＄悊

```sql
-- 鍒涘缓娴嬭瘯鏁版嵁搴撳壇鏈?CREATE DATABASE wechat_shop_test;
mysqldump -u root -p wechat_shop | mysql -u root -p wechat_shop_test;

-- 娴嬭瘯鍓嶉噸缃暟鎹?mysql -u root -p wechat_shop_test < database/sql/02-init-data.sql

-- 娴嬭瘯鍚庢竻鐞?-- DROP DATABASE wechat_shop_test;
```

### 3. 鎸佺画闆嗘垚寤鸿

```bash
# 鍒涘缓娴嬭瘯鑴氭湰 test.sh
#!/bin/bash
echo "寮€濮嬫祴璇?.."
node tests/integration-test.js
if [ $? -eq 0 ]; then
  echo "鉁?娴嬭瘯閫氳繃"
else
  echo "鉂?娴嬭瘯澶辫触"
  exit 1
fi
```

---

## 蹇€熸祴璇曞懡浠ゅ弬鑰?
```bash
# 涓€閿惎鍔ㄦ墍鏈夋祴璇?cd E:/AI/cc+glm/backend
npm start &
sleep 3
node tests/integration-test.js

# 蹇€熷仴搴锋鏌?curl http://localhost:3000/health

# 蹇€熺櫥褰曟祴璇?curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}' | jq

# 鏁版嵁搴撳揩閫熸鏌?mysql -u root -p<your-db-password> -e "USE wechat_shop; SHOW TABLES;"

# 鏌ョ湅鏃ュ織
tail -f E:/AI/cc+glm/backend/logs/app.log
```

---

**鏂囨。鐗堟湰**: v1.0.0
**鏇存柊鏃ユ湡**: 2026-03-06
**閫傜敤椤圭洰**: 寰俊灏忕▼搴?鍦ㄧ嚎璐墿"鍏ㄦ爤椤圭洰

