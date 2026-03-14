const { Op } = require('sequelize');
const { ProductSpus, ProductSkus, Category, sequelize } = require('../models');
const { IMAGE_SCENES, normalizeImageList, normalizeImageUrl } = require('../utils/image');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

function stringifyJson(value) {
  if (!value) {
    return null;
  }

  return typeof value === 'string' ? value : JSON.stringify(value);
}

function parseMaybeJson(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  }

  return [];
}

function parsePrice(value) {
  return Number(Number(value || 0).toFixed(2));
}

function summarizeSkuMetrics(skus = []) {
  const prices = skus.map((sku) => parsePrice(sku.price)).filter((price) => Number.isFinite(price));
  const linePrices = skus
    .map((sku) => (sku.line_price !== undefined && sku.line_price !== null ? parsePrice(sku.line_price) : null))
    .filter((price) => price !== null);

  return {
    minSalePrice: prices.length ? Math.min(...prices) : 0,
    maxLinePrice: linePrices.length ? Math.max(...linePrices) : null,
    totalStock: skus.reduce((sum, sku) => sum + Number(sku.stock || 0), 0),
  };
}

function normalizeAdminProductPayload(product) {
  const normalized = product && typeof product.toJSON === 'function' ? product.toJSON() : { ...(product || {}) };

  normalized.primary_image = normalizeImageUrl(normalized.primary_image, IMAGE_SCENES.product);
  normalized.detail_images = JSON.stringify(
    normalizeImageList(parseMaybeJson(normalized.detail_images), IMAGE_SCENES.product),
  );

  return normalized;
}

class AdminProductController {
  async getProducts(req, res, next) {
    try {
      const { page = 1, pageSize = 10, keyword, categoryId, status } = req.query;
      const where = {};

      if (keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${keyword}%` } },
          { brand: { [Op.like]: `%${keyword}%` } },
          { spu_code: { [Op.like]: `%${keyword}%` } },
        ];
      }

      if (categoryId) {
        where.category_id = categoryId;
      }

      if (status !== undefined && status !== '') {
        where.status = Number(status);
      }

      const offset = (Number(page) - 1) * Number(pageSize);
      const { count, rows } = await ProductSpus.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'category_name', 'category_code'],
          },
          {
            model: ProductSkus,
            as: 'skus',
            attributes: ['id', 'sku_name', 'price', 'line_price', 'stock', 'specs', 'status'],
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
        limit: Number(pageSize),
        offset,
        distinct: true,
      });

      return paginatedResponse(res, 200, '获取成功', rows.map((row) => normalizeAdminProductPayload(row)), {
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(count / Number(pageSize)),
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductDetail(req, res, next) {
    try {
      const product = await ProductSpus.findByPk(req.params.id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'category_name', 'category_code'],
          },
          {
            model: ProductSkus,
            as: 'skus',
            attributes: ['id', 'sku_name', 'price', 'line_price', 'stock', 'specs', 'status'],
            required: false,
          },
        ],
      });

      if (!product) {
        return errorResponse(res, 404, 'ProductNotFound', '商品不存在');
      }

      return successResponse(res, 200, '获取成功', normalizeAdminProductPayload(product));
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const {
        title,
        subtitle,
        categoryId,
        brand,
        primaryImage,
        detailImages,
        productDetail,
        skus,
        tags,
        status = 1,
      } = req.body;

      if (!title || !categoryId || !primaryImage) {
        await transaction.rollback();
        return errorResponse(res, 400, 'InvalidParam', '商品标题、分类和主图为必填项');
      }

      if (!Array.isArray(skus) || skus.length === 0) {
        await transaction.rollback();
        return errorResponse(res, 400, 'InvalidParam', '至少需要一个SKU');
      }

      const category = await Category.findByPk(categoryId, { transaction });
      if (!category) {
        await transaction.rollback();
        return errorResponse(res, 400, 'InvalidParam', '分类不存在');
      }

      const normalizedSkus = skus.map((sku) => ({
        sku_name: sku.sku_name || title,
        price: parsePrice(sku.price),
        line_price: sku.line_price !== undefined && sku.line_price !== null ? parsePrice(sku.line_price) : null,
        stock: Number(sku.stock || 0),
        specs: stringifyJson(sku.specs),
      }));
      const summary = summarizeSkuMetrics(normalizedSkus);

      const spu = await ProductSpus.create(
        {
          spu_code: `SPU${Date.now()}`,
          title,
          subtitle: subtitle || null,
          category_id: categoryId,
          brand: brand || null,
          primary_image: primaryImage,
          detail_images: stringifyJson(detailImages || []),
          product_detail: typeof productDetail === 'string' ? productDetail : stringifyJson(productDetail),
          min_sale_price: summary.minSalePrice,
          max_line_price: summary.maxLinePrice,
          total_stock: summary.totalStock,
          tags: Array.isArray(tags) ? tags.join(',') : tags || null,
          status: Number(status),
        },
        { transaction },
      );

      await ProductSkus.bulkCreate(
        normalizedSkus.map((sku) => ({
          sku_code: `SKU${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
          spu_id: spu.id,
          sku_name: sku.sku_name,
          price: sku.price,
          line_price: sku.line_price,
          stock: sku.stock,
          specs: sku.specs,
          status: 1,
        })),
        { transaction },
      );

