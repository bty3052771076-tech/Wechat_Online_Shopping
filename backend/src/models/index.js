const sequelize = require('../config/database');

// 导入所有模型
const Admin = require('./Admin');
const Category = require('./Category');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const OrderStatusLog = require('./OrderStatusLog');
const ProductImages = require('./ProductImages');
const ProductSkus = require('./ProductSkus');
const ProductSpecs = require('./ProductSpecs');
const ProductSpecValues = require('./ProductSpecValues');
const ProductSpus = require('./ProductSpus');
const ProductSpuTags = require('./ProductSpuTags');
const ShoppingCart = require('./ShoppingCart');
const User = require('./User');
const UserAddress = require('./UserAddress');
const ChatSession = require('./ChatSession');
const ChatMessage = require('./ChatMessage');
const ProductComment = require('./ProductComment');
const AfterSale = require('./AfterSale');
const AfterSaleLog = require('./AfterSaleLog');
const DeliveryArea = require('./DeliveryArea');
const DeliveryFee = require('./DeliveryFee');
const Banner = require('./Banner');
const Coupon = require('./Coupon');
const UserCoupon = require('./UserCoupon');
const SystemConfig = require('./SystemConfig');
const ProductStockLog = require('./ProductStockLog');
const ProductBrowseHistory = require('./ProductBrowseHistory');
const Favorite = require('./Favorite');
const Promotion = require('./Promotion');

// 建立模型关联关系

// Category 自关联（父子分类）
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

// ProductSpus 和 Category 的关联
ProductSpus.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(ProductSpus, { foreignKey: 'category_id', as: 'products' });

// ProductSpus 和 ProductSkus 的关联
ProductSpus.hasMany(ProductSkus, { foreignKey: 'spu_id', as: 'skus' });
ProductSkus.belongsTo(ProductSpus, { foreignKey: 'spu_id', as: 'spu' });

// ProductSpus 和 ProductImages 的关联
ProductSpus.hasMany(ProductImages, { foreignKey: 'spu_id', as: 'images' });
ProductImages.belongsTo(ProductSpus, { foreignKey: 'spu_id', as: 'spu' });

// ProductSpus 和 ProductSpuTags 的关联（使用spuTags避免与tags字段冲突）
ProductSpus.hasMany(ProductSpuTags, { foreignKey: 'spu_id', as: 'spuTags' });
ProductSpuTags.belongsTo(ProductSpus, { foreignKey: 'spu_id', as: 'spu' });

// Order 和 User 的关联
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

// Order 和 OrderItem 的关联
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Order 和 OrderStatusLog 的关联
Order.hasMany(OrderStatusLog, { foreignKey: 'order_id', as: 'statusLogs' });
OrderStatusLog.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// OrderItem 和 ProductSkus 的关联
OrderItem.belongsTo(ProductSkus, { foreignKey: 'sku_id', as: 'sku' });

// ShoppingCart 和 User 的关联
ShoppingCart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ShoppingCart, { foreignKey: 'user_id', as: 'cartItems' });

// ShoppingCart 和 ProductSkus 的关联
ShoppingCart.belongsTo(ProductSkus, { foreignKey: 'sku_id', as: 'sku' });

// UserAddress 和 User 的关联
UserAddress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(UserAddress, { foreignKey: 'user_id', as: 'addresses' });

// ChatSession 和 User 的关联
ChatSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ChatSession, { foreignKey: 'user_id', as: 'chatSessions' });

// ChatMessage 和 ChatSession 的关联
ChatMessage.belongsTo(ChatSession, { foreignKey: 'session_id', as: 'session' });
ChatSession.hasMany(ChatMessage, { foreignKey: 'session_id', as: 'messages' });

// DeliveryArea 和 DeliveryFee 的关联
DeliveryArea.hasMany(DeliveryFee, { foreignKey: 'area_id', as: 'fees' });
DeliveryFee.belongsTo(DeliveryArea, { foreignKey: 'area_id', as: 'area' });

// Favorite 和 User/ProductSpus 的关联
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(ProductSpus, { foreignKey: 'spu_id', as: 'spu' });
ProductSpus.hasMany(Favorite, { foreignKey: 'spu_id', as: 'favorites' });

// ProductStockLog 和 ProductSkus 的关联
ProductStockLog.belongsTo(ProductSkus, { foreignKey: 'sku_id', as: 'sku' });
ProductSkus.hasMany(ProductStockLog, { foreignKey: 'sku_id', as: 'stockLogs' });

// ProductBrowseHistory 和 User/ProductSpus 的关联
ProductBrowseHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ProductBrowseHistory, { foreignKey: 'user_id', as: 'browseHistory' });
ProductBrowseHistory.belongsTo(ProductSpus, { foreignKey: 'spu_id', as: 'spu' });
ProductSpus.hasMany(ProductBrowseHistory, { foreignKey: 'spu_id', as: 'browseHistories' });

// Coupon 和 UserCoupon 的关联
Coupon.hasMany(UserCoupon, { foreignKey: 'coupon_id', as: 'userCoupons' });
UserCoupon.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

// AfterSale 和 AfterSaleLog 的关联
AfterSale.hasMany(AfterSaleLog, { foreignKey: 'after_sale_id', as: 'logs' });
AfterSaleLog.belongsTo(AfterSale, { foreignKey: 'after_sale_id', as: 'afterSale' });

module.exports = {
  Admin,
  AfterSale,
  Banner,
  Coupon,
  UserCoupon,
  SystemConfig,
  ProductStockLog,
  ProductBrowseHistory,
  Favorite,
  Promotion,
  AfterSaleLog,
  DeliveryArea,
  DeliveryFee,
  Category,
  ChatMessage,
  ChatSession,
  Order,
  OrderItem,
  OrderStatusLog,
  ProductImages,
  ProductSkus,
  ProductSpecs,
  ProductSpecValues,
  ProductComment,
  ProductSpus,
  ProductSpuTags,
  ShoppingCart,
  User,
  UserAddress,
  sequelize
};
