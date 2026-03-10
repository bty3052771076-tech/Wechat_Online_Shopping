/**
 * 商品数据模板文件
 *
 * 使用说明：
 * 1. 复制此文件内容
 * 2. 粘贴到 model/good.js 文件中
 * 3. 修改商品数据为你自己的商品
 * 4. 保存并重新编译
 *
 * 注意事项：
 * - 价格单位是"分"，例如 9900 = 99元
 * - 图片路径需要确保图片文件存在
 * - spuId 必须唯一
 * - SKU列表中的每个SKU也要有唯一的 skuId
 */

// 示例商品数据结构
const sampleGoods = [
  {
    // ========== 基本信息 ==========
    spuId: '1',                                    // 商品SPU ID（必须唯一）
    title: '白色短袖连衣裙荷叶边裙摆',               // 商品标题
    primaryImage: 'https://...',                   // 主图URL
    middleImages: [                                // 商品图片列表
      'https://...',
      'https://...',
      'https://...'
    ],
    smallImages: [                                 // 小图列表
      'https://...',
      'https://...',
      'https://...'
    ],

    // ========== 价格信息 ==========
    minSalePrice: 29800,                          // 最低售价（分），29800 = 298元
    maxSalePrice: 29800,                          // 最高售价（分）
    originalPrice: 39800,                         // 原价（分）

    // ========== 库存信息 ==========
    spuStockQuantity: 100,                        // 总库存数量
    soldNum: 50,                                  // 已售数量

    // ========== 规格信息 ==========
    specList: [                                   // 规格列表
      {
        specId: '1',
        specName: '颜色',                          // 规格名称
        specValues: [                             // 规格值列表
          {
            specValue: '白色',
            specValueId: '1',
            imgUrl: 'https://...'                 // 规格图片（可选）
          },
          {
            specValue: '黑色',
            specValueId: '2'
          }
        ]
      },
      {
        specId: '2',
        specName: '尺码',
        specValues: [
          {
            specValue: 'S',
            specValueId: '3'
          },
          {
            specValue: 'M',
            specValueId: '4'
          },
          {
            specValue: 'L',
            specValueId: '5'
          }
        ]
      }
    ],

    // ========== SKU列表 ==========
    skuList: [                                    // SKU商品列表
      {
        skuId: '1',                               // SKU ID（必须唯一）
        spuId: '1',                              // 所属SPU ID
        skuName: '白色 S',                        // SKU名称
        price: 29800,                            // SKU价格（分）
        originalPrice: 39800,                    // SKU原价（分）
        stockQuantity: 30,                       // SKU库存
        soldNum: 15,                             // SKU已售
        specs: [                                 // SKU规格组合
          {
            specId: '1',
            specValueId: '1'
          },
          {
            specId: '2',
            specValueId: '3'
          }
        ],
        imgUrl: 'https://...'                     // SKU图片
      },
      {
        skuId: '2',
        spuId: '1',
        skuName: '白色 M',
        price: 29800,
        originalPrice: 39800,
        stockQuantity: 40,
        soldNum: 20,
        specs: [
          {
            specId: '1',
            specValueId: '1'
          },
          {
            specId: '2',
            specValueId: '4'
          }
        ],
        imgUrl: 'https://...'
      },
      // ... 更多SKU
    ],

    // ========== 其他信息 ==========
    detail: '这里是商品的详细描述...',             // 商品详情
    brandId: '1',                                 // 品牌ID（可选）
    brandName: '品牌名称',                         // 品牌名称
    categoryId: '1',                              // 分类ID
    categoryName: '女装',                         // 分类名称

    // ========== 标签信息 ==========
    tags: [                                       // 商品标签
      '热销',
      '新品'
    ]
  },

  // ========== 更多商品 ==========
  {
    spuId: '2',
    title: '商品2的标题',
    primaryImage: 'https://...',
    middleImages: ['https://...', 'https://...'],
    smallImages: ['https://...', 'https://...'],
    minSalePrice: 9900,                          // 99元
    maxSalePrice: 9900,
    originalPrice: 19900,                        // 199元
    spuStockQuantity: 50,
    soldNum: 10,
    specList: [
      {
        specId: '3',
        specName: '规格',
        specValues: [
          { specValue: '默认', specValueId: '6' }
        ]
      }
    ],
    skuList: [
      {
        skuId: '10',
        spuId: '2',
        skuName: '默认规格',
        price: 9900,
        originalPrice: 19900,
        stockQuantity: 50,
        soldNum: 10,
        specs: [
          { specId: '3', specValueId: '6' }
        ],
        imgUrl: 'https://...'
      }
    ],
    detail: '商品2的详细描述...',
    categoryId: '2',
    categoryName: '男装',
    tags: ['新品']
  }

  // ... 继续添加更多商品
];

/**
 * 简化版商品模板（单规格商品）
 * 适用于不需要多规格的商品
 */
const simpleProduct = {
  spuId: '100',
  title: '你的商品名称',
  primaryImage: '/assets/images/product.jpg',      // 本地图片路径
  middleImages: ['/assets/images/product.jpg'],
  smallImages: ['/assets/images/product.jpg'],

  // 价格设置：9900 = 99元
  minSalePrice: 9900,
  maxSalePrice: 9900,
  originalPrice: 19900,                            // 原价199元

  // 库存设置
  spuStockQuantity: 100,
  soldNum: 0,

  // 单规格设置
  specList: [
    {
      specId: '100',
      specName: '规格',
      specValues: [
        { specValue: '默认', specValueId: '100' }
      ]
    }
  ],

  // 单SKU设置
  skuList: [
    {
      skuId: '100',
      spuId: '100',
      skuName: '默认',
      price: 9900,                                 // 99元
      originalPrice: 19900,
      stockQuantity: 100,
      soldNum: 0,
      specs: [
        { specId: '100', specValueId: '100' }
      ],
      imgUrl: '/assets/images/product.jpg'
    }
  ],

  detail: '你的商品详细描述...',
  categoryId: '1',
  categoryName: '分类名称',
  tags: ['热销']
};

/**
 * 价格换算参考表
 *
 * 显示价格 | 代码中的价格（分）
 * --------|----------------
 * 1元     | 100
 * 10元    | 1000
 * 99元    | 9900
 * 199元   | 19900
 * 299元   | 29900
 * 399元   | 39900
 * 499元   | 49900
 * 999元   | 99900
 *
 * 计算公式：显示价格 × 100 = 代码中的价格
 */

/**
 * 图片路径说明
 *
 * 本地图片：
 * - 放在项目根目录的 assets 文件夹下
 * - 路径示例：'/assets/images/product.jpg'
 * - 注意：必须以 / 开头
 *
 * 网络图片：
 * - 使用完整的URL
 * - 路径示例：'https://example.com/image.jpg'
 * - 注意：必须使用HTTPS协议（上线时）
 */

module.exports = {
  sampleGoods,
  simpleProduct
};
