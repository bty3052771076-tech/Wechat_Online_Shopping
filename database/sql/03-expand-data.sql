-- ============================================================
-- 商品数据扩充脚本
-- 数据库: wechat_shop
-- 说明: 新增 15 个分类、98 件商品及对应 SKU
--       前置条件: 01-create-tables.sql + 02-init-data.sql 已执行
-- 执行: mysql -h 127.0.0.1 -P 3306 -u root -pbty041121 wechat_shop < database/sql/03-expand-data.sql
-- ============================================================

USE wechat_shop;
SET NAMES utf8mb4;

-- ============================================================
-- 第一步：新增分类
-- ============================================================

-- 1-A: 在已有一级分类下新增二级分类
INSERT INTO categories (parent_id, category_name, category_code, icon_url, sort_order, level, status, created_at, updated_at) VALUES
(1, '乳制品',   'FRESH_DAIRY',   '/assets/images/categories/dairy.png',   4, 2, 1, NOW(), NOW()),
(1, '粮油干货', 'FRESH_GRAIN',   '/assets/images/categories/grain.png',   5, 2, 1, NOW(), NOW()),
(2, '收纳整理', 'DAILY_STORAGE', '/assets/images/categories/storage.png', 4, 2, 1, NOW(), NOW()),
(3, '口腔护理', 'BEAUTY_ORAL',   '/assets/images/categories/oral.png',    4, 2, 1, NOW(), NOW()),
(3, '护发洗发', 'BEAUTY_HAIR',   '/assets/images/categories/hair.png',    5, 2, 1, NOW(), NOW());

-- 1-B: 新增三个一级分类
INSERT INTO categories (parent_id, category_name, category_code, icon_url, sort_order, level, status, created_at, updated_at) VALUES
(NULL, '食品饮料', 'CATEGORY_FOOD',    '/assets/images/categories/food.png',    4, 1, 1, NOW(), NOW()),
(NULL, '数码家电', 'CATEGORY_DIGITAL', '/assets/images/categories/digital.png', 5, 1, 1, NOW(), NOW()),
(NULL, '母婴用品', 'CATEGORY_BABY',    '/assets/images/categories/baby.png',    6, 1, 1, NOW(), NOW());

-- 1-C: 新一级分类下的二级分类（用变量避免同表子查询限制）
SET @food_id    = (SELECT id FROM categories WHERE category_code='CATEGORY_FOOD');
SET @digital_id = (SELECT id FROM categories WHERE category_code='CATEGORY_DIGITAL');
SET @baby_id    = (SELECT id FROM categories WHERE category_code='CATEGORY_BABY');

INSERT INTO categories (parent_id, category_name, category_code, icon_url, sort_order, level, status, created_at, updated_at) VALUES
(@food_id,    '零食小吃', 'FOOD_SNACK',        '/assets/images/categories/snack.png',     1, 2, 1, NOW(), NOW()),
(@food_id,    '冲饮茶酒', 'FOOD_DRINK',        '/assets/images/categories/drink.png',     2, 2, 1, NOW(), NOW()),
(@food_id,    '方便速食', 'FOOD_INSTANT',      '/assets/images/categories/instant.png',   3, 2, 1, NOW(), NOW()),
(@digital_id, '手机配件', 'DIGITAL_PHONE_ACC', '/assets/images/categories/phone-acc.png', 1, 2, 1, NOW(), NOW()),
(@digital_id, '小家电',   'DIGITAL_APPLIANCE', '/assets/images/categories/appliance.png', 2, 2, 1, NOW(), NOW()),
(@baby_id,    '婴儿食品', 'BABY_FOOD',         '/assets/images/categories/baby-food.png', 1, 2, 1, NOW(), NOW()),
(@baby_id,    '玩具益智', 'BABY_TOY',          '/assets/images/categories/baby-toy.png',  2, 2, 1, NOW(), NOW());

-- ============================================================
-- 第二步：新增商品 SPU
-- category_id 统一用子查询，避免硬编码 ID
-- ============================================================

INSERT INTO product_spus (spu_code, title, subtitle, category_id, brand, primary_image, detail_images, product_detail, min_sale_price, max_line_price, total_stock, sold_num, tags, status, created_at, updated_at) VALUES

-- -------- 蔬菜水果（SPU008～SPU013）--------
('SPU008', '云南高原红提葡萄', '皮薄肉脆 甜度爆棚', (SELECT id FROM categories WHERE category_code='FRESH_FRUIT'), '云南农庄', '/assets/images/products/grape.png', '["/assets/images/products/grape.png"]', '<p>产自云南高原，颗粒饱满，皮薄无籽，口感脆甜，适合日常鲜食。</p>', 26.90, 39.00, 300, 87, '新品,云南直发', 1, NOW(), NOW()),
('SPU009', '烟台大樱桃', '果园直摘 新鲜到家', (SELECT id FROM categories WHERE category_code='FRESH_FRUIT'), '烟台果园', '/assets/images/products/cherry.png', '["/assets/images/products/cherry.png"]', '<p>山东烟台优质大樱桃，颗粒大、色泽红润，酸甜适中。</p>', 49.90, 69.00, 200, 156, '热销,时令果品', 1, NOW(), NOW()),
('SPU010', '海南贵妃香蕉', '自然熟透 香甜软糯', (SELECT id FROM categories WHERE category_code='FRESH_FRUIT'), '海南农场', '/assets/images/products/banana.png', '["/assets/images/products/banana.png"]', '<p>海南贵妃香蕉，自然催熟，不含催熟剂，适合宝宝和老人。</p>', 12.90, 19.00, 500, 243, '热销,家庭装', 1, NOW(), NOW()),
('SPU011', '新疆哈密瓜', '瓜瓤金黄 清甜爽口', (SELECT id FROM categories WHERE category_code='FRESH_FRUIT'), '新疆特产', '/assets/images/products/hami-melon.png', '["/assets/images/products/hami-melon.png"]', '<p>新疆哈密地区出产，日照充足，糖分高，瓜皮薄，口感清甜。</p>', 35.00, 49.00, 150, 72, '时令,新疆直发', 1, NOW(), NOW()),
('SPU012', '奉节脐橙', '皮薄汁多 酸甜平衡', (SELECT id FROM categories WHERE category_code='FRESH_FRUIT'), '奉节脐橙', '/assets/images/products/orange.png', '["/assets/images/products/orange.png"]', '<p>重庆奉节特产脐橙，果肉饱满，汁水丰富，维C含量高。</p>', 29.90, 45.00, 400, 318, '热销,维C补充', 1, NOW(), NOW()),
('SPU013', '农家新鲜大白菜', '现摘现发 无农残', (SELECT id FROM categories WHERE category_code='FRESH_FRUIT'), '农家直发', '/assets/images/products/cabbage.png', '["/assets/images/products/cabbage.png"]', '<p>产地直发大白菜，叶片厚实，适合炖菜、炒菜及腌制。</p>', 9.90, 15.00, 600, 401, '产地直发,性价比', 1, NOW(), NOW()),

-- -------- 肉禽蛋品（SPU014～SPU017）--------
('SPU014', '进口澳洲M5和牛牛排', '雪花纹理 入口即化', (SELECT id FROM categories WHERE category_code='FRESH_MEAT'), '澳洲牛肉', '/assets/images/products/beef.png', '["/assets/images/products/beef.png"]', '<p>澳洲进口M5和牛眼肉牛排，雪花脂肪分布均匀，煎烤两宜。</p>', 68.00, 99.00, 120, 53, '进口,精选', 1, NOW(), NOW()),
('SPU015', '新鲜猪里脊肉', '冷鲜直发 嫩滑低脂', (SELECT id FROM categories WHERE category_code='FRESH_MEAT'), '本地鲜肉', '/assets/images/products/pork-loin.png', '["/assets/images/products/pork-loin.png"]', '<p>每日屠宰冷鲜猪里脊，肉质细嫩，适合炒菜、腌制和健身人群。</p>', 32.00, 45.00, 200, 128, '冷鲜,低脂', 1, NOW(), NOW()),
('SPU016', '农家散养三黄鸡', '365天放养 鲜香浓郁', (SELECT id FROM categories WHERE category_code='FRESH_MEAT'), '农家牧场', '/assets/images/products/chicken.png', '["/assets/images/products/chicken.png"]', '<p>农村散养三黄鸡，肉质紧实，炖汤味道鲜美，适合煲汤滋补。</p>', 45.00, 65.00, 100, 89, '散养,滋补', 1, NOW(), NOW()),
('SPU017', '冷冻鸡翅中', '大品牌 品质稳定', (SELECT id FROM categories WHERE category_code='FRESH_MEAT'), '正大食品', '/assets/images/products/chicken-wing.png', '["/assets/images/products/chicken-wing.png"]', '<p>正大品牌冷冻鸡翅中，肉质饱满，适合烧烤、红烧和烤箱料理。</p>', 29.90, 45.00, 300, 267, '热销,烧烤首选', 1, NOW(), NOW()),

-- -------- 海鲜水产（SPU018～SPU023）--------
('SPU018', '波士顿活龙虾', '现捕现发 鲜活到家', (SELECT id FROM categories WHERE category_code='FRESH_SEAFOOD'), '进口海鲜', '/assets/images/products/lobster.png', '["/assets/images/products/lobster.png"]', '<p>波士顿进口活体龙虾，肉质紧实Q弹，适合清蒸、白灼。</p>', 138.00, 199.00, 50, 34, '进口,高端海鲜', 1, NOW(), NOW()),
('SPU019', '挪威三文鱼刺身', '冰鲜直发 刺身级品质', (SELECT id FROM categories WHERE category_code='FRESH_SEAFOOD'), '挪威海鲜', '/assets/images/products/salmon.png', '["/assets/images/products/salmon.png"]', '<p>挪威进口大西洋三文鱼，冰鲜空运，油脂丰富，刺身、寿司均可。</p>', 88.00, 128.00, 80, 61, '进口,刺身级', 1, NOW(), NOW()),
('SPU020', '湛江南美白对虾', '个大饱满 肉质弹牙', (SELECT id FROM categories WHERE category_code='FRESH_SEAFOOD'), '湛江对虾', '/assets/images/products/shrimp.png', '["/assets/images/products/shrimp.png"]', '<p>湛江基地养殖白对虾，虾肉饱满，适合白灼、爆炒、火锅。</p>', 58.00, 85.00, 150, 112, '热销,大虾', 1, NOW(), NOW()),
('SPU021', '大连冷冻扇贝', '肉厚饱满 鲜甜无腥', (SELECT id FROM categories WHERE category_code='FRESH_SEAFOOD'), '大连鲜贝', '/assets/images/products/scallop.png', '["/assets/images/products/scallop.png"]', '<p>大连出产冷冻带壳扇贝，原汁原味，适合蒜蓉、粉丝蒸制。</p>', 39.90, 59.00, 200, 178, '热销,粉丝扇贝', 1, NOW(), NOW()),
('SPU022', '阳澄湖大闸蟹礼盒', '湖区直供 膏黄丰满', (SELECT id FROM categories WHERE category_code='FRESH_SEAFOOD'), '阳澄湖', '/assets/images/products/crab.png', '["/assets/images/products/crab.png"]', '<p>阳澄湖原产地大闸蟹，公蟹蟹黄丰腴，母蟹蟹膏饱满，季节限定。</p>', 198.00, 299.00, 60, 28, '时令,礼盒,阳澄湖', 1, NOW(), NOW()),
('SPU023', '湛江鲜活生蚝', '每日现捞 鲜美多汁', (SELECT id FROM categories WHERE category_code='FRESH_SEAFOOD'), '湛江生蚝', '/assets/images/products/oyster.png', '["/assets/images/products/oyster.png"]', '<p>湛江养殖基地直发鲜活生蚝，蚝肉肥美，适合生吃、烧烤和煲汤。</p>', 45.00, 65.00, 180, 143, '热销,烧烤', 1, NOW(), NOW()),

