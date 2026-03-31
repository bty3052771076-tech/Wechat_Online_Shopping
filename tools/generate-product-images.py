"""
generate-product-images.py  v2
统一样式：渐变背景 + 左侧矩形条 + 右上大圆 + 左下中圆 + 右下小实心圆
+ 大字英文名 + 中文副标题
参考样式：assets/images/products/apple.png
"""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = r"E:\AI\cc+glm\Wechat_Online_Shopping\assets\images\products"
SIZE = (640, 640)

# 品类颜色：(渐变顶色, 渐变底色, 强调色)
# 强调色 → 左侧矩形条 + 右下小圆
CATEGORY_COLORS = {
    "fresh_fruit":    ((190,  30,  10), (220,  90,  20), (255, 210,  70)),
    "fresh_meat":     ((155,  20,  20), (200,  60,  30), (255, 155,  95)),
    "fresh_seafood":  (( 15,  60, 155), ( 20, 105, 200), (100, 205, 255)),
    "fresh_dairy":    ((175,  95,  10), (215, 145,  30), (255, 238, 135)),
    "fresh_grain":    ((135,  75,  20), (180, 118,  40), (238, 195,  88)),
    "daily_kitchen":  (( 78,  18, 148), (118,  48, 178), (198, 148, 252)),
    "daily_clean":    (( 10, 108, 128), ( 18, 148, 158), ( 98, 232, 238)),
    "daily_paper":    (( 28,  58, 158), ( 48,  98, 188), (148, 182, 252)),
    "daily_storage":  (( 58,  10, 128), ( 88,  28, 158), (182, 118, 242)),
    "beauty_face":    ((175,  28,  98), (208,  68, 128), (252, 172, 212)),
    "beauty_body":    ((188,  58,  38), (218,  98,  58), (252, 178, 142)),
    "beauty_makeup":  ((148,  10, 118), (188,  38, 148), (252, 142, 228)),
    "beauty_oral":    (( 10,  88, 178), ( 18, 128, 208), (118, 202, 252)),
    "beauty_hair":    (( 48, 128,  18), ( 78, 168,  38), (192, 238,  92)),
    "food_snack":     ((178, 118,  10), (218, 162,  18), (252, 222,  68)),
    "food_drink":     (( 18, 118,  58), ( 28, 158,  78), (118, 232, 152)),
    "food_instant":   ((168,  78,  10), (208, 118,  18), (252, 182,  68)),
    "digital":        (( 28,  48,  72), ( 42,  72, 102), ( 98, 162, 212)),
    "baby":           (( 28, 138,  78), ( 48, 178, 108), (172, 242, 182)),
}


def make_gradient_bg(size, top, bottom):
    """垂直线性渐变背景"""
    w, h = size
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / (h - 1)
        r = int(top[0] + t * (bottom[0] - top[0]))
        g = int(top[1] + t * (bottom[1] - top[1]))
        b = int(top[2] + t * (bottom[2] - top[2]))
        draw.line([(0, y), (w - 1, y)], fill=(r, g, b))
    return img


