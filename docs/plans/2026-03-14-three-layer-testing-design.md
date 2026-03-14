# Three-Layer Comprehensive Testing Design

**Date:** 2026-03-14

**Goal:** Define a comprehensive testing system that combines automated tests, WeChat DevTools MCP verification, and human regression so the current monorepo can be validated against [系统功能需求报告书2026改版.md](/e:/AI/cc+glm/docs/系统功能需求报告书2026改版.md) with traceable evidence and a repeatable defect-fix loop.

## Scope

This design covers the full monorepo:

- Frontend mini program: `Wechat_Online_Shopping/`
- Backend API: `backend/`
- Seed data and SQL: `database/sql/`

It validates both user-side and admin-side features required by the requirement report:

- User registration and login
- Product browsing, category browsing, search, detail pages
- Cart management
- Address management
- Order confirmation, order creation, payment simulation, order queries
- After-sale application and query flows
- Admin login
- Goods management
- Order management
- After-sale management
- User management
- Delivery management

## Why A Three-Layer Strategy

Single-layer testing is not enough for this project:

- Automated tests are fast and stable, but they do not prove that the WeChat page layer really renders and behaves correctly.
- MCP page testing proves real page behavior in WeChat DevTools, but it is slower and more sensitive to environment issues.
- Human regression is still needed for final acceptance, especially for interaction quality and end-to-end sanity after fixes.

The recommended strategy is therefore:

1. **Automated baseline**
   Run frontend and backend automated suites first. This catches adapter, API, and data-contract regressions before touching DevTools.
2. **MCP acceptance**
   Validate real user-side and admin-side pages through WeChat DevTools automation. Collect page path, page data, logs, and screenshots as evidence.
3. **Human regression**
   Use a repeatable checklist to confirm that the product is still usable from a tester’s perspective after automated and MCP verification are green.

## Requirement Traceability Model

Every requirement must map to three verification layers wherever practical.

| Requirement Area | Automated Layer | MCP Layer | Human Regression |
| --- | --- | --- | --- |
| 用户登录与注册 | user auth API + adapter tests | login/register pages submit successfully | tester executes register/login/logout |
| 商品浏览与搜索 | product/category/comment/search tests | home/category/search/detail pages render and switch correctly | tester browses and searches real goods |
| 购物车管理 | cart API + adapter tests | detail add-to-cart, cart list refresh, quantity/edit/delete | tester edits cart and verifies totals |
| 订单查询 | order create/pay/cancel tests | order-confirm, pay-result, order-list, order-detail | tester submits and verifies one order |
| 订单管理与售后 | after-sale API + adapter tests | after-sale apply/list/detail pages | tester submits and checks one after-sale |
| 工作人员登录 | admin auth API tests | admin login page | tester logs into admin dashboard |
| 商品管理 | admin product API + adapter tests | goods list/edit pages | tester views and edits one product |
| 订单管理 | admin order API tests | order list/detail/ship pages | tester checks and ships one order |
| 用户与配送管理 | admin user/delivery API tests | user list/detail, delivery page | tester views users and delivery rules |

If a requirement cannot be proven at one layer, the gap must be documented explicitly rather than assumed away.

## Execution Order

### Phase 0: Environment Gate

The run is valid only if all of the following are true:

- MySQL is reachable and expected seed data exists
- Backend can run on `3000`
- WeChat DevTools can open the project
- DevTools automation port `9420` is listening
- MCP `mp_ensureConnection` succeeds

Environment failures are recorded separately from product defects.

### Phase 1: Automated Baseline

Run the full automated suites first:

- Frontend: `cd Wechat_Online_Shopping && node --test tests/*.test.cjs`
- Backend: `cd backend && node --test`

Baseline output is recorded before MCP work starts.

### Phase 2: MCP User-End Acceptance

Use real pages in WeChat DevTools to verify:

- register/login/logout
- home banners, tabs, recommendations
- category switching and goods rendering
- search results
- goods detail and comments
- add to cart and cart refresh
- address list/add/edit/default
- order confirm, submit, pay-result
- order list/detail
- after-sale apply/list/detail

Evidence for each flow:

- current page path
- relevant page data
- DevTools logs
- screenshot if visual state matters

### Phase 3: MCP Admin-End Acceptance

Use real admin pages to verify:

- login and dashboard
- goods list/edit
- order list/detail/ship
- after-sale list/detail/audit
- user list/detail
- delivery management page

Admin write operations use clearly named test data so they can be identified later.

### Phase 4: Human Regression

After automated and MCP layers pass, execute a human checklist:

- start environment from a clean state
- run user-side full chain from login to after-sale
- run admin-side full chain from login to delivery management
- perform cross-checks, such as admin shipment or audit status reflected back on the user side

## Defect Workflow

No issue is fixed directly from a symptom report.

For every defect:

1. Reproduce it consistently
2. Capture evidence: command output, page data, logs, screenshots
3. Identify the failing layer: seed data, backend API, frontend adapter, WeChat page, or environment
4. Add or update a failing automated regression test first when feasible
5. Implement the smallest root-cause fix
6. Re-run the failing test
7. Re-run the affected layer
8. Re-run the full baseline if the change touches shared logic

## Documentation Outputs

This strategy produces two persistent artifacts:

- A design/specification document describing the testing model
- An execution report recording what was tested, what failed, what was fixed, and what was re-verified

Recommended report path:

- `docs/reports/2026-03-14-three-layer-testing-report.md`

## Success Criteria

The testing effort is considered complete only when:

- The environment gate is stable
- Automated baseline is green
- MCP user-end acceptance is green or all failures are root-caused and fixed
- MCP admin-end acceptance is green or all failures are root-caused and fixed
- Human regression checklist exists and is ready to execute
- Every discovered defect has a corresponding verification result after the fix