-- -------- 乳制品（SPU024～SPU028）--------
('SPU024', '蒙牛全脂纯牛奶', '100%生牛乳 无添加', (SELECT id FROM categories WHERE category_code='FRESH_DAIRY'), '蒙牛', '/assets/images/products/milk.png', '["/assets/images/products/milk.png"]', '<p>蒙牛优质生牛乳制成，全脂营养完整，适合全家每日饮用。</p>', 39.90, 59.00, 500, 423, '热销,囤货推荐', 1, NOW(), NOW()),
('SPU025', '伊利安慕希希腊酸奶', '0蔗糖 高蛋白', (SELECT id FROM categories WHERE category_code='FRESH_DAIRY'), '伊利', '/assets/images/products/yogurt.png', '["/assets/images/products/yogurt.png"]', '<p>伊利安慕希原味酸奶，浓稠质地，蛋白质含量高，0添加蔗糖。</p>', 49.90, 79.00, 400, 356, '热销,健身首选', 1, NOW(), NOW()),
('SPU026', '总统淡味发酵黄油', '法国进口 烘焙专用', (SELECT id FROM categories WHERE category_code='FRESH_DAIRY'), '总统', '/assets/images/products/butter.png', '["/assets/images/products/butter.png"]', '<p>法国进口淡味黄油，适合烘焙、煎牛排和抹面包，香味浓郁。</p>', 29.90, 45.00, 150, 87, '进口,烘焙', 1, NOW(), NOW()),
('SPU027', '安佳芝士奶酪片', '进口奶酪 即食早餐', (SELECT id FROM categories WHERE category_code='FRESH_DAIRY'), '安佳', '/assets/images/products/cheese.png', '["/assets/images/products/cheese.png"]', '<p>新西兰进口安佳奶酪片，适合三明治、汉堡、早餐搭配。</p>', 35.00, 55.00, 200, 134, '进口,早餐', 1, NOW(), NOW()),
('SPU028', '雅培铂睿婴儿配方奶粉', '有机认证 科学配比', (SELECT id FROM categories WHERE category_code='FRESH_DAIRY'), '雅培', '/assets/images/products/formula.png', '["/assets/images/products/formula.png"]', '<p>雅培铂睿1段婴幼儿配方奶粉，接近母乳配方，营养均衡全面。</p>', 268.00, 398.00, 100, 45, '婴儿,有机认证', 1, NOW(), NOW()),

-- -------- 粮油干货（SPU029～SPU033）--------
('SPU029', '金龙鱼长粒香米', '颗粒饱满 清香软糯', (SELECT id FROM categories WHERE category_code='FRESH_GRAIN'), '金龙鱼', '/assets/images/products/rice.png', '["/assets/images/products/rice.png"]', '<p>金龙鱼精选长粒香米，米粒修长，煮出的饭清香软糯，家庭必备。</p>', 49.90, 75.00, 600, 512, '热销,日常囤货', 1, NOW(), NOW()),
('SPU030', '鲁花5S压榨花生油', '物理压榨 留住原香', (SELECT id FROM categories WHERE category_code='FRESH_GRAIN'), '鲁花', '/assets/images/products/peanut-oil.png', '["/assets/images/products/peanut-oil.png"]', '<p>5S物理压榨工艺，无化学溶剂，花生香浓，适合炒菜、凉拌。</p>', 99.00, 139.00, 300, 267, '热销,物理压榨', 1, NOW(), NOW()),
('SPU031', '五常稻花香大米', '中国地理标志 东北名米', (SELECT id FROM categories WHERE category_code='FRESH_GRAIN'), '五常', '/assets/images/products/dongbei-rice.png', '["/assets/images/products/dongbei-rice.png"]', '<p>黑龙江五常地理标志产品，稻花香品种，米饭清甜有嚼劲。</p>', 69.90, 99.00, 400, 289, '热销,地标产品', 1, NOW(), NOW()),
('SPU032', '红豆薏米杂粮组合', '祛湿健脾 家庭煮粥', (SELECT id FROM categories WHERE category_code='FRESH_GRAIN'), '农家', '/assets/images/products/mixed-grain.png', '["/assets/images/products/mixed-grain.png"]', '<p>精选红豆、薏米、燕麦等杂粮组合，煮粥健康，适合日常食用。</p>', 39.90, 59.00, 250, 178, '健康,煮粥', 1, NOW(), NOW()),
('SPU033', '东湖十年陈酿老陈醋', '酿造工艺 醇厚回甘', (SELECT id FROM categories WHERE category_code='FRESH_GRAIN'), '东湖', '/assets/images/products/vinegar.png', '["/assets/images/products/vinegar.png"]', '<p>山西东湖陈酿老陈醋，以高粱为原料，传统工艺酿造，口感醇厚。</p>', 19.90, 29.00, 400, 312, '热销,山西特产', 1, NOW(), NOW()),

-- -------- 厨房用品（SPU034～SPU038）--------
('SPU034', '苏泊尔精铁不粘炒锅', '无涂层 健康烹饪', (SELECT id FROM categories WHERE category_code='DAILY_KITCHEN'), '苏泊尔', '/assets/images/products/wok.png', '["/assets/images/products/wok.png"]', '<p>苏泊尔精铁锻打不粘炒锅，无PFOA涂层，高温耐用，不粘效果持久。</p>', 129.00, 199.00, 150, 78, '热销,健康烹饪', 1, NOW(), NOW()),
('SPU035', '双立人厨师刀', '德国工艺 锋利耐用', (SELECT id FROM categories WHERE category_code='DAILY_KITCHEN'), '双立人', '/assets/images/products/chef-knife.png', '["/assets/images/products/chef-knife.png"]', '<p>德国双立人优质不锈钢，平衡手感，刀刃锋利，适合专业和家用。</p>', 198.00, 299.00, 80, 34, '德国进口,厨师刀', 1, NOW(), NOW()),
('SPU036', '南竹天然竹制砧板', '无漆无胶 环保天然', (SELECT id FROM categories WHERE category_code='DAILY_KITCHEN'), '南竹', '/assets/images/products/cutting-board.png', '["/assets/images/products/cutting-board.png"]', '<p>天然竹制砧板，无甲醛，抗菌防霉，适合蔬菜、肉类切割。</p>', 59.00, 89.00, 200, 145, '环保,家用', 1, NOW(), NOW()),
('SPU037', '乐扣乐扣保鲜盒套装', '密封防漏 冰箱常备', (SELECT id FROM categories WHERE category_code='DAILY_KITCHEN'), '乐扣乐扣', '/assets/images/products/lunch-box.png', '["/assets/images/products/lunch-box.png"]', '<p>韩国乐扣乐扣密封保鲜盒，多种容量组合，耐冰箱冷冻和微波加热。</p>', 89.00, 139.00, 150, 96, '热销,厨房收纳', 1, NOW(), NOW()),
('SPU038', '炊大皇不锈钢锅铲套装', '304钢 隔热防烫', (SELECT id FROM categories WHERE category_code='DAILY_KITCHEN'), '炊大皇', '/assets/images/products/spatula.png', '["/assets/images/products/spatula.png"]', '<p>304食品级不锈钢锅铲，长柄防烫，铲头设计符合人体工程学。</p>', 45.00, 69.00, 250, 187, '实用,厨具组合', 1, NOW(), NOW()),

-- -------- 家居清洁（SPU039～SPU041）--------
('SPU039', '花王餐具洗涤剂', '果酸配方 去油不伤手', (SELECT id FROM categories WHERE category_code='DAILY_CLEAN'), '花王', '/assets/images/products/dish-soap.png', '["/assets/images/products/dish-soap.png"]', '<p>日本花王果酸洗碗液，快速去除油污，泡沫丰富易冲洗。</p>', 29.90, 45.00, 300, 234, '进口,温和', 1, NOW(), NOW()),
('SPU040', '威猛先生浴室清洁剂', '强效除垢 去污力强', (SELECT id FROM categories WHERE category_code='DAILY_CLEAN'), '威猛先生', '/assets/images/products/bathroom-cleaner.png', '["/assets/images/products/bathroom-cleaner.png"]', '<p>专为浴室设计，强效分解水垢、皂垢，适合瓷砖、马桶清洁。</p>', 24.90, 39.00, 250, 198, '深层清洁', 1, NOW(), NOW()),
('SPU041', '滴露消毒液', '杀菌99.9% 家庭卫生', (SELECT id FROM categories WHERE category_code='DAILY_CLEAN'), '滴露', '/assets/images/products/disinfectant.png', '["/assets/images/products/disinfectant.png"]', '<p>滴露专业消毒液，可用于地板、衣物、玩具消毒，杀菌有效。</p>', 39.90, 59.00, 300, 267, '热销,消毒杀菌', 1, NOW(), NOW()),

-- -------- 纸品湿巾（SPU042～SPU043）--------
('SPU042', '心相印湿巾', '99.9%杀菌 随身携带', (SELECT id FROM categories WHERE category_code='DAILY_PAPER'), '心相印', '/assets/images/products/wet-wipe.png', '["/assets/images/products/wet-wipe.png"]', '<p>心相印杀菌湿巾，含酒精消毒成分，适合出行、餐前手部清洁。</p>', 29.90, 45.00, 400, 312, '热销,出行必备', 1, NOW(), NOW()),
('SPU043', '清风原木纯品手帕纸', '4层加厚 柔韧有弹性', (SELECT id FROM categories WHERE category_code='DAILY_PAPER'), '清风', '/assets/images/products/napkin.png', '["/assets/images/products/napkin.png"]', '<p>清风4层原木浆手帕纸，柔软不掉屑，适合随身携带和餐桌使用。</p>', 39.90, 59.00, 500, 421, '热销,囤货推荐', 1, NOW(), NOW()),

-- -------- 收纳整理（SPU044～SPU048）--------
('SPU044', '禧天龙特大号收纳箱', '加厚PP材质 超承重', (SELECT id FROM categories WHERE category_code='DAILY_STORAGE'), '禧天龙', '/assets/images/products/storage-box.png', '["/assets/images/products/storage-box.png"]', '<p>超大容积加厚收纳箱，密封防潮，可叠放，适合换季衣物存储。</p>', 59.00, 89.00, 200, 134, '热销,换季必备', 1, NOW(), NOW()),
('SPU045', '爱丽思树脂五层整理柜', '抽屉式 分类收纳', (SELECT id FROM categories WHERE category_code='DAILY_STORAGE'), '爱丽思', '/assets/images/products/drawer-cabinet.png', '["/assets/images/products/drawer-cabinet.png"]', '<p>日本爱丽思设计，树脂抽屉柜，5层大容量，适合卧室、浴室收纳。</p>', 199.00, 299.00, 100, 67, '进口设计,整理收纳', 1, NOW(), NOW()),
('SPU046', '真空压缩收纳袋套装', '节省80%空间 防潮防尘', (SELECT id FROM categories WHERE category_code='DAILY_STORAGE'), '百草园', '/assets/images/products/vacuum-bag.png', '["/assets/images/products/vacuum-bag.png"]', '<p>加厚真空压缩袋，手卷排气无需抽气泵，适合被子、冬季衣物收纳。</p>', 49.90, 79.00, 300, 223, '热销,换季收纳', 1, NOW(), NOW()),
('SPU047', '透明翻盖鞋盒收纳盒', '防尘防潮 看得见找得到', (SELECT id FROM categories WHERE category_code='DAILY_STORAGE'), '本来设计', '/assets/images/products/shoe-box.png', '["/assets/images/products/shoe-box.png"]', '<p>透明翻盖鞋盒，可叠加组合，防尘防潮，让鞋柜整洁美观。</p>', 99.00, 149.00, 200, 156, '热销,鞋柜整理', 1, NOW(), NOW()),
('SPU048', '床底超薄扁平收纳箱', '超薄15cm 充分利用床底空间', (SELECT id FROM categories WHERE category_code='DAILY_STORAGE'), '禧天龙', '/assets/images/products/under-bed-box.png', '["/assets/images/products/under-bed-box.png"]', '<p>超薄设计可放床底，带滑轮方便取放，适合棉被、换季衣物存放。</p>', 69.00, 99.00, 150, 89, '创意收纳', 1, NOW(), NOW()),