def load_font(size):
    """加载支持中文的 Windows 系统字体"""
    for path in [
        "C:/Windows/Fonts/msyhbd.ttc",   # 微软雅黑 Bold
        "C:/Windows/Fonts/msyh.ttc",     # 微软雅黑
        "C:/Windows/Fonts/simhei.ttf",   # 黑体
        "C:/Windows/Fonts/simsun.ttc",   # 宋体
    ]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def make_placeholder(name_en, name_cn, cat_key):
    top, bottom, accent = CATEGORY_COLORS.get(
        cat_key, ((55, 55, 78), (88, 88, 118), (178, 178, 218))
    )
    W, H = SIZE

    # ── 1. 渐变背景 ────────────────────────────
    img = make_gradient_bg(SIZE, top, bottom)
    img_rgba = img.convert("RGBA")

    # 半透明圆的颜色：取渐变中间色再提亮 35
    mid = tuple(int((top[i] + bottom[i]) / 2) for i in range(3))
    circ = tuple(min(255, mid[i] + 35) for i in range(3))

    # ── 2. 右上大圆（半透明 40%）──────────────
    layer = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse([332, 12, 628, 308], fill=(*circ, 102))
    img_rgba = Image.alpha_composite(img_rgba, layer)

    # ── 3. 左下中圆（半透明 45%）──────────────
    layer2 = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    ImageDraw.Draw(layer2).ellipse([-5, 382, 215, 602], fill=(*circ, 115))
    img_rgba = Image.alpha_composite(img_rgba, layer2)

    # 转回 RGB，绘制不透明元素
    img = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)

    # ── 4. 左侧矩形条（强调色）────────────────
    draw.rectangle([58, 82, 98, 558], fill=accent)

    # ── 5. 右下小实心圆（强调色）──────────────
    draw.ellipse([467, 467, 555, 555], fill=accent)

    # ── 6. 英文商品名（大写，白色）────────────
    display_en = name_en.upper().replace("-", " ")
    font_size = 68
    font_en = load_font(font_size)
    bbox = draw.textbbox((0, 0), display_en, font=font_en)
    # 自适应缩小：超出右边界则缩小字号
    while bbox[2] - bbox[0] > W - 160 and font_size > 26:
        font_size -= 4
        font_en = load_font(font_size)
        bbox = draw.textbbox((0, 0), display_en, font=font_en)

    draw.text((138, 218), display_en, font=font_en, fill=(255, 255, 255))

    # ── 7. 中文副标题（白色，较小）────────────
    font_sub = load_font(26)
    draw.text((140, 342), name_cn, font=font_sub, fill=(255, 255, 255))

    return img


