#!/usr/bin/env node

/**
 * Seed script for coupon-category bindings (#21)
 * Usage: node scripts/seed-coupon-categories.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Coupon, CouponCategory, Category, sequelize } = require('../src/models');

async function seedCouponCategories() {
  const transaction = await sequelize.transaction();

  try {
    console.log('Starting coupon-category seed...');

    // Ensure coupon id=1 exists
    let coupon1 = await Coupon.findByPk(1, { transaction });
    if (!coupon1) {
      console.log('Creating coupon id=1...');
      coupon1 = await Coupon.create(
        {
          id: 1,
          coupon_name: '新人满50减10',
          coupon_type: 1,
          discount_value: 10.0,
          min_amount: 50.0,
          max_discount: 10.0,
          total_quantity: 1000,
          received_quantity: 0,
          used_quantity: 0,
          valid_days: 30,
          start_time: new Date(),
          end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 1,
        },
        { transaction },
      );
    }

    // Create coupon id=2 if not exists
    let coupon2 = await Coupon.findByPk(2, { transaction });
    if (!coupon2) {
      console.log('Creating coupon id=2...');
      coupon2 = await Coupon.create(
        {
          id: 2,
          coupon_name: '满100减20',
          coupon_type: 1,
          discount_value: 20.0,
          min_amount: 100.0,
          max_discount: 20.0,
          total_quantity: 500,
          received_quantity: 0,
          used_quantity: 0,
          valid_days: 30,
          start_time: new Date(),
          end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 1,
        },
        { transaction },
      );
    }

    // Create coupon id=3 if not exists
    let coupon3 = await Coupon.findByPk(3, { transaction });
    if (!coupon3) {
      console.log('Creating coupon id=3...');
      coupon3 = await Coupon.create(
        {
          id: 3,
          coupon_name: '9折优惠券',
          coupon_type: 2,
          discount_value: 0.9,
          min_amount: 50.0,
          max_discount: null,
          total_quantity: 1000,
          received_quantity: 0,
          used_quantity: 0,
          valid_days: 60,
          start_time: new Date(),
          end_time: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: 1,
        },
        { transaction },
      );
    }

    // Bind coupon id=1 to categories: 1, 4, 5, 6, 18
    const coupon1Categories = [1, 4, 5, 6, 18];
    for (const catId of coupon1Categories) {
      const existing = await CouponCategory.findOne(
        { where: { coupon_id: 1, category_id: catId } },
        { transaction },
      );
      if (!existing) {
        console.log(`Binding coupon 1 to category ${catId}...`);
        await CouponCategory.create(
          { coupon_id: 1, category_id: catId },
          { transaction },
        );
      }
    }

    // Bind coupon id=2 to categories: 7, 8, 9
    const coupon2Categories = [7, 8, 9];
    for (const catId of coupon2Categories) {
      const existing = await CouponCategory.findOne(
        { where: { coupon_id: 2, category_id: catId } },
        { transaction },
      );
      if (!existing) {
        console.log(`Binding coupon 2 to category ${catId}...`);
        await CouponCategory.create(
          { coupon_id: 2, category_id: catId },
          { transaction },
        );
      }
    }

    // Bind coupon id=3 to categories: 10, 11, 12
    const coupon3Categories = [10, 11, 12];
    for (const catId of coupon3Categories) {
      const existing = await CouponCategory.findOne(
        { where: { coupon_id: 3, category_id: catId } },
        { transaction },
      );
      if (!existing) {
        console.log(`Binding coupon 3 to category ${catId}...`);
        await CouponCategory.create(
          { coupon_id: 3, category_id: catId },
          { transaction },
        );
      }
    }

    await transaction.commit();

    // Verify
    const result = await Coupon.findAll({
      attributes: ['id', 'coupon_name'],
      include: [
        {
          model: CouponCategory,
          as: 'coupon_categories',
          attributes: ['category_id'],
        },
      ],
      where: { id: [1, 2, 3] },
    });

    console.log('\n✅ Seed completed! Current state:');
    for (const coupon of result) {
      const catIds = coupon.coupon_categories.map((c) => c.category_id).join(', ');
      console.log(`  Coupon ${coupon.id} (${coupon.coupon_name}) → Categories: [${catIds}]`);
    }

    process.exit(0);
  } catch (error) {
    // Only rollback if transaction is still active
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedCouponCategories();