-- -------- 面部护理（SPU049～SPU052）--------
('SPU049', '兰蔻小黑瓶肌底精华', '紧致修护 改善暗沉', (SELECT id FROM categories WHERE category_code='BEAUTY_FACE'), '兰蔻', '/assets/images/products/lancome-serum.png', '["/assets/images/products/lancome-serum.png"]', '<p>兰蔻小黑瓶精华液，含发酵酵母精华，促进肌肤新陈代谢，改善暗沉。</p>', 890.00, 1199.00, 60, 23, '大牌,抗老精华', 1, NOW(), NOW()),
('SPU050', '雅诗兰黛小棕瓶精华', '修护再生 熬夜救星', (SELECT id FROM categories WHERE category_code='BEAUTY_FACE'), '雅诗兰黛', '/assets/images/products/estee-serum.png', '["/assets/images/products/estee-serum.png"]', '<p>雅诗兰黛Advanced Night Repair精华，过夜修护，焕亮肤色。</p>', 780.00, 1080.00, 60, 28, '大牌,修护精华', 1, NOW(), NOW()),
('SPU051', 'SK-II神仙水护肤精华露', '焕采平衡 改善肤质', (SELECT id FROM categories WHERE category_code='BEAUTY_FACE'), 'SK-II', '/assets/images/products/skii-serum.png', '["/assets/images/products/skii-serum.png"]', '<p>SK-II核心成分PITERA天然酵母精华，平衡肌肤，改善肤质细腻度。</p>', 1380.00, 1880.00, 40, 15, '大牌,经典精华', 1, NOW(), NOW()),
('SPU052', '珀莱雅双抗精华液', '国货之光 平价替代', (SELECT id FROM categories WHERE category_code='BEAUTY_FACE'), '珀莱雅', '/assets/images/products/proya-serum.png', '["/assets/images/products/proya-serum.png"]', '<p>珀莱雅双抗精华，抗氧+抗糖双效合一，高性价比国货精华。</p>', 129.00, 199.00, 200, 178, '国货,高性价比', 1, NOW(), NOW()),

-- -------- 身体护理（SPU053～SPU057）--------
('SPU053', '妮维雅滋润身体乳', '深层保湿 24小时锁水', (SELECT id FROM categories WHERE category_code='BEAUTY_BODY'), '妮维雅', '/assets/images/products/nivea-lotion.png', '["/assets/images/products/nivea-lotion.png"]', '<p>妮维雅经典滋润身体乳，质地清爽，快速吸收，适合全身使用。</p>', 59.90, 89.00, 200, 167, '热销,大瓶装', 1, NOW(), NOW()),
('SPU054', '芳草集玫瑰沐浴露', '花香沐浴 嫩肤滋润', (SELECT id FROM categories WHERE category_code='BEAUTY_BODY'), '芳草集', '/assets/images/products/fancl-shower.png', '["/assets/images/products/fancl-shower.png"]', '<p>芳草集玫瑰系列沐浴露，花草精华配方，温和清洁，留香持久。</p>', 49.90, 79.00, 200, 145, '国货,花香', 1, NOW(), NOW()),
('SPU055', '舒肤佳抑菌香皂', '持久留香 抑菌99%', (SELECT id FROM categories WHERE category_code='BEAUTY_BODY'), '舒肤佳', '/assets/images/products/safeguard-soap.png', '["/assets/images/products/safeguard-soap.png"]', '<p>舒肤佳抑菌香皂，除菌洗手，家庭必备，经济实惠多买多省。</p>', 29.90, 45.00, 400, 312, '热销,家庭装', 1, NOW(), NOW()),
('SPU056', '多芬乳酪滋养润肤乳', '乳酪配方 抚平干纹', (SELECT id FROM categories WHERE category_code='BEAUTY_BODY'), '多芬', '/assets/images/products/dove-lotion.png', '["/assets/images/products/dove-lotion.png"]', '<p>多芬乳酪配方，滋润不油腻，修复干燥皮肤，适合秋冬使用。</p>', 49.90, 79.00, 200, 134, '热销,秋冬滋润', 1, NOW(), NOW()),
('SPU057', '曼秀雷敦水活防晒乳', 'SPF50+ 水润不假白', (SELECT id FROM categories WHERE category_code='BEAUTY_BODY'), '曼秀雷敦', '/assets/images/products/sunscreen.png', '["/assets/images/products/sunscreen.png"]', '<p>曼秀雷敦水活防晒乳，SPF50+ PA++++，轻薄水润，适合日常通勤。</p>', 49.90, 79.00, 200, 156, '热销,高防晒', 1, NOW(), NOW()),

-- -------- 香水彩妆（SPU058～SPU062）--------
('SPU058', 'Dior真我香水', '性感花香 经久不散', (SELECT id FROM categories WHERE category_code='BEAUTY_MAKEUP'), 'Dior', '/assets/images/products/dior-perfume.png', '["/assets/images/products/dior-perfume.png"]', '<p>迪奥真我女士香水，花香木质调，前调茉莉，后调雪松，气质优雅。</p>', 798.00, 1099.00, 50, 17, '大牌,经典香水', 1, NOW(), NOW()),
('SPU059', 'YSL圣罗兰方管唇釉', '丝绒质地 显色持久', (SELECT id FROM categories WHERE category_code='BEAUTY_MAKEUP'), 'YSL', '/assets/images/products/ysl-lipstick.png', '["/assets/images/products/ysl-lipstick.png"]', '<p>YSL方管唇釉，丝绒哑光质地，色号丰富，持妆力强，显色自然。</p>', 288.00, 389.00, 80, 45, '大牌,口红', 1, NOW(), NOW()),
('SPU060', '花西子眉笔', '极细笔头 自然仿真', (SELECT id FROM categories WHERE category_code='BEAUTY_MAKEUP'), '花西子', '/assets/images/products/eyebrow-pencil.png', '["/assets/images/products/eyebrow-pencil.png"]', '<p>花西子0.2mm超细眉笔，仿真毛发笔触，自然持久，国货首选。</p>', 79.00, 109.00, 200, 178, '国货,热销', 1, NOW(), NOW()),
('SPU061', '完美日记探索眼影盘', '高性价比 色彩丰富', (SELECT id FROM categories WHERE category_code='BEAUTY_MAKEUP'), '完美日记', '/assets/images/products/eyeshadow.png', '["/assets/images/products/eyeshadow.png"]', '<p>完美日记探险家系列眼影盘，多色可用，适合日妆、晚妆。</p>', 89.00, 139.00, 200, 167, '国货,高性价比', 1, NOW(), NOW()),
('SPU062', '纪梵希四宫格散粉', '控油持妆 细腻无暇', (SELECT id FROM categories WHERE category_code='BEAUTY_MAKEUP'), '纪梵希', '/assets/images/products/loose-powder.png', '["/assets/images/products/loose-powder.png"]', '<p>纪梵希四宫格散粉，混色提亮，控油持久，适合日常定妆使用。</p>', 490.00, 699.00, 60, 29, '大牌,定妆', 1, NOW(), NOW()),

-- -------- 口腔护理（SPU063～SPU066）--------
('SPU063', '云南白药留兰香牙膏', '活血止血 清新口气', (SELECT id FROM categories WHERE category_code='BEAUTY_ORAL'), '云南白药', '/assets/images/products/toothpaste.png', '["/assets/images/products/toothpaste.png"]', '<p>云南白药薄荷留兰香牙膏，活血止血配方，改善牙龈出血问题。</p>', 39.90, 59.00, 300, 245, '热销,护龈', 1, NOW(), NOW()),
('SPU064', '欧乐B电动牙刷', '3D声波清洁 深层洁白', (SELECT id FROM categories WHERE category_code='BEAUTY_ORAL'), '欧乐B', '/assets/images/products/electric-toothbrush.png', '["/assets/images/products/electric-toothbrush.png"]', '<p>欧乐B声波电动牙刷，3种清洁模式，专业去除牙菌斑，亮白牙齿。</p>', 199.00, 299.00, 100, 56, '热销,电动牙刷', 1, NOW(), NOW()),
('SPU065', '李施德林零酒精漱口水', '不含酒精 温和护理', (SELECT id FROM categories WHERE category_code='BEAUTY_ORAL'), '李施德林', '/assets/images/products/mouthwash.png', '["/assets/images/products/mouthwash.png"]', '<p>李施德林零酒精漱口水，温和不刺激，清除牙菌斑，抑菌爽口。</p>', 49.90, 79.00, 200, 156, '热销,口腔护理', 1, NOW(), NOW()),
('SPU066', '高露洁护龈牙刷', '超细软毛 深入清洁', (SELECT id FROM categories WHERE category_code='BEAUTY_ORAL'), '高露洁', '/assets/images/products/toothbrush.png', '["/assets/images/products/toothbrush.png"]', '<p>高露洁护龈系列牙刷，超细软毛，深入齿缝，适合敏感牙龈人群。</p>', 29.90, 45.00, 400, 312, '热销,家庭装', 1, NOW(), NOW()),

-- -------- 护发洗发（SPU067～SPU071）--------
('SPU067', '潘婷氨基酸丝滑洗发水', '顺滑修护 减少毛躁', (SELECT id FROM categories WHERE category_code='BEAUTY_HAIR'), '潘婷', '/assets/images/products/pantene-shampoo.png', '["/assets/images/products/pantene-shampoo.png"]', '<p>潘婷氨基酸配方洗发水，温和清洁，修护发丝，减少分叉毛躁。</p>', 49.90, 79.00, 250, 198, '热销,顺滑修护', 1, NOW(), NOW()),
('SPU068', '飘柔至臻柔顺洗发露', '经典配方 历久弥新', (SELECT id FROM categories WHERE category_code='BEAUTY_HAIR'), '飘柔', '/assets/images/products/rejoice-shampoo.png', '["/assets/images/products/rejoice-shampoo.png"]', '<p>飘柔经典柔顺洗发露，深层清洁，持久柔顺，适合各类发质。</p>', 39.90, 59.00, 300, 256, '热销,经典', 1, NOW(), NOW()),
('SPU069', '海飞丝去屑止痒洗发水', '高效去屑 清爽减痒', (SELECT id FROM categories WHERE category_code='BEAUTY_HAIR'), '海飞丝', '/assets/images/products/head-shoulders.png', '["/assets/images/products/head-shoulders.png"]', '<p>海飞丝ZPT去屑成分，从根源抑制头皮屑，清爽舒适不油腻。</p>', 49.90, 75.00, 250, 201, '热销,去屑专用', 1, NOW(), NOW()),
('SPU070', '施华蔻黑鱼子焗油发膜', '深层滋养 修复受损', (SELECT id FROM categories WHERE category_code='BEAUTY_HAIR'), '施华蔻', '/assets/images/products/hair-mask.png', '["/assets/images/products/hair-mask.png"]', '<p>施华蔻黑鱼子油发膜，深层滋养受损发丝，改善毛鳞片，增加光泽。</p>', 79.00, 119.00, 150, 89, '烫染修护', 1, NOW(), NOW()),
('SPU071', '阿道夫氨基酸护发素', '浓稠质地 即冲即走', (SELECT id FROM categories WHERE category_code='BEAUTY_HAIR'), '阿道夫', '/assets/images/products/conditioner.png', '["/assets/images/products/conditioner.png"]', '<p>阿道夫氨基酸护发素，温和配方，顺滑减少静电，适合日常护发。</p>', 49.90, 75.00, 200, 145, '热销,国货', 1, NOW(), NOW()),