# ────────────────────────────────────────────────────────────
# 商品列表：(文件名, 中文名, 品类key)
# ────────────────────────────────────────────────────────────
PRODUCTS = [
    # ── 原有 7 款（覆盖旧版）────────────────
    ("apple",              "新疆阿克苏苹果",     "fresh_fruit"),
    ("carrot",             "有机胡萝卜",         "fresh_fruit"),
    ("egg",                "农家散养土鸡蛋",     "fresh_meat"),
    ("detergent",          "立白洗衣液",         "daily_clean"),
    ("tissue",             "维达抽纸",           "daily_paper"),
    ("mask",               "补水保湿面膜",       "beauty_face"),
    ("cleanser",           "氨基酸洗面奶",       "beauty_face"),
    # ── 蔬菜水果 ─────────────────────────────
    ("grape",              "云南红提葡萄",       "fresh_fruit"),
    ("cherry",             "烟台大樱桃",         "fresh_fruit"),
    ("banana",             "海南贵妃香蕉",       "fresh_fruit"),
    ("hami-melon",         "新疆哈密瓜",         "fresh_fruit"),
    ("orange",             "奉节脐橙",           "fresh_fruit"),
    ("cabbage",            "农家新鲜大白菜",     "fresh_fruit"),
    # ── 肉禽蛋品 ─────────────────────────────
    ("beef",               "澳洲M5和牛牛排",     "fresh_meat"),
    ("pork-loin",          "新鲜猪里脊肉",       "fresh_meat"),
    ("chicken",            "农家散养三黄鸡",     "fresh_meat"),
    ("chicken-wing",       "冷冻鸡翅中",         "fresh_meat"),
    # ── 海鲜水产 ─────────────────────────────
    ("lobster",            "波士顿活龙虾",       "fresh_seafood"),
    ("salmon",             "挪威三文鱼刺身",     "fresh_seafood"),
    ("shrimp",             "湛江南美白对虾",     "fresh_seafood"),
    ("scallop",            "大连冷冻扇贝",       "fresh_seafood"),
    ("crab",               "阳澄湖大闸蟹",       "fresh_seafood"),
    ("oyster",             "湛江鲜活生蚝",       "fresh_seafood"),
    # ── 乳制品 ───────────────────────────────
    ("milk",               "蒙牛全脂纯牛奶",     "fresh_dairy"),
    ("yogurt",             "伊利安慕希酸奶",     "fresh_dairy"),
    ("butter",             "总统淡味发酵黄油",   "fresh_dairy"),
    ("cheese",             "安佳芝士奶酪片",     "fresh_dairy"),
    ("formula",            "雅培婴儿配方奶粉",   "fresh_dairy"),
    # ── 粮油干货 ─────────────────────────────
    ("rice",               "金龙鱼长粒香米",     "fresh_grain"),
    ("peanut-oil",         "鲁花5S压榨花生油",   "fresh_grain"),
    ("dongbei-rice",       "五常稻花香大米",     "fresh_grain"),
    ("mixed-grain",        "红豆薏米杂粮",       "fresh_grain"),
    ("vinegar",            "东湖老陈醋",         "fresh_grain"),
    # ── 厨房用品 ─────────────────────────────
    ("wok",                "苏泊尔不粘炒锅",     "daily_kitchen"),
    ("chef-knife",         "双立人厨师刀",       "daily_kitchen"),
    ("cutting-board",      "南竹天然竹制砧板",   "daily_kitchen"),
    ("lunch-box",          "乐扣乐扣保鲜盒",     "daily_kitchen"),
    ("spatula",            "炊大皇锅铲套装",     "daily_kitchen"),
    # ── 家居清洁 ─────────────────────────────
    ("dish-soap",          "花王餐具洗涤剂",     "daily_clean"),
    ("bathroom-cleaner",   "威猛先生浴室清洁剂", "daily_clean"),
    ("disinfectant",       "滴露消毒液",         "daily_clean"),
    # ── 纸品湿巾 ─────────────────────────────
    ("wet-wipe",           "心相印湿巾",         "daily_paper"),
    ("napkin",             "清风原木手帕纸",     "daily_paper"),
    # ── 收纳整理 ─────────────────────────────
    ("storage-box",        "禧天龙特大号收纳箱", "daily_storage"),
    ("drawer-cabinet",     "爱丽思五层整理柜",   "daily_storage"),
    ("vacuum-bag",         "真空压缩收纳袋",     "daily_storage"),
    ("shoe-box",           "透明翻盖鞋盒",       "daily_storage"),
    ("under-bed-box",      "床底超薄扁平收纳箱", "daily_storage"),
    # ── 面部护理 ─────────────────────────────
    ("lancome-serum",      "兰蔻小黑瓶精华",     "beauty_face"),
    ("estee-serum",        "雅诗兰黛小棕瓶精华", "beauty_face"),
    ("skii-serum",         "SK-II神仙水",        "beauty_face"),
    ("proya-serum",        "珀莱雅双抗精华",     "beauty_face"),
    # ── 身体护理 ─────────────────────────────
    ("nivea-lotion",       "妮维雅滋润身体乳",   "beauty_body"),
    ("fancl-shower",       "芳草集玫瑰沐浴露",   "beauty_body"),
    ("safeguard-soap",     "舒肤佳抑菌香皂",     "beauty_body"),
    ("dove-lotion",        "多芬滋养润肤乳",     "beauty_body"),
    ("sunscreen",          "曼秀雷敦防晒乳",     "beauty_body"),
    # ── 香水彩妆 ─────────────────────────────
    ("dior-perfume",       "Dior真我香水",       "beauty_makeup"),
    ("ysl-lipstick",       "YSL圣罗兰唇釉",      "beauty_makeup"),
    ("eyebrow-pencil",     "花西子眉笔",         "beauty_makeup"),
    ("eyeshadow",          "完美日记眼影盘",     "beauty_makeup"),
    ("loose-powder",       "纪梵希四宫格散粉",   "beauty_makeup"),
    # ── 口腔护理 ─────────────────────────────
    ("toothpaste",         "云南白药牙膏",       "beauty_oral"),
    ("electric-toothbrush","欧乐B电动牙刷",      "beauty_oral"),
    ("mouthwash",          "李施德林漱口水",     "beauty_oral"),
    ("toothbrush",         "高露洁护龈牙刷",     "beauty_oral"),
    # ── 护发洗发 ─────────────────────────────
    ("pantene-shampoo",    "潘婷氨基酸洗发水",   "beauty_hair"),
    ("rejoice-shampoo",    "飘柔至臻洗发露",     "beauty_hair"),
    ("head-shoulders",     "海飞丝去屑洗发水",   "beauty_hair"),
    ("hair-mask",          "施华蔻黑鱼子发膜",   "beauty_hair"),
    ("conditioner",        "阿道夫护发素",       "beauty_hair"),
    # ── 零食小吃 ─────────────────────────────
    ("mixed-nuts",         "百草味每日坚果",     "food_snack"),
    ("snack-pack",         "三只松鼠零食大礼包", "food_snack"),
    ("wang-biscuit",       "旺旺雪饼仙贝",       "food_snack"),
    ("spicy-strip",        "卫龙大面筋辣条",     "food_snack"),
    ("sachima",            "徐福记沙琪玛",       "food_snack"),
    ("pork-jerky",         "良品铺子猪肉脯",     "food_snack"),
    ("chips",              "乐事经典原味薯片",   "food_snack"),
    # ── 冲饮茶酒 ─────────────────────────────
    ("nescafe",            "雀巢速溶黑咖啡",     "food_drink"),
    ("mineral-water",      "农夫山泉矿泉水",     "food_drink"),
    ("sparkling-water",    "元气森林气泡水",     "food_drink"),
    ("puerh-tea",          "大益普洱茶",         "food_drink"),
    ("beer",               "青岛纯生啤酒",       "food_drink"),
    ("wine",               "张裕解百纳干红",     "food_drink"),
    # ── 方便速食 ─────────────────────────────
    ("instant-noodle",     "康师傅红烧牛肉面",   "food_instant"),
    ("bucket-noodle",      "统一老坛酸菜桶面",   "food_instant"),
    ("self-heating-hotpot","海底捞自煮小火锅",   "food_instant"),
    ("lotus-root-powder",  "李子柒藕粉羹",       "food_instant"),
    ("self-heating-rice",  "莫小仙自热米饭",     "food_instant"),
    # ── 手机配件 ─────────────────────────────
    ("apple-charger",      "苹果20W快充套装",    "digital"),
    ("huawei-charger",     "华为65W超级快充",    "digital"),
    ("mi-cable",           "小米6A数据线",       "digital"),
    ("power-bank",         "绿联超大容量充电宝", "digital"),
    ("phone-holder",       "TORRAS多功能手机支架","digital"),
    # ── 小家电 ───────────────────────────────
    ("breakfast-machine",  "小熊多功能早餐机",   "digital"),
    ("kettle",             "苏泊尔电热水壶",     "digital"),
    ("shaver",             "飞利浦电动剃须刀",   "digital"),
    ("fan",                "美的节能台式电风扇", "digital"),
    # ── 母婴用品 ─────────────────────────────
    ("baby-rice",          "英雄有机高铁米粉",   "baby"),
    ("baby-puree",         "亨氏金装婴儿果泥",   "baby"),
    ("baby-snack",         "嘉宝有机溶豆",       "baby"),
    ("baby-formula",       "喜宝有机婴儿奶粉",   "baby"),
    ("lego",               "乐高经典创意积木",   "baby"),
    ("baby-rattle",        "费雪婴儿摇铃",       "baby"),
    ("big-blocks",         "哈哈大王儿童积木",   "baby"),
]


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    total = len(PRODUCTS)
    for i, (name_en, name_cn, cat_key) in enumerate(PRODUCTS, 1):
        out_path = os.path.join(OUTPUT_DIR, f"{name_en}.png")
        img = make_placeholder(name_en, name_cn, cat_key)
        img.save(out_path, "PNG")
        print(f"  [{i:3d}/{total}] {name_en}.png")

    print(f"\n完成：共生成 {total} 张图片")
    print(f"输出目录：{OUTPUT_DIR}")


if __name__ == "__main__":
    main()
