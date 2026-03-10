const { Op } = require('sequelize');

const ProductSpus = require('../models/ProductSpus');
const ProductSkus = require('../models/ProductSkus');
const Category = require('../models/Category');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { normalizeImageUrl, normalizeImageList, normalizeCommentResources } = require('../utils/image');
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
          primary_image: normalizeImageUrl(item.primary_image),
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
        primary_image: normalizeImageUrl(spu.primary_image),
        detail_images: normalizeImageList(detailImages),
        skus: skus.map((sku) => ({
          ...sku.toJSON(),
          specs: parseSkuSpecs(sku.specs),
          image: normalizeImageUrl(sku.image || spu.primary_image),
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
          icon_url: normalizeImageUrl(category.icon_url),
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
            icon_url: normalizeImageUrl(category.icon_url),
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

      return successResponse(res, 200, '获取成功', buildSummary(buildCommentTemplates(spu.toJSON())));
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

      const allComments = buildCommentTemplates(spu.toJSON());
      const comments = filterComments(allComments, {
        commentLevel,
        hasImage,
      });
      const paged = paginateComments(comments, page, pageSize);

      return successResponse(res, 200, '获取成功', {
        list: paged.list.map((item) => ({
          ...item,
          commentResources: normalizeCommentResources(item.commentResources),
        })),
        pagination: paged.pagination,
        summary: buildSummary(allComments),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