-- -------- 零食小吃（SPU072～SPU078）--------
('SPU072', '百草味每日坚果大礼包', '7种坚果 营养均衡', (SELECT id FROM categories WHERE category_code='FOOD_SNACK'), '百草味', '/assets/images/products/mixed-nuts.png', '["/assets/images/products/mixed-nuts.png"]', '<p>百草味每日坚果，7种混合坚果+果干，每日小包装，健康美味。</p>', 109.00, 159.00, 200, 145, '热销,健康零食', 1, NOW(), NOW()),
('SPU073', '三只松鼠零食大礼包', '品类丰富 送礼首选', (SELECT id FROM categories WHERE category_code='FOOD_SNACK'), '三只松鼠', '/assets/images/products/snack-pack.png', '["/assets/images/products/snack-pack.png"]', '<p>三只松鼠零食大礼包，汇集坚果、薯片、蜜饯等多种零食，送礼实惠。</p>', 159.00, 239.00, 150, 112, '热销,礼盒', 1, NOW(), NOW()),
('SPU074', '旺旺雪饼仙贝超值装', '经典零食 酥脆好吃', (SELECT id FROM categories WHERE category_code='FOOD_SNACK'), '旺旺', '/assets/images/products/wang-biscuit.png', '["/assets/images/products/wang-biscuit.png"]', '<p>旺旺雪饼仙贝经典口味，酥脆不油腻，大包装性价比高，全家分享。</p>', 29.90, 45.00, 400, 312, '热销,经典零食', 1, NOW(), NOW()),
('SPU075', '卫龙大面筋辣条礼包', '香辣过瘾 童年回味', (SELECT id FROM categories WHERE category_code='FOOD_SNACK'), '卫龙', '/assets/images/products/spicy-strip.png', '["/assets/images/products/spicy-strip.png"]', '<p>卫龙辣条经典系列，选用优质面筋，独立小包装，健康卫生。</p>', 39.90, 59.00, 300, 267, '热销,零辣条', 1, NOW(), NOW()),
('SPU076', '徐福记沙琪玛', '酥软香甜 入口即化', (SELECT id FROM categories WHERE category_code='FOOD_SNACK'), '徐福记', '/assets/images/products/sachima.png', '["/assets/images/products/sachima.png"]', '<p>徐福记经典沙琪玛，软糯香甜，蜂蜜配方，下午茶搭配茶饮最佳。</p>', 29.90, 45.00, 400, 328, '热销,经典糕点', 1, NOW(), NOW()),
('SPU077', '良品铺子猪肉脯', '台式烤制 鲜香入味', (SELECT id FROM categories WHERE category_code='FOOD_SNACK'), '良品铺子', '/assets/images/products/pork-jerky.png', '["/assets/images/products/pork-jerky.png"]', '<p>良品铺子台式烤制猪肉脯，选用优质猪后腿肉，薄厚均匀，鲜香可口。</p>', 49.90, 75.00, 200, 145, '热销,肉类零食', 1, NOW(), NOW()),
('SPU078', '乐事经典原味薯片家庭装', '酥脆薄片 经典原味', (SELECT id FROM categories WHERE category_code='FOOD_SNACK'), '乐事', '/assets/images/products/chips.png', '["/assets/images/products/chips.png"]', '<p>乐事经典原味薯片，薄脆爽口，家庭大包装更实惠，分享无压力。</p>', 39.90, 59.00, 300, 256, '热销,分享装', 1, NOW(), NOW()),

-- -------- 冲饮茶酒（SPU079～SPU084）--------
('SPU079', '雀巢醇品速溶黑咖啡', '无糖无奶 醇厚提神', (SELECT id FROM categories WHERE category_code='FOOD_DRINK'), '雀巢', '/assets/images/products/nescafe.png', '["/assets/images/products/nescafe.png"]', '<p>雀巢醇品纯黑速溶咖啡，精选咖啡豆，浓缩萃取，无糖无脂。</p>', 49.90, 79.00, 300, 234, '热销,黑咖啡', 1, NOW(), NOW()),
('SPU080', '农夫山泉天然矿泉水', '长白山水源 弱碱性', (SELECT id FROM categories WHERE category_code='FOOD_DRINK'), '农夫山泉', '/assets/images/products/mineral-water.png', '["/assets/images/products/mineral-water.png"]', '<p>农夫山泉采自长白山天然水源，含多种微量元素，弱碱性健康好水。</p>', 29.90, 45.00, 600, 523, '热销,囤货推荐', 1, NOW(), NOW()),
('SPU081', '元气森林白桃气泡水', '0糖0卡 气泡清爽', (SELECT id FROM categories WHERE category_code='FOOD_DRINK'), '元气森林', '/assets/images/products/sparkling-water.png', '["/assets/images/products/sparkling-water.png"]', '<p>元气森林白桃口味气泡水，0糖0脂0卡路里，天然果香，清爽畅饮。</p>', 49.90, 75.00, 400, 356, '热销,无糖饮料', 1, NOW(), NOW()),
('SPU082', '大益普洱茶（生/熟）', '传统工艺 陈香醇厚', (SELECT id FROM categories WHERE category_code='FOOD_DRINK'), '大益', '/assets/images/products/puerh-tea.png', '["/assets/images/products/puerh-tea.png"]', '<p>大益集团出品普洱茶，云南原料，传统压制工艺，可选生茶或熟茶。</p>', 189.00, 299.00, 80, 34, '茶叶,收藏', 1, NOW(), NOW()),
('SPU083', '青岛纯生啤酒', '鲜啤风味 低温酿制', (SELECT id FROM categories WHERE category_code='FOOD_DRINK'), '青岛啤酒', '/assets/images/products/beer.png', '["/assets/images/products/beer.png"]', '<p>青岛纯生啤酒，不经高温杀菌，保留鲜活酵母，口感鲜爽清冽。</p>', 59.90, 89.00, 400, 312, '热销,聚会必备', 1, NOW(), NOW()),
('SPU084', '张裕解百纳干红葡萄酒', '经典品牌 餐桌佳酿', (SELECT id FROM categories WHERE category_code='FOOD_DRINK'), '张裕', '/assets/images/products/wine.png', '["/assets/images/products/wine.png"]', '<p>张裕解百纳干红葡萄酒，选用优质赤霞珠葡萄，单宁柔和，果香浓郁。</p>', 99.00, 149.00, 200, 123, '节日送礼,葡萄酒', 1, NOW(), NOW()),

-- -------- 方便速食（SPU085～SPU089）--------
('SPU085', '康师傅经典红烧牛肉面', '汤底浓郁 大块牛肉', (SELECT id FROM categories WHERE category_code='FOOD_INSTANT'), '康师傅', '/assets/images/products/instant-noodle.png', '["/assets/images/products/instant-noodle.png"]', '<p>康师傅红烧牛肉面，经典配方，汤底浓郁，牛肉料包分量十足。</p>', 29.90, 45.00, 500, 423, '热销,经典口味', 1, NOW(), NOW()),
('SPU086', '统一老坛酸菜牛肉桶面', '酸辣开胃 爽口解馋', (SELECT id FROM categories WHERE category_code='FOOD_INSTANT'), '统一', '/assets/images/products/bucket-noodle.png', '["/assets/images/products/bucket-noodle.png"]', '<p>统一老坛酸菜牛肉面桶装，酸菜料包清爽开胃，牛肉汤底浓香。</p>', 34.90, 55.00, 400, 345, '热销,酸辣', 1, NOW(), NOW()),
('SPU087', '海底捞自煮小火锅', '一人食火锅 方便快捷', (SELECT id FROM categories WHERE category_code='FOOD_INSTANT'), '海底捞', '/assets/images/products/self-heating-hotpot.png', '["/assets/images/products/self-heating-hotpot.png"]', '<p>海底捞自热小火锅，无需明火，加水即可加热，食材丰富，一人食享受。</p>', 29.90, 45.00, 300, 234, '热销,一人食', 1, NOW(), NOW()),
('SPU088', '李子柒藕粉羹', '纯天然 开水一冲即食', (SELECT id FROM categories WHERE category_code='FOOD_INSTANT'), '李子柒', '/assets/images/products/lotus-root-powder.png', '["/assets/images/products/lotus-root-powder.png"]', '<p>李子柒藕粉，选用优质莲藕加工，开水冲调，晶莹剔透，口感嫩滑。</p>', 49.90, 79.00, 200, 167, '热销,网红食品', 1, NOW(), NOW()),
('SPU089', '莫小仙自热米饭', '无需加热器 随时随地', (SELECT id FROM categories WHERE category_code='FOOD_INSTANT'), '莫小仙', '/assets/images/products/self-heating-rice.png', '["/assets/images/products/self-heating-rice.png"]', '<p>莫小仙自热米饭，自带加热包，户外旅行必备，多种口味可选。</p>', 29.90, 45.00, 300, 245, '热销,户外必备', 1, NOW(), NOW()),

-- -------- 手机配件（SPU090～SPU094）--------
('SPU090', '苹果原装20W快充套装', '官方原装 安全快速', (SELECT id FROM categories WHERE category_code='DIGITAL_PHONE_ACC'), 'Apple', '/assets/images/products/apple-charger.png', '["/assets/images/products/apple-charger.png"]', '<p>苹果原装20W USB-C快充充电器，配套1m lightning/Type-C数据线，安全可靠。</p>', 149.00, 199.00, 150, 89, '原装,快充', 1, NOW(), NOW()),
('SPU091', '华为65W超级快充头', '多协议兼容 一充多用', (SELECT id FROM categories WHERE category_code='DIGITAL_PHONE_ACC'), '华为', '/assets/images/products/huawei-charger.png', '["/assets/images/products/huawei-charger.png"]', '<p>华为65W桌面超级快充，支持多种快充协议，Type-C+USB-A双口，适配多设备。</p>', 99.00, 149.00, 200, 134, '快充,多设备', 1, NOW(), NOW()),
('SPU092', '小米6A数据线', '240W充电 10Gbps传输', (SELECT id FROM categories WHERE category_code='DIGITAL_PHONE_ACC'), '小米', '/assets/images/products/mi-cable.png', '["/assets/images/products/mi-cable.png"]', '<p>小米6A Type-C数据线，支持240W超级快充，10Gbps数据传输，耐用编织线身。</p>', 29.90, 49.00, 400, 312, '热销,高性价比', 1, NOW(), NOW()),
('SPU093', '绿联超大容量充电宝', '自带线 快充便携', (SELECT id FROM categories WHERE category_code='DIGITAL_PHONE_ACC'), '绿联', '/assets/images/products/power-bank.png', '["/assets/images/products/power-bank.png"]', '<p>绿联大容量充电宝，自带四线合一，支持22.5W快充，轻薄便携。</p>', 169.00, 239.00, 150, 89, '热销,出行必备', 1, NOW(), NOW()),
('SPU094', 'TORRAS多功能手机支架', '车载桌面两用 稳固不晃', (SELECT id FROM categories WHERE category_code='DIGITAL_PHONE_ACC'), 'TORRAS', '/assets/images/products/phone-holder.png', '["/assets/images/products/phone-holder.png"]', '<p>TORRAS手机支架，磁吸+吸盘双固定，适配车载出风口和桌面使用。</p>', 79.00, 119.00, 100, 56, '实用配件', 1, NOW(), NOW()),