      await transaction.commit();
      return successResponse(res, 201, '商品添加成功', { id: spu.id });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const product = await ProductSpus.findByPk(req.params.id, {
        include: [
          {
            model: ProductSkus,
            as: 'skus',
            required: false,
          },
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        await transaction.rollback();
        return errorResponse(res, 404, 'ProductNotFound', '商品不存在');
      }

      const {
        title,
        subtitle,
        categoryId,
        brand,
        primaryImage,
        detailImages,
        productDetail,
        tags,
        status,
        skus,
      } = req.body;

      if (categoryId && Number(categoryId) !== Number(product.category_id)) {
        const category = await Category.findByPk(categoryId, { transaction });
        if (!category) {
          await transaction.rollback();
          return errorResponse(res, 400, 'InvalidParam', '分类不存在');
        }
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (subtitle !== undefined) updateData.subtitle = subtitle;
      if (categoryId !== undefined) updateData.category_id = categoryId;
      if (brand !== undefined) updateData.brand = brand;
      if (primaryImage !== undefined) updateData.primary_image = primaryImage;
      if (detailImages !== undefined) updateData.detail_images = stringifyJson(detailImages || []);
      if (productDetail !== undefined) {
        updateData.product_detail = typeof productDetail === 'string' ? productDetail : stringifyJson(productDetail);
      }
      if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags.join(',') : tags;
      if (status !== undefined) updateData.status = Number(status);

      if (Array.isArray(skus) && skus.length > 0) {
        const normalizedSkus = skus.map((sku) => ({
          sku_name: sku.sku_name || product.title,
          price: parsePrice(sku.price),
          line_price: sku.line_price !== undefined && sku.line_price !== null ? parsePrice(sku.line_price) : null,
          stock: Number(sku.stock || 0),
          specs: stringifyJson(sku.specs),
        }));
        const firstExistingSku = Array.isArray(product.skus) && product.skus.length > 0 ? product.skus[0] : null;

        if (firstExistingSku) {
          await firstExistingSku.update(
            {
              sku_name: normalizedSkus[0].sku_name,
              price: normalizedSkus[0].price,
              line_price: normalizedSkus[0].line_price,
              stock: normalizedSkus[0].stock,
              specs: normalizedSkus[0].specs,
            },
            { transaction },
          );
        } else {
          await ProductSkus.create(
            {
              sku_code: `SKU${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
              spu_id: product.id,
              sku_name: normalizedSkus[0].sku_name,
              price: normalizedSkus[0].price,
              line_price: normalizedSkus[0].line_price,
              stock: normalizedSkus[0].stock,
              specs: normalizedSkus[0].specs,
              status: 1,
            },
            { transaction },
          );
        }

        const refreshedSkus = await ProductSkus.findAll({
          where: { spu_id: product.id, status: 1 },
          transaction,
        });
        const summary = summarizeSkuMetrics(refreshedSkus.map((sku) => sku.toJSON()));
        updateData.min_sale_price = summary.minSalePrice;
        updateData.max_line_price = summary.maxLinePrice;
        updateData.total_stock = summary.totalStock;
      }

      await product.update(updateData, { transaction });
      await transaction.commit();

      return successResponse(res, 200, '商品更新成功');
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const product = await ProductSpus.findByPk(req.params.id);

      if (!product) {
        return errorResponse(res, 404, 'ProductNotFound', '商品不存在');
      }

      await product.update({ status: 0 });
      return successResponse(res, 200, '商品删除成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminProductController();
