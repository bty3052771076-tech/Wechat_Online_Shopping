const { Op } = require('sequelize');

const ProductSpus = require('../models/ProductSpus');
const ProductSkus = require('../models/ProductSkus');
const Category = require('../models/Category');
const ProductComment = require('../models/ProductComment');
const Order = require('../models/Order');
const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const {
  IMAGE_SCENES,
  normalizeImageUrl,
  normalizeImageList,
  normalizeCommentResources,
  resolveCategoryImage,
} = require('../utils/image');
const {
  buildCommentTemplates,
  filterComments,
  buildSummary,
  paginateComments,
} = require('../services/product-comment-store');

function parseSkuSpecs(value) {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

async function collectDescendantCategoryIds(categoryId) {
  const rootId = Number(categoryId);

  if (!Number.isFinite(rootId)) {
    return [];
  }

  const categories = await Category.findAll({
    where: { status: 1 },
    attributes: ['id', 'parent_id'],
  });

  const childrenMap = categories.reduce((map, category) => {
    const parentId = category.parent_id === null ? null : Number(category.parent_id);

    if (!map[parentId]) {
      map[parentId] = [];
    }

    map[parentId].push(Number(category.id));
    return map;
  }, {});

  const queue = [rootId];
  const collected = new Set();

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (collected.has(currentId)) {
      continue;
    }

    collected.add(currentId);
    const children = childrenMap[currentId] || [];
    children.forEach((childId) => queue.push(childId));
  }

  return Array.from(collected);
}

class ProductController {
  async getList(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 10,
        categoryId,
        keyword,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        tag,
        minPrice,
        maxPrice,
      } = req.query;
      const where = { status: 1 };

      if (categoryId) {
        const categoryIds = await collectDescendantCategoryIds(categoryId);
        where.category_id = categoryIds.length > 0 ? { [Op.in]: categoryIds } : Number(categoryId);
      }