-- -------- 小家电（SPU095～SPU098）--------
('SPU095', '小熊多功能早餐机', '煎烤一体 告别外卖早餐', (SELECT id FROM categories WHERE category_code='DIGITAL_APPLIANCE'), '小熊', '/assets/images/products/breakfast-machine.png', '["/assets/images/products/breakfast-machine.png"]', '<p>小熊多功能早餐机，三明治机+烤盘+煎蛋三合一，告别每天出门买早餐。</p>', 169.00, 239.00, 100, 67, '热销,厨房小家电', 1, NOW(), NOW()),
('SPU096', '苏泊尔电热水壶', '304不锈钢 快速沸腾', (SELECT id FROM categories WHERE category_code='DIGITAL_APPLIANCE'), '苏泊尔', '/assets/images/products/kettle.png', '["/assets/images/products/kettle.png"]', '<p>苏泊尔304不锈钢电热水壶，1500W大功率，快速烧水，食品级内胆安全放心。</p>', 129.00, 199.00, 150, 112, '热销,厨房必备', 1, NOW(), NOW()),
('SPU097', '飞利浦三刀头电动剃须刀', '浮动刀头 贴面顺滑', (SELECT id FROM categories WHERE category_code='DIGITAL_APPLIANCE'), '飞利浦', '/assets/images/products/shaver.png', '["/assets/images/products/shaver.png"]', '<p>飞利浦三刀头电动剃须刀，360度浮动贴面，干湿两用，USB充电便携。</p>', 299.00, 449.00, 80, 34, '男士好礼', 1, NOW(), NOW()),
('SPU098', '美的节能台式电风扇', '七叶大风量 超静音', (SELECT id FROM categories WHERE category_code='DIGITAL_APPLIANCE'), '美的', '/assets/images/products/fan.png', '["/assets/images/products/fan.png"]', '<p>美的台式电风扇，七叶低噪大风量，多档风速调节，定时休眠节能。</p>', 199.00, 299.00, 120, 78, '夏季必备', 1, NOW(), NOW()),

-- -------- 婴儿食品（SPU099～SPU102）--------
('SPU099', '英雄有机高铁米粉', '补铁强化 助力成长', (SELECT id FROM categories WHERE category_code='BABY_FOOD'), '英雄', '/assets/images/products/baby-rice.png', '["/assets/images/products/baby-rice.png"]', '<p>英雄有机婴儿营养米粉，强化铁质，有机认证，适合6个月以上宝宝添加辅食。</p>', 49.90, 79.00, 200, 123, '婴儿辅食,有机', 1, NOW(), NOW()),
('SPU100', '亨氏金装婴儿果泥', '0添加 天然果蔬', (SELECT id FROM categories WHERE category_code='BABY_FOOD'), '亨氏', '/assets/images/products/baby-puree.png', '["/assets/images/products/baby-puree.png"]', '<p>亨氏婴儿果泥，精选天然蔬果，0添加糖盐防腐剂，即开即食方便卫生。</p>', 59.90, 89.00, 150, 89, '婴儿辅食,天然', 1, NOW(), NOW()),
('SPU101', '嘉宝有机溶豆婴儿零食', '入口即化 练习抓握', (SELECT id FROM categories WHERE category_code='BABY_FOOD'), '嘉宝', '/assets/images/products/baby-snack.png', '["/assets/images/products/baby-snack.png"]', '<p>嘉宝有机水果溶豆，入口即化无需咀嚼，帮助宝宝练习抓握，8个月以上适用。</p>', 39.90, 59.00, 200, 145, '婴儿零食,有机', 1, NOW(), NOW()),
('SPU102', '喜宝有机婴儿配方奶粉', '欧盟有机认证 近母乳配方', (SELECT id FROM categories WHERE category_code='BABY_FOOD'), '喜宝', '/assets/images/products/baby-formula.png', '["/assets/images/products/baby-formula.png"]', '<p>德国喜宝有机婴儿奶粉，欧盟有机认证原料，DHA+ARA配比科学，近母乳设计。</p>', 358.00, 499.00, 80, 34, '进口,有机奶粉', 1, NOW(), NOW()),

-- -------- 玩具益智（SPU103～SPU105）--------
('SPU103', '乐高经典创意颗粒积木', '自由拼搭 激发创造力', (SELECT id FROM categories WHERE category_code='BABY_TOY'), 'LEGO', '/assets/images/products/lego.png', '["/assets/images/products/lego.png"]', '<p>乐高经典系列创意积木，颗粒精度高，颜色丰富，适合3岁以上儿童自由拼搭。</p>', 299.00, 449.00, 80, 34, '热销,益智玩具', 1, NOW(), NOW()),
('SPU104', '费雪婴儿摇铃安抚玩具', '柔软无毒 启蒙感知', (SELECT id FROM categories WHERE category_code='BABY_TOY'), 'Fisher-Price', '/assets/images/products/baby-rattle.png', '["/assets/images/products/baby-rattle.png"]', '<p>费雪婴儿摇铃玩具，多种颜色形状，刺激视觉触觉，适合0-12个月宝宝。</p>', 129.00, 189.00, 100, 56, '婴儿玩具,安抚', 1, NOW(), NOW()),
('SPU105', '哈哈大王大颗粒儿童积木', '大颗粒安全 1-3岁适用', (SELECT id FROM categories WHERE category_code='BABY_TOY'), '哈哈大王', '/assets/images/products/big-blocks.png', '["/assets/images/products/big-blocks.png"]', '<p>大颗粒软体积木，圆角设计防划伤，颜色鲜艳，培养空间思维，适合1-3岁。</p>', 149.00, 219.00, 100, 45, '益智,安全', 1, NOW(), NOW());

-- ============================================================
-- 第三步：新增商品 SKU
-- spu_id 通过子查询按 spu_code 引用
-- ============================================================

INSERT INTO product_skus (sku_code, spu_id, sku_name, price, line_price, stock, sales, specs, status, created_at, updated_at) VALUES

-- 蔬菜水果
('SKU008-1', (SELECT id FROM product_spus WHERE spu_code='SPU008'), '500g装', 26.90, 39.00, 150, 43, '{"weight":"500g"}', 1, NOW(), NOW()),
('SKU008-2', (SELECT id FROM product_spus WHERE spu_code='SPU008'), '1kg装', 45.90, 68.00, 150, 44, '{"weight":"1kg"}', 1, NOW(), NOW()),
('SKU009-1', (SELECT id FROM product_spus WHERE spu_code='SPU009'), '500g装', 49.90, 69.00, 100, 78, '{"weight":"500g"}', 1, NOW(), NOW()),
('SKU009-2', (SELECT id FROM product_spus WHERE spu_code='SPU009'), '1kg装', 89.90, 129.00, 100, 78, '{"weight":"1kg"}', 1, NOW(), NOW()),
('SKU010-1', (SELECT id FROM product_spus WHERE spu_code='SPU010'), '1kg装', 12.90, 19.00, 250, 122, '{"weight":"1kg"}', 1, NOW(), NOW()),
('SKU010-2', (SELECT id FROM product_spus WHERE spu_code='SPU010'), '2kg装', 22.90, 34.00, 250, 121, '{"weight":"2kg"}', 1, NOW(), NOW()),
('SKU011-1', (SELECT id FROM product_spus WHERE spu_code='SPU011'), '整个约3kg', 35.00, 49.00, 75, 36, '{"spec":"整个约3kg"}', 1, NOW(), NOW()),
('SKU011-2', (SELECT id FROM product_spus WHERE spu_code='SPU011'), '切块500g', 19.90, 29.00, 75, 36, '{"spec":"切块500g"}', 1, NOW(), NOW()),
('SKU012-1', (SELECT id FROM product_spus WHERE spu_code='SPU012'), '3kg装', 29.90, 45.00, 200, 159, '{"weight":"3kg"}', 1, NOW(), NOW()),
('SKU012-2', (SELECT id FROM product_spus WHERE spu_code='SPU012'), '5kg装', 45.90, 68.00, 200, 159, '{"weight":"5kg"}', 1, NOW(), NOW()),
('SKU013-1', (SELECT id FROM product_spus WHERE spu_code='SPU013'), '5斤装约2.5kg', 9.90, 15.00, 600, 401, '{"weight":"5斤"}', 1, NOW(), NOW()),

-- 肉禽蛋品
('SKU014-1', (SELECT id FROM product_spus WHERE spu_code='SPU014'), '200g牛排x2片', 68.00, 99.00, 60, 27, '{"spec":"200g×2片"}', 1, NOW(), NOW()),
('SKU014-2', (SELECT id FROM product_spus WHERE spu_code='SPU014'), '400g牛排x2片', 118.00, 179.00, 60, 26, '{"spec":"400g×2片"}', 1, NOW(), NOW()),
('SKU015-1', (SELECT id FROM product_spus WHERE spu_code='SPU015'), '500g装', 32.00, 45.00, 100, 64, '{"weight":"500g"}', 1, NOW(), NOW()),
('SKU015-2', (SELECT id FROM product_spus WHERE spu_code='SPU015'), '1kg装', 58.00, 79.00, 100, 64, '{"weight":"1kg"}', 1, NOW(), NOW()),
('SKU016-1', (SELECT id FROM product_spus WHERE spu_code='SPU016'), '整鸡约1.5kg', 45.00, 65.00, 50, 45, '{"spec":"整鸡约1.5kg"}', 1, NOW(), NOW()),
('SKU016-2', (SELECT id FROM product_spus WHERE spu_code='SPU016'), '半鸡约0.8kg', 28.00, 39.00, 50, 44, '{"spec":"半鸡约0.8kg"}', 1, NOW(), NOW()),
('SKU017-1', (SELECT id FROM product_spus WHERE spu_code='SPU017'), '1kg装', 29.90, 45.00, 150, 134, '{"weight":"1kg"}', 1, NOW(), NOW()),
('SKU017-2', (SELECT id FROM product_spus WHERE spu_code='SPU017'), '2kg装', 55.00, 79.00, 150, 133, '{"weight":"2kg"}', 1, NOW(), NOW()),

-- 海鲜水产
('SKU018-1', (SELECT id FROM product_spus WHERE spu_code='SPU018'), '400-500g/只', 138.00, 199.00, 25, 17, '{"weight":"400-500g"}', 1, NOW(), NOW()),
('SKU018-2', (SELECT id FROM product_spus WHERE spu_code='SPU018'), '600-700g/只', 198.00, 279.00, 25, 17, '{"weight":"600-700g"}', 1, NOW(), NOW()),
('SKU019-1', (SELECT id FROM product_spus WHERE spu_code='SPU019'), '200g刺身级', 88.00, 128.00, 40, 31, '{"weight":"200g"}', 1, NOW(), NOW()),
('SKU019-2', (SELECT id FROM product_spus WHERE spu_code='SPU019'), '400g刺身级', 158.00, 228.00, 40, 30, '{"weight":"400g"}', 1, NOW(), NOW()),
('SKU020-1', (SELECT id FROM product_spus WHERE spu_code='SPU020'), '1kg装', 58.00, 85.00, 75, 56, '{"weight":"1kg"}', 1, NOW(), NOW()),
('SKU020-2', (SELECT id FROM product_spus WHERE spu_code='SPU020'), '2kg装', 108.00, 158.00, 75, 56, '{"weight":"2kg"}', 1, NOW(), NOW()),
('SKU021-1', (SELECT id FROM product_spus WHERE spu_code='SPU021'), '500g约8-10个', 39.90, 59.00, 100, 89, '{"weight":"500g"}', 1, NOW(), NOW()),
('SKU021-2', (SELECT id FROM product_spus WHERE spu_code='SPU021'), '1kg约16-20个', 72.00, 99.00, 100, 89, '{"weight":"1kg"}', 1, NOW(), NOW()),
('SKU022-1', (SELECT id FROM product_spus WHERE spu_code='SPU022'), '公4两母3两礼盒4只', 198.00, 299.00, 30, 14, '{"spec":"公4两母3两×4只礼盒"}', 1, NOW(), NOW()),
('SKU022-2', (SELECT id FROM product_spus WHERE spu_code='SPU022'), '公5两母4两礼盒4只', 288.00, 398.00, 30, 14, '{"spec":"公5两母4两×4只礼盒"}', 1, NOW(), NOW()),
('SKU023-1', (SELECT id FROM product_spus WHERE spu_code='SPU023'), '1kg约8-10个', 45.00, 65.00, 90, 72, '{"weight":"1kg"}', 1, NOW(), NOW()),
('SKU023-2', (SELECT id FROM product_spus WHERE spu_code='SPU023'), '2kg约16-20个', 82.00, 118.00, 90, 71, '{"weight":"2kg"}', 1, NOW(), NOW()),

