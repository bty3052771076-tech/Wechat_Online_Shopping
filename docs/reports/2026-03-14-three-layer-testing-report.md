# Three-Layer Comprehensive Testing Report

**Date:** 2026-03-14
**Scope:** `Wechat_Online_Shopping/` + `backend/` + `database/sql/`
**Requirement Source:** `docs/系统功能需求报告书2026改版.md`

## 1. Environment Gate

- Backend status: PASS. `localhost:3000` is listening on PID `27804` and `backend/tmp-backend.log` shows successful startup plus database connection.
- Database status: PASS. Frontend and backend automated suites both exercised real database-backed flows successfully.
- WeChat DevTools status: PASS. WeChat DevTools was launched through `D:\微信web开发者工具\cli.bat auto --project E:\AI\cc+glm\Wechat_Online_Shopping --auto-port 9420`.
- MCP connection status: PASS. `mp_ensureConnection` reconnected successfully to `ws://localhost:9420` and reported current page `pages/home/home`.
- Notes: Initial environment gate failed because neither `3000` nor `9420` was listening. This was resolved before MCP acceptance started.

## 2. Automated Baseline

### Frontend

- Command: `cd E:\AI\cc+glm\Wechat_Online_Shopping && node --test tests\*.test.cjs`
- Result: PASS. `64/64` tests passed, `0` failed.
- Notes: Adapter, page-behavior, image normalization, order payload, address form, wx-request coverage, and the new page-contract tests all remained green.

### Backend

- Command: `cd E:\AI\cc+glm\backend && node --test`
- Result: PASS. `27/27` tests passed, `0` failed.
- Notes: Admin APIs, user order flows, after-sale flows, product/category flows, seed-image checks, and integration coverage all remained green.

## 3. MCP User-Side Acceptance

| Requirement | Flow | Evidence | Status | Notes |
| --- | --- | --- | --- | --- |
| User registration and login | Register `mcp_t3_1773500`, then login as `testuser` | `token` written to storage for both flows, current pages reachable, logs `0` | PASS | Login page remained on the root login route after `navigateBack()` from root, but authentication succeeded and is not classified as a product defect. |
| Home, search, and goods detail | ReLaunch home, search `苹果`, open goods detail `spuId=1` | Home banners, tabs, and goods loaded; search result contained apple item; goods detail loaded image, SKU, and comments; logs `0` | PASS | Some `mp_navigate` calls timed out while the page itself still loaded correctly. |
| Cart and order confirm | Add apple SKU from goods detail, switch to cart tab, settle from cart | Cart reflected selected item immediately; order confirm showed default address, goods list, and payable amount | PASS with defect | Page data loaded correctly, but order-confirm emitted component warnings captured as `DEF-001`. |
| Order submit, list, and detail | Submit order from order confirm, open order list and order detail | New order `ORDER17735001386280BFLYK` present with status `待付款`; detail page showed address, goods, and action buttons; logs `0` | PASS | Main order flow is functional under real backend data. |
| After-sale apply and detail | Apply refund for order `ORDER1773499696129OHB3SJ`, then open after-sale detail | New rights record `AS17735002597765SS3` created; detail page showed reason, amount, and receiver info | PASS with defect | After-service detail loaded business data correctly, but emitted null-prop warnings captured as `DEF-002`. |

## 4. MCP Admin-Side Acceptance

| Requirement | Flow | Evidence | Status | Notes |
| --- | --- | --- | --- | --- |
| Admin login and dashboard | Login as `admin / admin123`, open dashboard | `adminInfo` and dashboard menus loaded, logs `0` | PASS | No runtime warnings observed. |
| Goods and order management | Open goods list and order list | Goods list showed seeded products with images; order list contained `ORDER17735001386280BFLYK`; logs `0` | PASS | Timeout from `mp_navigate` did not prevent successful page load. |
| After-sale management | Open after-sale list and detail for `AS17735002597765SS3` | List contained the new after-sale record; detail page loaded correctly when opened with `id`; logs `0` | PASS | Earlier `detail=null` observation was a test-method error caused by using `rightsNo` instead of `id`. |
| User and delivery management | Open user list, user detail for `userId=33`, and delivery manage page | User detail showed the MCP-created account; delivery page loaded all three areas; logs `0` | PASS | Functional, but the environment contains many integration-test accounts. |

## 5. Defects Found

| ID | Symptom | Reproduction | Suspected Layer | Root Cause | Fix | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| DEF-001 | `pages/order/order-confirm/index` emitted `storeId` null warnings and `selectCoupons` data/property overwrite warnings | Cart -> settle -> order confirm | Frontend component contract | `selectCoupons` declared both properties and data fields with the same names, and the parent initialized `currentStoreId` with `null` for a `String` prop | Fixed in `pages/order/components/selectCoupons/selectCoupons.js`, `pages/order/order-confirm/index.js`, and `services/_utils/page-contract-helpers.js` | `tests/page-contract-helpers.test.cjs` passed; MCP re-opened `pages/order/order-confirm/index?type=cart`; logs `0` |
| DEF-002 | `pages/order/after-service-detail/index` emitted `t-icon name=null` and multiple `t-cell note=null` warnings | Apply refund -> submit -> after-service detail | Frontend page/component contract | After-service detail mapped nullable API fields straight into component props without string-safe fallbacks; template also rendered `receiverName` on the phone row | Fixed in `pages/order/after-service-detail/index.js`, `pages/order/after-service-detail/index.wxml`, and `services/_utils/page-contract-helpers.js` | `tests/page-contract-helpers.test.cjs` passed; MCP re-opened `pages/order/after-service-detail/index`; logs `0` |

## 6. Human Regression Checklist Readiness

- Environment start sequence: Ready after final fixes.
- User-side checklist: Ready after final fixes.
- Admin-side checklist: Ready after final fixes.
- Cross-check checklist: Ready after final fixes.

## 7. Final Verification

- Final frontend result: PASS. `64/64` tests passed.
- Final backend result: PASS. `27/27` tests passed.
- Final MCP result: PASS. User-side registration, login, home, search, goods detail, cart, order confirm, order submit, order list/detail, after-sale apply/detail, and admin-side dashboard, goods, orders, users, delivery, and after-sales all loaded successfully. The repaired order-confirm and after-service-detail pages were rechecked with logs `0`.
- Outstanding risks: Development database is polluted by historical automated-test users, addresses, and orders. This does not block functionality, but it makes manual regression evidence harder to read and should be treated as an environment risk.