      if (keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${keyword}%` } },
          { subtitle: { [Op.like]: `%${keyword}%` } },
          { brand: { [Op.like]: `%${keyword}%` } },
        ];
      }

      if (tag) {
        where.tags = { [Op.like]: `%${tag}%` };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.min_sale_price = {};

        if (minPrice !== undefined && minPrice !== '') {
          where.min_sale_price[Op.gte] = Number(minPrice) / 100;
        }

        if (maxPrice !== undefined && maxPrice !== '') {
          where.min_sale_price[Op.lte] = Number(maxPrice) / 100;
        }
      }

      const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
      const limit = parseInt(pageSize, 10);
      const allowedSortFields = ['created_at', 'sold_num', 'min_sale_price', 'sort_order'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const order = [[sortField, String(sortOrder).toUpperCase()]];

      const { count, rows } = await ProductSpus.findAndCountAll({
        where,
        limit,
        offset,
        order,
        attributes: [
          'id',
          'spu_code',
          'title',
          'subtitle',
          'category_id',
          'brand',
          'primary_image',
          'min_sale_price',
          'max_line_price',
          'sold_num',
          'tags',
          'status',
        ],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'category_name', 'category_code'],
          },
        ],
      });

      const normalizedRows = rows.map((row) => {
        const item = row.toJSON();

        return {
          ...item,
          primary_image: normalizeImageUrl(item.primary_image, IMAGE_SCENES.product),
        };
      });

      return paginatedResponse(res, 200, '获取成功', normalizedRows, {
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
        total: count,
        totalPages: Math.ceil(count / parseInt(pageSize, 10)),
      });
    } catch (error) {
      next(error);
    }
  }

  async getDetail(req, res, next) {
    try {
      const { id } = req.params;
      const spu = await ProductSpus.findOne({
        where: { id, status: 1 },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'category_name', 'category_code'],
          },
        ],
      });

      if (!spu) {
        return errorResponse(res, 404, 'ProductNotFound', '商品不存在');
      }

      const skus = await ProductSkus.findAll({
        where: { spu_id: id, status: 1 },
        attributes: ['id', 'sku_code', 'sku_name', 'price', 'line_price', 'stock', 'sales', 'specs', 'status'],
        order: [['price', 'ASC']],
      });

      let detailImages = [];
      if (spu.detail_images) {
        try {
          detailImages = JSON.parse(spu.detail_images);
        } catch (error) {
          detailImages = [];
        }
      }

      return successResponse(res, 200, '获取成功', {
        ...spu.toJSON(),
        primary_image: normalizeImageUrl(spu.primary_image, IMAGE_SCENES.product),
        detail_images: normalizeImageList(detailImages, IMAGE_SCENES.product),
        skus: skus.map((sku) => ({
          ...sku.toJSON(),
          specs: parseSkuSpecs(sku.specs),
          image: normalizeImageUrl(sku.image || spu.primary_image, IMAGE_SCENES.product),
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesList(req, res, next) {
    try {
      const categories = await Category.findAll({
        where: { status: 1 },
        attributes: ['id', 'parent_id', 'category_name', 'category_code', 'icon_url', 'sort_order', 'level'],
        order: [
          ['level', 'ASC'],
          ['sort_order', 'ASC'],
        ],
      });

      return successResponse(
        res,
        200,
        '获取成功',
        categories.map((category) => ({
          ...category.toJSON(),
          icon_url: resolveCategoryImage(category.icon_url, category.toJSON()),
        })),
      );
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesTree(req, res, next) {
    try {
      const allCategories = await Category.findAll({
        where: { status: 1 },
        attributes: ['id', 'parent_id', 'category_name', 'category_code', 'icon_url', 'sort_order', 'level'],
        order: [
          ['level', 'ASC'],
          ['sort_order', 'ASC'],
        ],
      });

      const buildTree = (parentId = null) =>
        allCategories
          .filter((category) => category.parent_id === parentId)
          .map((category) => ({
            id: category.id,
            parent_id: category.parent_id,
            category_name: category.category_name,
            category_code: category.category_code,
            icon_url: resolveCategoryImage(category.icon_url, category.toJSON()),
            sort_order: category.sort_order,
            level: category.level,
            children: buildTree(category.id),
          }));

      return successResponse(res, 200, '获取成功', buildTree(null));
    } catch (error) {
      next(error);
    }
  }

  async getCommentsSummary(req, res, next) {
    try {
      const { id } = req.params;
      const spu = await ProductSpus.findByPk(id, {
        attributes: ['id', 'title', 'primary_image', 'status'],
      });

      if (!spu || Number(spu.status) !== 1) {
        return errorResponse(res, 404, 'ProductNotFound', '商品不存在');
      }

      // 优先从数据库读取真实评论汇总
      const dbTotal = await ProductComment.count({ where: { spu_id: id, status: 1 } });
      if (dbTotal > 0) {
        const goodCount = await ProductComment.count({ where: { spu_id: id, status: 1, comment_score: { [Op.gte]: 4 } } });
        const middleCount = await ProductComment.count({ where: { spu_id: id, status: 1, comment_score: 3 } });
        const badCount = await ProductComment.count({ where: { spu_id: id, status: 1, comment_score: { [Op.lte]: 2 } } });
        const hasImageCount = await ProductComment.count({
          where: { spu_id: id, status: 1, comment_resources: { [Op.not]: null } },
        });
        const goodRate = Math.round((goodCount / dbTotal) * 1000) / 10;
        return successResponse(res, 200, '获取成功', {
          commentCount: dbTotal, goodCount, middleCount, badCount, hasImageCount, goodRate, uidCount: 0,
        });
      }

      // 无真实评论时返回空汇总
      return successResponse(res, 200, '获取成功', buildSummary([]));
    } catch (error) {
      next(error);
    }
  }

  async getCommentsList(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 10, commentLevel, hasImage } = req.query;
      const spu = await ProductSpus.findByPk(id, {
        attributes: ['id', 'title', 'primary_image', 'status'],
      });

      if (!spu || Number(spu.status) !== 1) {
        return errorResponse(res, 404, 'ProductNotFound', '商品不存在');
      }

      // 优先从数据库读取真实评论
      const dbWhere = { spu_id: id, status: 1 };
      if (String(hasImage) === 'true' || String(hasImage) === '1') {
        dbWhere.comment_resources = { [Op.not]: null };
      }
      if (commentLevel !== undefined && commentLevel !== '') {
        switch (Number(commentLevel)) {
          case 3: dbWhere.comment_score = { [Op.gte]: 4 }; break;
          case 2: dbWhere.comment_score = 3; break;
          case 1: dbWhere.comment_score = { [Op.lte]: 2 }; break;
          default: break;
        }
      }

      const dbTotal = await ProductComment.count({ where: dbWhere });
      if (dbTotal > 0) {
        const offset = (Number(page) - 1) * Number(pageSize);
        const dbComments = await ProductComment.findAll({
          where: dbWhere,
          order: [['created_at', 'DESC']],
          limit: Number(pageSize),
          offset,
        });

        const list = await Promise.all(dbComments.map(async (c) => {
          let userName = '用户';
          let userHeadUrl = '';
          if (!c.is_anonymous) {
            const user = await User.findByPk(c.user_id, { attributes: ['nickname', 'username', 'avatar_url'] });
            if (user) {
              userName = user.nickname || user.username || '用户';
              userHeadUrl = user.avatar_url || '';
            }
          } else {
            userName = '匿名用户';
          }
          return {
            id: String(c.id),
            spuId: c.spu_id,
            commentContent: c.comment_content || '',
            commentScore: c.comment_score,
            userName,
            userHeadUrl,
            isAnonymity: !!c.is_anonymous,
            commentTime: String(new Date(c.created_at).getTime()),
            commentResources: normalizeCommentResources(c.comment_resources || []),
            goodsDetailInfo: c.sku_spec_info || '',
            isAutoComment: !!c.is_auto_comment,
            sellerReply: c.seller_reply || '',
          };
        }));

        // 全量汇总（不受筛选条件影响）
        const allTotal = await ProductComment.count({ where: { spu_id: id, status: 1 } });
        const goodCount = await ProductComment.count({ where: { spu_id: id, status: 1, comment_score: { [Op.gte]: 4 } } });
        const middleCount = await ProductComment.count({ where: { spu_id: id, status: 1, comment_score: 3 } });
        const badCount = await ProductComment.count({ where: { spu_id: id, status: 1, comment_score: { [Op.lte]: 2 } } });
        const goodRate = allTotal === 0 ? 0 : Math.round((goodCount / allTotal) * 1000) / 10;

        return successResponse(res, 200, '获取成功', {
          list,
          pagination: { page: Number(page), pageSize: Number(pageSize), total: dbTotal },
          summary: { commentCount: allTotal, goodCount, middleCount, badCount, hasImageCount: 0, goodRate, uidCount: 0 },
        });
      }

      // 无真实评论，返回空列表（不再使用 mock 数据）
      return successResponse(res, 200, '获取成功', {
        list: [],
        pagination: { page: Number(page), pageSize: Number(pageSize), total: 0 },
        summary: buildSummary([]),
      });
    } catch (error) {
      next(error);
    }
  }

  async submitComment(req, res, next) {
    try {
      const { id: spuId } = req.params;
      const userId = req.user.user_id;
      const { orderNo, commentScore, commentContent, isAnonymous, skuSpecInfo } = req.body;

      // 验证商品存在
      const spu = await ProductSpus.findByPk(spuId, { attributes: ['id', 'status'] });
      if (!spu) return errorResponse(res, 404, 'ProductNotFound', '商品不存在');

      // 通过 orderNo 查找关联订单
      let orderId = null;
      if (orderNo) {
        const order = await Order.findOne({ where: { order_no: orderNo, user_id: userId }, attributes: ['id'] });
        if (order) { orderId = order.id; }
      }

      await ProductComment.create({
        spu_id: spuId,
        order_id: orderId,
        order_no: orderNo || null,
        user_id: userId,
        sku_spec_info: skuSpecInfo || null,
        comment_score: Number(commentScore) || 5,
        comment_content: commentContent || '',
        is_anonymous: isAnonymous ? 1 : 0,
        status: 1,
      });

      // 评价成功后，将关联订单从 4(待评价) 更新为 5(已完成)
      if (orderId) {
        await Order.update(
          { order_status: 5 },
          { where: { id: orderId, order_status: 4 } },
        );
      }

      return successResponse(res, 201, '评价提交成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