-- 乳制品
('SKU024-1', (SELECT id FROM product_spus WHERE spu_code='SPU024'), '12盒装250ml', 39.90, 59.00, 250, 212, '{"spec":"250ml×12盒"}', 1, NOW(), NOW()),
('SKU024-2', (SELECT id FROM product_spus WHERE spu_code='SPU024'), '24盒装250ml', 72.00, 98.00, 250, 211, '{"spec":"250ml×24盒"}', 1, NOW(), NOW()),
('SKU025-1', (SELECT id FROM product_spus WHERE spu_code='SPU025'), '200g×10瓶装', 49.90, 79.00, 200, 178, '{"spec":"200g×10瓶"}', 1, NOW(), NOW()),
('SKU025-2', (SELECT id FROM product_spus WHERE spu_code='SPU025'), '200g×20瓶装', 92.00, 139.00, 200, 178, '{"spec":"200g×20瓶"}', 1, NOW(), NOW()),
('SKU026-1', (SELECT id FROM product_spus WHERE spu_code='SPU026'), '100g', 29.90, 45.00, 150, 87, '{"weight":"100g"}', 1, NOW(), NOW()),
('SKU027-1', (SELECT id FROM product_spus WHERE spu_code='SPU027'), '10片装', 35.00, 55.00, 100, 67, '{"quantity":"10片"}', 1, NOW(), NOW()),
('SKU027-2', (SELECT id FROM product_spus WHERE spu_code='SPU027'), '20片装', 62.00, 89.00, 100, 67, '{"quantity":"20片"}', 1, NOW(), NOW()),
('SKU028-1', (SELECT id FROM product_spus WHERE spu_code='SPU028'), '400g段1', 268.00, 398.00, 50, 23, '{"weight":"400g","stage":"段1"}', 1, NOW(), NOW()),
('SKU028-2', (SELECT id FROM product_spus WHERE spu_code='SPU028'), '900g段1', 498.00, 698.00, 50, 22, '{"weight":"900g","stage":"段1"}', 1, NOW(), NOW()),

-- 粮油干货
('SKU029-1', (SELECT id FROM product_spus WHERE spu_code='SPU029'), '5kg袋装', 49.90, 75.00, 300, 256, '{"weight":"5kg"}', 1, NOW(), NOW()),
('SKU029-2', (SELECT id FROM product_spus WHERE spu_code='SPU029'), '10kg袋装', 92.00, 129.00, 300, 256, '{"weight":"10kg"}', 1, NOW(), NOW()),
('SKU030-1', (SELECT id FROM product_spus WHERE spu_code='SPU030'), '2.5L桶装', 99.00, 139.00, 150, 134, '{"volume":"2.5L"}', 1, NOW(), NOW()),
('SKU030-2', (SELECT id FROM product_spus WHERE spu_code='SPU030'), '5L桶装', 178.00, 249.00, 150, 133, '{"volume":"5L"}', 1, NOW(), NOW()),
('SKU031-1', (SELECT id FROM product_spus WHERE spu_code='SPU031'), '5kg袋装', 69.90, 99.00, 200, 145, '{"weight":"5kg"}', 1, NOW(), NOW()),
('SKU031-2', (SELECT id FROM product_spus WHERE spu_code='SPU031'), '10kg袋装', 128.00, 179.00, 200, 144, '{"weight":"10kg"}', 1, NOW(), NOW()),
('SKU032-1', (SELECT id FROM product_spus WHERE spu_code='SPU032'), '1kg组合装', 39.90, 59.00, 125, 89, '{"weight":"1kg"}', 1, NOW(), NOW()),
('SKU032-2', (SELECT id FROM product_spus WHERE spu_code='SPU032'), '2kg组合装', 72.00, 99.00, 125, 89, '{"weight":"2kg"}', 1, NOW(), NOW()),
('SKU033-1', (SELECT id FROM product_spus WHERE spu_code='SPU033'), '500ml瓶装', 19.90, 29.00, 200, 156, '{"volume":"500ml"}', 1, NOW(), NOW()),
('SKU033-2', (SELECT id FROM product_spus WHERE spu_code='SPU033'), '1000ml瓶装', 35.00, 49.00, 200, 156, '{"volume":"1000ml"}', 1, NOW(), NOW()),

-- 厨房用品
('SKU034-1', (SELECT id FROM product_spus WHERE spu_code='SPU034'), '28cm炒锅', 129.00, 199.00, 75, 39, '{"size":"28cm"}', 1, NOW(), NOW()),
('SKU034-2', (SELECT id FROM product_spus WHERE spu_code='SPU034'), '32cm炒锅', 159.00, 239.00, 75, 39, '{"size":"32cm"}', 1, NOW(), NOW()),
('SKU035-1', (SELECT id FROM product_spus WHERE spu_code='SPU035'), '20cm刀刃厨师刀', 198.00, 299.00, 80, 34, '{"length":"20cm"}', 1, NOW(), NOW()),
('SKU036-1', (SELECT id FROM product_spus WHERE spu_code='SPU036'), '大号40×30cm', 59.00, 89.00, 100, 73, '{"size":"大号40×30cm"}', 1, NOW(), NOW()),
('SKU036-2', (SELECT id FROM product_spus WHERE spu_code='SPU036'), '小号30×20cm', 39.00, 59.00, 100, 72, '{"size":"小号30×20cm"}', 1, NOW(), NOW()),
('SKU037-1', (SELECT id FROM product_spus WHERE spu_code='SPU037'), '3件套(0.8L+1.4L+2.4L)', 89.00, 139.00, 75, 48, '{"spec":"3件套"}', 1, NOW(), NOW()),
('SKU037-2', (SELECT id FROM product_spus WHERE spu_code='SPU037'), '6件套(多容量)', 148.00, 219.00, 75, 48, '{"spec":"6件套"}', 1, NOW(), NOW()),
('SKU038-1', (SELECT id FROM product_spus WHERE spu_code='SPU038'), '单个锅铲', 45.00, 69.00, 125, 94, '{"spec":"单个锅铲"}', 1, NOW(), NOW()),
('SKU038-2', (SELECT id FROM product_spus WHERE spu_code='SPU038'), '3件套(铲+勺+漏)', 89.00, 129.00, 125, 93, '{"spec":"3件套"}', 1, NOW(), NOW()),

-- 家居清洁
('SKU039-1', (SELECT id FROM product_spus WHERE spu_code='SPU039'), '500ml', 29.90, 45.00, 150, 117, '{"volume":"500ml"}', 1, NOW(), NOW()),
('SKU039-2', (SELECT id FROM product_spus WHERE spu_code='SPU039'), '1000ml', 52.00, 75.00, 150, 117, '{"volume":"1000ml"}', 1, NOW(), NOW()),
('SKU040-1', (SELECT id FROM product_spus WHERE spu_code='SPU040'), '500ml', 24.90, 39.00, 125, 99, '{"volume":"500ml"}', 1, NOW(), NOW()),
('SKU040-2', (SELECT id FROM product_spus WHERE spu_code='SPU040'), '1000ml', 42.00, 59.00, 125, 99, '{"volume":"1000ml"}', 1, NOW(), NOW()),
('SKU041-1', (SELECT id FROM product_spus WHERE spu_code='SPU041'), '500ml', 39.90, 59.00, 150, 134, '{"volume":"500ml"}', 1, NOW(), NOW()),
('SKU041-2', (SELECT id FROM product_spus WHERE spu_code='SPU041'), '1500ml', 89.00, 129.00, 150, 133, '{"volume":"1500ml"}', 1, NOW(), NOW()),

-- 纸品湿巾
('SKU042-1', (SELECT id FROM product_spus WHERE spu_code='SPU042'), '80片×3包', 29.90, 45.00, 200, 156, '{"spec":"80片×3包"}', 1, NOW(), NOW()),
('SKU042-2', (SELECT id FROM product_spus WHERE spu_code='SPU042'), '80片×6包', 52.00, 75.00, 200, 156, '{"spec":"80片×6包"}', 1, NOW(), NOW()),
('SKU043-1', (SELECT id FROM product_spus WHERE spu_code='SPU043'), '4层×36包', 39.90, 59.00, 250, 211, '{"spec":"4层×36包"}', 1, NOW(), NOW()),
('SKU043-2', (SELECT id FROM product_spus WHERE spu_code='SPU043'), '4层×72包', 72.00, 99.00, 250, 210, '{"spec":"4层×72包"}', 1, NOW(), NOW()),

-- 收纳整理
('SKU044-1', (SELECT id FROM product_spus WHERE spu_code='SPU044'), '单个70L', 59.00, 89.00, 100, 67, '{"spec":"单个70L"}', 1, NOW(), NOW()),
('SKU044-2', (SELECT id FROM product_spus WHERE spu_code='SPU044'), '3个装70L', 158.00, 229.00, 100, 67, '{"spec":"3个×70L"}', 1, NOW(), NOW()),
('SKU045-1', (SELECT id FROM product_spus WHERE spu_code='SPU045'), '3层整理柜', 149.00, 219.00, 50, 34, '{"spec":"3层"}', 1, NOW(), NOW()),
('SKU045-2', (SELECT id FROM product_spus WHERE spu_code='SPU045'), '5层整理柜', 199.00, 299.00, 50, 33, '{"spec":"5层"}', 1, NOW(), NOW()),
('SKU046-1', (SELECT id FROM product_spus WHERE spu_code='SPU046'), '6件套', 49.90, 79.00, 150, 112, '{"spec":"6件套"}', 1, NOW(), NOW()),
('SKU046-2', (SELECT id FROM product_spus WHERE spu_code='SPU046'), '10件套', 85.00, 129.00, 150, 111, '{"spec":"10件套"}', 1, NOW(), NOW()),
('SKU047-1', (SELECT id FROM product_spus WHERE spu_code='SPU047'), '6个装', 99.00, 149.00, 100, 78, '{"quantity":"6个"}', 1, NOW(), NOW()),
('SKU047-2', (SELECT id FROM product_spus WHERE spu_code='SPU047'), '12个装', 178.00, 259.00, 100, 78, '{"quantity":"12个"}', 1, NOW(), NOW()),
('SKU048-1', (SELECT id FROM product_spus WHERE spu_code='SPU048'), '单个66×40×15cm', 69.00, 99.00, 75, 45, '{"spec":"66×40×15cm单个"}', 1, NOW(), NOW()),
('SKU048-2', (SELECT id FROM product_spus WHERE spu_code='SPU048'), '2个装', 122.00, 179.00, 75, 44, '{"spec":"2个装"}', 1, NOW(), NOW()),

-- 面部护理
('SKU049-1', (SELECT id FROM product_spus WHERE spu_code='SPU049'), '30ml', 890.00, 1199.00, 30, 12, '{"volume":"30ml"}', 1, NOW(), NOW()),
('SKU049-2', (SELECT id FROM product_spus WHERE spu_code='SPU049'), '50ml', 1350.00, 1799.00, 30, 11, '{"volume":"50ml"}', 1, NOW(), NOW()),
('SKU050-1', (SELECT id FROM product_spus WHERE spu_code='SPU050'), '30ml', 780.00, 1080.00, 30, 14, '{"volume":"30ml"}', 1, NOW(), NOW()),
('SKU050-2', (SELECT id FROM product_spus WHERE spu_code='SPU050'), '50ml', 1180.00, 1580.00, 30, 14, '{"volume":"50ml"}', 1, NOW(), NOW()),
('SKU051-1', (SELECT id FROM product_spus WHERE spu_code='SPU051'), '75ml', 1380.00, 1880.00, 20, 8, '{"volume":"75ml"}', 1, NOW(), NOW()),
('SKU051-2', (SELECT id FROM product_spus WHERE spu_code='SPU051'), '160ml', 2580.00, 3280.00, 20, 7, '{"volume":"160ml"}', 1, NOW(), NOW()),
('SKU052-1', (SELECT id FROM product_spus WHERE spu_code='SPU052'), '30ml', 129.00, 199.00, 100, 89, '{"volume":"30ml"}', 1, NOW(), NOW()),
('SKU052-2', (SELECT id FROM product_spus WHERE spu_code='SPU052'), '50ml', 198.00, 298.00, 100, 89, '{"volume":"50ml"}', 1, NOW(), NOW()),

