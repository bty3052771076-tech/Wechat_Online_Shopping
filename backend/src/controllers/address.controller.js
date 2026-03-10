const { UserAddress } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

class AddressController {
  /**
   * 添加收货地址
   * POST /api/addresses
   */
  async addAddress(req, res, next) {
    try {
      const {
        receiverName,
        receiverPhone,
        provinceCode,
        provinceName,
        cityCode,
        cityName,
        districtCode,
        districtName,
        detailAddress,
        postalCode,
        isDefault
      } = req.body;

      const userId = req.user.user_id;

      // 验证必填字段
      if (!receiverName || !receiverPhone || !provinceCode || !provinceName ||
          !cityCode || !cityName || !districtCode || !districtName || !detailAddress) {
        return errorResponse(res, 400, 'InvalidParam', '收货地址信息不完整');
      }

      // 使用事务处理
      const transaction = await UserAddress.sequelize.transaction();

      try {
        // 如果设置为默认地址，先取消其他默认地址
        if (isDefault === 1) {
          await UserAddress.update(
            { is_default: 0 },
            {
              where: { user_id: userId, is_default: 1 },
              transaction
            }
          );
        }

        // 创建新地址
        const newAddress = await UserAddress.create({
          user_id: userId,
          receiver_name: receiverName,
          receiver_phone: receiverPhone,
          province_code: provinceCode,
          province_name: provinceName,
          city_code: cityCode,
          city_name: cityName,
          district_code: districtCode,
          district_name: districtName,
          detail_address: detailAddress,
          postal_code: postalCode || null,
          is_default: isDefault === 1 ? 1 : 0
        }, { transaction });

        await transaction.commit();

        return successResponse(res, 201, '添加收货地址成功', newAddress);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取地址列表
   * GET /api/addresses
   */
  async getAddressList(req, res, next) {
    try {
      const userId = req.user.user_id;

      // 查询用户的所有地址，按默认地址优先、创建时间倒序排列
      const addresses = await UserAddress.findAll({
        where: { user_id: userId },
        order: [
          ['is_default', 'DESC'],
          ['created_at', 'DESC']
        ]
      });

      return successResponse(res, 200, '获取地址列表成功', addresses);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新地址
   * PUT /api/addresses/:id
   */
  async updateAddress(req, res, next) {
    try {
      const { id } = req.params;
      const {
        receiverName,
        receiverPhone,
        provinceCode,
        provinceName,
        cityCode,
        cityName,
        districtCode,
        districtName,
        detailAddress,
        postalCode,
        isDefault
      } = req.body;

      const userId = req.user.user_id;

      // 验证地址是否存在且属于当前用户
      const address = await UserAddress.findOne({
        where: { id, user_id: userId }
      });

      if (!address) {
        return errorResponse(res, 404, 'AddressNotFound', '地址不存在');
      }

      // 使用事务处理
      const transaction = await UserAddress.sequelize.transaction();

      try {
        // 如果设置为默认地址，先取消其他默认地址
        if (isDefault === 1) {
          await UserAddress.update(
            { is_default: 0 },
            {
              where: {
                user_id: userId,
                is_default: 1,
                id: { [UserAddress.sequelize.Op.ne]: id }
              },
              transaction
            }
          );
        }

        // 更新地址信息
        const updateData = {};
        if (receiverName !== undefined) updateData.receiver_name = receiverName;
        if (receiverPhone !== undefined) updateData.receiver_phone = receiverPhone;
        if (provinceCode !== undefined) updateData.province_code = provinceCode;
        if (provinceName !== undefined) updateData.province_name = provinceName;
        if (cityCode !== undefined) updateData.city_code = cityCode;
        if (cityName !== undefined) updateData.city_name = cityName;
        if (districtCode !== undefined) updateData.district_code = districtCode;
        if (districtName !== undefined) updateData.district_name = districtName;
        if (detailAddress !== undefined) updateData.detail_address = detailAddress;
        if (postalCode !== undefined) updateData.postal_code = postalCode;
        if (isDefault !== undefined) updateData.is_default = isDefault === 1 ? 1 : 0;

        await address.update(updateData, { transaction });

        await transaction.commit();

        // 重新查询更新后的地址
        const updatedAddress = await UserAddress.findByPk(id);

        return successResponse(res, 200, '更新地址成功', updatedAddress);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除地址
   * DELETE /api/addresses/:id
   */
  async deleteAddress(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      // 验证地址是否存在且属于当前用户
      const address = await UserAddress.findOne({
        where: { id, user_id: userId }
      });

      if (!address) {
        return errorResponse(res, 404, 'AddressNotFound', '地址不存在');
      }

      await address.destroy();

      return successResponse(res, 200, '删除地址成功', { addressId: parseInt(id) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 设置默认地址
   * PUT /api/addresses/:id/default
   */
  async setDefaultAddress(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      // 验证地址是否存在且属于当前用户
      const address = await UserAddress.findOne({
        where: { id, user_id: userId }
      });

      if (!address) {
        return errorResponse(res, 404, 'AddressNotFound', '地址不存在');
      }

      // 使用事务处理
      const transaction = await UserAddress.sequelize.transaction();

      try {
        // 取消其他默认地址
        await UserAddress.update(
          { is_default: 0 },
          {
            where: {
              user_id: userId,
              is_default: 1
            },
            transaction
          }
        );

        // 设置当前地址为默认
        await address.update({ is_default: 1 }, { transaction });

        await transaction.commit();

        return successResponse(res, 200, '设置默认地址成功', address);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