-- 身体护理
('SKU053-1', (SELECT id FROM product_spus WHERE spu_code='SPU053'), '200ml', 59.90, 89.00, 100, 84, '{"volume":"200ml"}', 1, NOW(), NOW()),
('SKU053-2', (SELECT id FROM product_spus WHERE spu_code='SPU053'), '400ml', 98.00, 139.00, 100, 83, '{"volume":"400ml"}', 1, NOW(), NOW()),
('SKU054-1', (SELECT id FROM product_spus WHERE spu_code='SPU054'), '300ml', 49.90, 79.00, 100, 73, '{"volume":"300ml"}', 1, NOW(), NOW()),
('SKU054-2', (SELECT id FROM product_spus WHERE spu_code='SPU054'), '500ml', 75.00, 109.00, 100, 72, '{"volume":"500ml"}', 1, NOW(), NOW()),
('SKU055-1', (SELECT id FROM product_spus WHERE spu_code='SPU055'), '4块装', 29.90, 45.00, 200, 156, '{"quantity":"4块"}', 1, NOW(), NOW()),
('SKU055-2', (SELECT id FROM product_spus WHERE spu_code='SPU055'), '8块装', 52.00, 75.00, 200, 156, '{"quantity":"8块"}', 1, NOW(), NOW()),
('SKU056-1', (SELECT id FROM product_spus WHERE spu_code='SPU056'), '200ml', 49.90, 79.00, 100, 67, '{"volume":"200ml"}', 1, NOW(), NOW()),
('SKU056-2', (SELECT id FROM product_spus WHERE spu_code='SPU056'), '400ml', 88.00, 129.00, 100, 67, '{"volume":"400ml"}', 1, NOW(), NOW()),
('SKU057-1', (SELECT id FROM product_spus WHERE spu_code='SPU057'), '30ml随身装', 49.90, 79.00, 100, 78, '{"volume":"30ml"}', 1, NOW(), NOW()),
('SKU057-2', (SELECT id FROM product_spus WHERE spu_code='SPU057'), '70ml日常装', 85.00, 125.00, 100, 78, '{"volume":"70ml"}', 1, NOW(), NOW()),

-- 香水彩妆
('SKU058-1', (SELECT id FROM product_spus WHERE spu_code='SPU058'), '30ml', 798.00, 1099.00, 25, 9, '{"volume":"30ml"}', 1, NOW(), NOW()),
('SKU058-2', (SELECT id FROM product_spus WHERE spu_code='SPU058'), '50ml', 1180.00, 1580.00, 25, 8, '{"volume":"50ml"}', 1, NOW(), NOW()),
('SKU059-1', (SELECT id FROM product_spus WHERE spu_code='SPU059'), '单只随机色', 288.00, 389.00, 40, 23, '{"spec":"单只"}', 1, NOW(), NOW()),
('SKU059-2', (SELECT id FROM product_spus WHERE spu_code='SPU059'), '三色套装', 799.00, 999.00, 40, 22, '{"spec":"三色套装"}', 1, NOW(), NOW()),
('SKU060-1', (SELECT id FROM product_spus WHERE spu_code='SPU060'), '深棕色', 79.00, 109.00, 100, 89, '{"color":"深棕色"}', 1, NOW(), NOW()),
('SKU060-2', (SELECT id FROM product_spus WHERE spu_code='SPU060'), '黑色', 79.00, 109.00, 100, 89, '{"color":"黑色"}', 1, NOW(), NOW()),
('SKU061-1', (SELECT id FROM product_spus WHERE spu_code='SPU061'), '单盘', 89.00, 139.00, 100, 84, '{"spec":"单盘"}', 1, NOW(), NOW()),
('SKU061-2', (SELECT id FROM product_spus WHERE spu_code='SPU061'), '双盘套装', 159.00, 239.00, 100, 83, '{"spec":"双盘套装"}', 1, NOW(), NOW()),
('SKU062-1', (SELECT id FROM product_spus WHERE spu_code='SPU062'), '01玫瑰色', 490.00, 699.00, 30, 15, '{"shade":"01玫瑰色"}', 1, NOW(), NOW()),
('SKU062-2', (SELECT id FROM product_spus WHERE spu_code='SPU062'), '02桃粉色', 490.00, 699.00, 30, 14, '{"shade":"02桃粉色"}', 1, NOW(), NOW()),

-- 口腔护理
('SKU063-1', (SELECT id FROM product_spus WHERE spu_code='SPU063'), '单支100g', 39.90, 59.00, 150, 123, '{"weight":"100g","quantity":"单支"}', 1, NOW(), NOW()),
('SKU063-2', (SELECT id FROM product_spus WHERE spu_code='SPU063'), '3支套装100g', 99.00, 149.00, 150, 122, '{"weight":"100g×3","quantity":"3支套装"}', 1, NOW(), NOW()),
('SKU064-1', (SELECT id FROM product_spus WHERE spu_code='SPU064'), '入门款(2种模式)', 199.00, 299.00, 50, 28, '{"spec":"入门款"}', 1, NOW(), NOW()),
('SKU064-2', (SELECT id FROM product_spus WHERE spu_code='SPU064'), '进阶款(3种模式+压力感应)', 299.00, 449.00, 50, 28, '{"spec":"进阶款"}', 1, NOW(), NOW()),
('SKU065-1', (SELECT id FROM product_spus WHERE spu_code='SPU065'), '250ml', 49.90, 79.00, 100, 78, '{"volume":"250ml"}', 1, NOW(), NOW()),
('SKU065-2', (SELECT id FROM product_spus WHERE spu_code='SPU065'), '500ml', 85.00, 119.00, 100, 78, '{"volume":"500ml"}', 1, NOW(), NOW()),
('SKU066-1', (SELECT id FROM product_spus WHERE spu_code='SPU066'), '2支装', 29.90, 45.00, 200, 156, '{"quantity":"2支"}', 1, NOW(), NOW()),
('SKU066-2', (SELECT id FROM product_spus WHERE spu_code='SPU066'), '4支装', 52.00, 75.00, 200, 156, '{"quantity":"4支"}', 1, NOW(), NOW()),

-- 护发洗发
('SKU067-1', (SELECT id FROM product_spus WHERE spu_code='SPU067'), '400ml', 49.90, 79.00, 125, 99, '{"volume":"400ml"}', 1, NOW(), NOW()),
('SKU067-2', (SELECT id FROM product_spus WHERE spu_code='SPU067'), '750ml', 85.00, 125.00, 125, 99, '{"volume":"750ml"}', 1, NOW(), NOW()),
('SKU068-1', (SELECT id FROM product_spus WHERE spu_code='SPU068'), '400ml', 39.90, 59.00, 150, 128, '{"volume":"400ml"}', 1, NOW(), NOW()),
('SKU068-2', (SELECT id FROM product_spus WHERE spu_code='SPU068'), '750ml', 69.00, 99.00, 150, 128, '{"volume":"750ml"}', 1, NOW(), NOW()),
('SKU069-1', (SELECT id FROM product_spus WHERE spu_code='SPU069'), '400ml', 49.90, 75.00, 125, 101, '{"volume":"400ml"}', 1, NOW(), NOW()),
('SKU069-2', (SELECT id FROM product_spus WHERE spu_code='SPU069'), '750ml', 85.00, 129.00, 125, 100, '{"volume":"750ml"}', 1, NOW(), NOW()),
('SKU070-1', (SELECT id FROM product_spus WHERE spu_code='SPU070'), '200ml', 79.00, 119.00, 75, 45, '{"volume":"200ml"}', 1, NOW(), NOW()),
('SKU070-2', (SELECT id FROM product_spus WHERE spu_code='SPU070'), '400ml', 139.00, 199.00, 75, 44, '{"volume":"400ml"}', 1, NOW(), NOW()),
('SKU071-1', (SELECT id FROM product_spus WHERE spu_code='SPU071'), '400ml', 49.90, 75.00, 100, 73, '{"volume":"400ml"}', 1, NOW(), NOW()),
('SKU071-2', (SELECT id FROM product_spus WHERE spu_code='SPU071'), '750ml', 85.00, 125.00, 100, 72, '{"volume":"750ml"}', 1, NOW(), NOW()),

-- 零食小吃
('SKU072-1', (SELECT id FROM product_spus WHERE spu_code='SPU072'), '25g×21袋/月装', 109.00, 159.00, 100, 73, '{"spec":"25g×21袋"}', 1, NOW(), NOW()),
('SKU072-2', (SELECT id FROM product_spus WHERE spu_code='SPU072'), '25g×30袋/月装', 149.00, 219.00, 100, 72, '{"spec":"25g×30袋"}', 1, NOW(), NOW()),
('SKU073-1', (SELECT id FROM product_spus WHERE spu_code='SPU073'), '9包组合', 159.00, 239.00, 75, 56, '{"quantity":"9包"}', 1, NOW(), NOW()),
('SKU073-2', (SELECT id FROM product_spus WHERE spu_code='SPU073'), '16包豪华组合', 268.00, 379.00, 75, 56, '{"quantity":"16包"}', 1, NOW(), NOW()),
('SKU074-1', (SELECT id FROM product_spus WHERE spu_code='SPU074'), '480g大包', 29.90, 45.00, 200, 156, '{"weight":"480g"}', 1, NOW(), NOW()),
('SKU074-2', (SELECT id FROM product_spus WHERE spu_code='SPU074'), '960g超值装', 52.00, 75.00, 200, 156, '{"weight":"960g"}', 1, NOW(), NOW()),
('SKU075-1', (SELECT id FROM product_spus WHERE spu_code='SPU075'), '15包组合', 39.90, 59.00, 150, 134, '{"quantity":"15包"}', 1, NOW(), NOW()),
('SKU075-2', (SELECT id FROM product_spus WHERE spu_code='SPU075'), '30包组合', 72.00, 99.00, 150, 133, '{"quantity":"30包"}', 1, NOW(), NOW()),
('SKU076-1', (SELECT id FROM product_spus WHERE spu_code='SPU076'), '500g', 29.90, 45.00, 200, 164, '{"weight":"500g"}', 1, NOW(), NOW()),
('SKU076-2', (SELECT id FROM product_spus WHERE spu_code='SPU076'), '1000g', 52.00, 75.00, 200, 164, '{"weight":"1000g"}', 1, NOW(), NOW()),
('SKU077-1', (SELECT id FROM product_spus WHERE spu_code='SPU077'), '100g', 49.90, 75.00, 100, 73, '{"weight":"100g"}', 1, NOW(), NOW()),
('SKU077-2', (SELECT id FROM product_spus WHERE spu_code='SPU077'), '200g', 89.00, 129.00, 100, 72, '{"weight":"200g"}', 1, NOW(), NOW()),
('SKU078-1', (SELECT id FROM product_spus WHERE spu_code='SPU078'), '6包组合', 39.90, 59.00, 150, 128, '{"quantity":"6包"}', 1, NOW(), NOW()),
('SKU078-2', (SELECT id FROM product_spus WHERE spu_code='SPU078'), '12包组合', 72.00, 99.00, 150, 128, '{"quantity":"12包"}', 1, NOW(), NOW()),

-- 冲饮茶酒
('SKU079-1', (SELECT id FROM product_spus WHERE spu_code='SPU079'), '500g×1罐', 49.90, 79.00, 150, 117, '{"weight":"500g"}', 1, NOW(), NOW()),
('SKU079-2', (SELECT id FROM product_spus WHERE spu_code='SPU079'), '500g×2罐', 92.00, 139.00, 150, 117, '{"weight":"500g×2罐"}', 1, NOW(), NOW()),
('SKU080-1', (SELECT id FROM product_spus WHERE spu_code='SPU080'), '380ml×24瓶', 29.90, 45.00, 300, 262, '{"spec":"380ml×24瓶"}', 1, NOW(), NOW()),
('SKU080-2', (SELECT id FROM product_spus WHERE spu_code='SPU080'), '550ml×24瓶', 39.90, 59.00, 300, 261, '{"spec":"550ml×24瓶"}', 1, NOW(), NOW()),
('SKU081-1', (SELECT id FROM product_spus WHERE spu_code='SPU081'), '480ml×6瓶', 49.90, 75.00, 200, 178, '{"spec":"480ml×6瓶"}', 1, NOW(), NOW()),
('SKU081-2', (SELECT id FROM product_spus WHERE spu_code='SPU081'), '480ml×12瓶', 92.00, 139.00, 200, 178, '{"spec":"480ml×12瓶"}', 1, NOW(), NOW()),
('SKU082-1', (SELECT id FROM product_spus WHERE spu_code='SPU082'), '357g生茶', 189.00, 299.00, 40, 17, '{"spec":"357g生茶"}', 1, NOW(), NOW()),
('SKU082-2', (SELECT id FROM product_spus WHERE spu_code='SPU082'), '357g熟茶', 189.00, 299.00, 40, 17, '{"spec":"357g熟茶"}', 1, NOW(), NOW()),
('SKU083-1', (SELECT id FROM product_spus WHERE spu_code='SPU083'), '330ml×24罐', 59.90, 89.00, 200, 156, '{"spec":"330ml×24罐"}', 1, NOW(), NOW()),
('SKU083-2', (SELECT id FROM product_spus WHERE spu_code='SPU083'), '500ml×12罐', 59.90, 89.00, 200, 156, '{"spec":"500ml×12罐"}', 1, NOW(), NOW()),
('SKU084-1', (SELECT id FROM product_spus WHERE spu_code='SPU084'), '750ml单瓶', 99.00, 149.00, 100, 62, '{"volume":"750ml","spec":"单瓶"}', 1, NOW(), NOW()),
('SKU084-2', (SELECT id FROM product_spus WHERE spu_code='SPU084'), '750ml礼盒双支', 188.00, 268.00, 100, 61, '{"volume":"750ml×2","spec":"礼盒双支"}', 1, NOW(), NOW()),

-- 方便速食
('SKU085-1', (SELECT id FROM product_spus WHERE spu_code='SPU085'), '5袋装', 29.90, 45.00, 250, 212, '{"quantity":"5袋"}', 1, NOW(), NOW()),
('SKU085-2', (SELECT id FROM product_spus WHERE spu_code='SPU085'), '10袋装', 52.00, 75.00, 250, 211, '{"quantity":"10袋"}', 1, NOW(), NOW()),
('SKU086-1', (SELECT id FROM product_spus WHERE spu_code='SPU086'), '5桶装', 34.90, 55.00, 200, 173, '{"quantity":"5桶"}', 1, NOW(), NOW()),
('SKU086-2', (SELECT id FROM product_spus WHERE spu_code='SPU086'), '12桶装', 78.00, 109.00, 200, 172, '{"quantity":"12桶"}', 1, NOW(), NOW()),
('SKU087-1', (SELECT id FROM product_spus WHERE spu_code='SPU087'), '番茄牛腩口味', 29.90, 45.00, 150, 117, '{"flavor":"番茄牛腩"}', 1, NOW(), NOW()),
('SKU087-2', (SELECT id FROM product_spus WHERE spu_code='SPU087'), '麻辣鲜香口味', 29.90, 45.00, 150, 117, '{"flavor":"麻辣鲜香"}', 1, NOW(), NOW()),
('SKU088-1', (SELECT id FROM product_spus WHERE spu_code='SPU088'), '150g×10包', 49.90, 79.00, 100, 84, '{"spec":"150g×10包"}', 1, NOW(), NOW()),
('SKU088-2', (SELECT id FROM product_spus WHERE spu_code='SPU088'), '150g×20包', 92.00, 139.00, 100, 83, '{"spec":"150g×20包"}', 1, NOW(), NOW()),
('SKU089-1', (SELECT id FROM product_spus WHERE spu_code='SPU089'), '3盒装', 29.90, 45.00, 150, 123, '{"quantity":"3盒"}', 1, NOW(), NOW()),
('SKU089-2', (SELECT id FROM product_spus WHERE spu_code='SPU089'), '6盒装', 52.00, 75.00, 150, 122, '{"quantity":"6盒"}', 1, NOW(), NOW()),

-- 手机配件
('SKU090-1', (SELECT id FROM product_spus WHERE spu_code='SPU090'), '充电头+1m数据线套装', 149.00, 199.00, 150, 89, '{"spec":"充电头+1m数据线"}', 1, NOW(), NOW()),
('SKU091-1', (SELECT id FROM product_spus WHERE spu_code='SPU091'), '65W单口Type-C', 99.00, 149.00, 200, 134, '{"power":"65W","port":"Type-C单口"}', 1, NOW(), NOW()),
('SKU092-1', (SELECT id FROM product_spus WHERE spu_code='SPU092'), '1m单条', 29.90, 49.00, 200, 156, '{"length":"1m","quantity":"单条"}', 1, NOW(), NOW()),
('SKU092-2', (SELECT id FROM product_spus WHERE spu_code='SPU092'), '1m三条装', 79.00, 119.00, 200, 156, '{"length":"1m","quantity":"3条"}', 1, NOW(), NOW()),
('SKU093-1', (SELECT id FROM product_spus WHERE spu_code='SPU093'), '20000mAh 22.5W快充', 169.00, 239.00, 75, 45, '{"capacity":"20000mAh","power":"22.5W"}', 1, NOW(), NOW()),
('SKU093-2', (SELECT id FROM product_spus WHERE spu_code='SPU093'), '30000mAh 22.5W快充', 229.00, 319.00, 75, 44, '{"capacity":"30000mAh","power":"22.5W"}', 1, NOW(), NOW()),
('SKU094-1', (SELECT id FROM product_spus WHERE spu_code='SPU094'), '车载出风口款', 79.00, 119.00, 50, 28, '{"type":"车载出风口款"}', 1, NOW(), NOW()),
('SKU094-2', (SELECT id FROM product_spus WHERE spu_code='SPU094'), '桌面折叠款', 79.00, 119.00, 50, 28, '{"type":"桌面折叠款"}', 1, NOW(), NOW()),

-- 小家电
('SKU095-1', (SELECT id FROM product_spus WHERE spu_code='SPU095'), '单锅版', 169.00, 239.00, 50, 34, '{"spec":"单锅版"}', 1, NOW(), NOW()),
('SKU095-2', (SELECT id FROM product_spus WHERE spu_code='SPU095'), '多锅版(煎蛋+三明治+华夫)', 229.00, 329.00, 50, 33, '{"spec":"多锅版"}', 1, NOW(), NOW()),
('SKU096-1', (SELECT id FROM product_spus WHERE spu_code='SPU096'), '1.7L银色', 129.00, 199.00, 75, 56, '{"volume":"1.7L","color":"银色"}', 1, NOW(), NOW()),
('SKU096-2', (SELECT id FROM product_spus WHERE spu_code='SPU096'), '1.7L白色', 129.00, 199.00, 75, 56, '{"volume":"1.7L","color":"白色"}', 1, NOW(), NOW()),
('SKU097-1', (SELECT id FROM product_spus WHERE spu_code='SPU097'), 'S1100单刀头', 299.00, 449.00, 40, 17, '{"model":"S1100","heads":"1"}', 1, NOW(), NOW()),
('SKU097-2', (SELECT id FROM product_spus WHERE spu_code='SPU097'), 'S3000三刀头', 499.00, 699.00, 40, 17, '{"model":"S3000","heads":"3"}', 1, NOW(), NOW()),
('SKU098-1', (SELECT id FROM product_spus WHERE spu_code='SPU098'), '白色款', 199.00, 299.00, 60, 39, '{"color":"白色"}', 1, NOW(), NOW()),
('SKU098-2', (SELECT id FROM product_spus WHERE spu_code='SPU098'), '粉色款', 199.00, 299.00, 60, 39, '{"color":"粉色"}', 1, NOW(), NOW()),

-- 婴儿食品
('SKU099-1', (SELECT id FROM product_spus WHERE spu_code='SPU099'), '原味225g', 49.90, 79.00, 100, 62, '{"flavor":"原味","weight":"225g"}', 1, NOW(), NOW()),
('SKU099-2', (SELECT id FROM product_spus WHERE spu_code='SPU099'), '蔬菜味225g', 49.90, 79.00, 100, 61, '{"flavor":"蔬菜","weight":"225g"}', 1, NOW(), NOW()),
('SKU100-1', (SELECT id FROM product_spus WHERE spu_code='SPU100'), '苹果味×6支', 59.90, 89.00, 75, 45, '{"flavor":"苹果","quantity":"6支"}', 1, NOW(), NOW()),
('SKU100-2', (SELECT id FROM product_spus WHERE spu_code='SPU100'), '综合果味×6支', 59.90, 89.00, 75, 44, '{"flavor":"综合果","quantity":"6支"}', 1, NOW(), NOW()),
('SKU101-1', (SELECT id FROM product_spus WHERE spu_code='SPU101'), '草莓味28g', 39.90, 59.00, 100, 73, '{"flavor":"草莓","weight":"28g"}', 1, NOW(), NOW()),
('SKU101-2', (SELECT id FROM product_spus WHERE spu_code='SPU101'), '香蕉味28g', 39.90, 59.00, 100, 72, '{"flavor":"香蕉","weight":"28g"}', 1, NOW(), NOW()),
('SKU102-1', (SELECT id FROM product_spus WHERE spu_code='SPU102'), '800g段1(0-12月)', 358.00, 499.00, 40, 17, '{"weight":"800g","stage":"段1"}', 1, NOW(), NOW()),
('SKU102-2', (SELECT id FROM product_spus WHERE spu_code='SPU102'), '1600g段1(0-12月)', 648.00, 889.00, 40, 17, '{"weight":"1600g","stage":"段1"}', 1, NOW(), NOW()),

-- 玩具益智
('SKU103-1', (SELECT id FROM product_spus WHERE spu_code='SPU103'), '经典创意200片', 299.00, 449.00, 40, 17, '{"quantity":"200片"}', 1, NOW(), NOW()),
('SKU103-2', (SELECT id FROM product_spus WHERE spu_code='SPU103'), '经典创意400片', 449.00, 649.00, 40, 17, '{"quantity":"400片"}', 1, NOW(), NOW()),
('SKU104-1', (SELECT id FROM product_spus WHERE spu_code='SPU104'), '4件套摇铃礼盒', 129.00, 189.00, 50, 28, '{"quantity":"4件套"}', 1, NOW(), NOW()),
('SKU104-2', (SELECT id FROM product_spus WHERE spu_code='SPU104'), '8件套豪华礼盒', 199.00, 289.00, 50, 28, '{"quantity":"8件套"}', 1, NOW(), NOW()),
('SKU105-1', (SELECT id FROM product_spus WHERE spu_code='SPU105'), '60片基础版', 149.00, 219.00, 50, 23, '{"quantity":"60片"}', 1, NOW(), NOW()),
('SKU105-2', (SELECT id FROM product_spus WHERE spu_code='SPU105'), '120片豪华版', 229.00, 329.00, 50, 22, '{"quantity":"120片"}', 1, NOW(), NOW());

-- ============================================================
-- 完成验证查询
-- ============================================================
SELECT '=== 数据扩充完成 ===' AS status;
SELECT CONCAT('分类总数: ', COUNT(*)) AS result FROM categories;
SELECT CONCAT('商品总数(status=1): ', COUNT(*)) AS result FROM product_spus WHERE status=1;
SELECT CONCAT('SKU总数: ', COUNT(*)) AS result FROM product_skus WHERE status=1;
