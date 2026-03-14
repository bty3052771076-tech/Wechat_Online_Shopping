# Three-Layer Comprehensive Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Execute a requirement-traceable testing program that combines automated tests, WeChat DevTools MCP verification, and human regression, while fixing any defects discovered during the run.

**Architecture:** The work is split into five passes: build the traceability documents, verify the automated baseline, run MCP user-side acceptance, run MCP admin-side acceptance, then repair defects with TDD and re-verify. The same evidence model is used at every stage so failures can be triaged by layer instead of guessed at.

**Tech Stack:** Node.js `node:test`, Express, MySQL, WeChat Mini Program, WeChat DevTools MCP, PowerShell, Markdown documentation

---

### Task 1: Create the requirement-traceable testing documents

**Files:**
- Create: `docs/plans/2026-03-14-three-layer-testing-design.md`
- Create: `docs/plans/2026-03-14-three-layer-testing-implementation.md`
- Create: `docs/reports/2026-03-14-three-layer-testing-report.md`
- Reference: `docs/系统功能需求报告书2026改版.md`

**Step 1: Write the document skeleton**

Create the report file with sections for:

- environment gate
- automated baseline
- MCP user flows
- MCP admin flows
- defects found
- fixes applied
- final verification

**Step 2: Run a minimal file check**

Run:

```powershell
Get-ChildItem docs\plans\2026-03-14-three-layer-testing-*.md
Get-ChildItem docs\reports\2026-03-14-three-layer-testing-report.md
```

Expected:
- all three files exist

**Step 3: Write the final document structure**

Make sure the report can be filled incrementally during execution instead of rewritten at the end.

**Step 4: Verify the files are readable**

Run:

```powershell
Get-Content -Encoding UTF8 docs\plans\2026-03-14-three-layer-testing-design.md | Select-Object -First 40
Get-Content -Encoding UTF8 docs\plans\2026-03-14-three-layer-testing-implementation.md | Select-Object -First 40
```

Expected:
- content renders correctly and includes the required sections

**Step 5: Commit**

```powershell
git add docs/plans/2026-03-14-three-layer-testing-design.md docs/plans/2026-03-14-three-layer-testing-implementation.md docs/reports/2026-03-14-three-layer-testing-report.md
git commit -m "docs: add three-layer testing specification"
```

### Task 2: Establish and record the automated baseline

**Files:**
- Modify: `docs/reports/2026-03-14-three-layer-testing-report.md`
- Test: `Wechat_Online_Shopping/tests/*.test.cjs`
- Test: `backend/tests/*.test.js`

**Step 1: Run the frontend suite**

Run:

```powershell
cd E:\AI\cc+glm\Wechat_Online_Shopping
node --test tests\*.test.cjs
```

Expected:
- pass/fail counts are recorded in the report

**Step 2: Run the backend suite**

Run:

```powershell
cd E:\AI\cc+glm\backend
node --test
```

Expected:
- pass/fail counts are recorded in the report

**Step 3: If any test fails, stop and create a defect entry**

For each failure:

- copy the exact command
- record the failing test name
- record the error output
- identify whether it is seed data, backend API, frontend adapter, or environment

**Step 4: Update the report**

Add:

- exact commands
- exit status
- counts
- first failing test if any

**Step 5: Commit**

```powershell
git add docs/reports/2026-03-14-three-layer-testing-report.md
git commit -m "test: record automated baseline results"
```

### Task 3: Run MCP user-side acceptance against the requirement matrix

**Files:**
- Modify: `docs/reports/2026-03-14-three-layer-testing-report.md`
- Reference: `Wechat_Online_Shopping/app.json`
- Reference: `pages/user/*`, `pages/goods/*`, `pages/order/*`, `pages/home/home`, `pages/category/index`, `pages/cart/index`, `pages/usercenter/index`

**Step 1: Verify MCP environment gate**

Check:

- backend `3000` is listening
- DevTools `9420` is listening
- `mp_ensureConnection` succeeds

Expected:
- the report records the live environment state

**Step 2: Execute user-side MCP flows**

Cover:

- register
- login
- home
- category
- search
- goods detail
- add to cart
- cart refresh and edit
- address list/edit
- order confirm and submit
- pay result
- order list/detail
- after-sale apply/list/detail

For each flow, capture:

- current page path
- key page data
- logs
- screenshot when visual evidence matters

**Step 3: Record failures immediately**

For every failure, log:

- reproduction steps
- page path
- current page data snapshot
- logs
- suspected layer

**Step 4: Update the report**

Add a table row per user-side requirement with status:

- pass
- fail
- blocked by environment

**Step 5: Commit**

```powershell
git add docs/reports/2026-03-14-three-layer-testing-report.md
git commit -m "test: record MCP user-side acceptance results"
```

### Task 4: Run MCP admin-side acceptance against the requirement matrix

**Files:**
- Modify: `docs/reports/2026-03-14-three-layer-testing-report.md`
- Reference: `pages/admin/login/index`
- Reference: `pages/admin/dashboard/index`
- Reference: `pages/admin/goods-manage/*`
- Reference: `pages/admin/order-manage/*`
- Reference: `pages/admin/after-sale-manage/*`
- Reference: `pages/admin/user-manage/*`
- Reference: `pages/admin/delivery-manage/index`

**Step 1: Execute admin-side MCP flows**

Cover:

- admin login
- dashboard
- goods list/detail/edit
- order list/detail/ship
- after-sale list/detail/audit
- user list/detail
- delivery management

**Step 2: Capture evidence**

For each flow, preserve:

- page path
- key page data
- logs
- screenshot if rendering is relevant

**Step 3: Record failures immediately**

Do not fix anything before:

- reproducing the issue
- identifying the failing layer
- writing the defect entry in the report

**Step 4: Update the report**

Add a table row per admin-side requirement with status and evidence summary.

**Step 5: Commit**

```powershell
git add docs/reports/2026-03-14-three-layer-testing-report.md
git commit -m "test: record MCP admin-side acceptance results"
```

### Task 5: Repair defects using debugging plus TDD

**Files:**
- Modify: defect-specific source files discovered during Tasks 2-4
- Modify/Create: defect-specific frontend or backend tests
- Modify: `docs/reports/2026-03-14-three-layer-testing-report.md`

**Step 1: Pick one defect at a time**

For the selected defect, write a root-cause note:

- exact symptom
- exact reproduction
- failing layer
- root-cause hypothesis

**Step 2: Write the failing test first**

Examples:

- frontend adapter/page behavior defect → add `Wechat_Online_Shopping/tests/<topic>.test.cjs`
- backend API defect → add or update `backend/tests/<topic>.test.js`

Expected:
- the new or updated test fails for the right reason

**Step 3: Run the failing test to verify RED**

Run only the targeted test file first.

Expected:
- the test fails because the bug exists, not because of syntax or setup

**Step 4: Implement the minimal fix**

Touch only the files needed for that defect.

**Step 5: Run targeted verification**

Run:

- the targeted automated test
- the relevant MCP reproduction flow again

Expected:
- both pass

**Step 6: Update the defect entry**

Record:

- root cause
- files changed
- tests added
- verification evidence

**Step 7: Commit**

```powershell
git add <changed-files>
git commit -m "fix: <short defect summary>"
```

### Task 6: Re-run full regression and finalize the report

**Files:**
- Modify: `docs/reports/2026-03-14-three-layer-testing-report.md`

**Step 1: Re-run full frontend suite**

Run:

```powershell
cd E:\AI\cc+glm\Wechat_Online_Shopping
node --test tests\*.test.cjs
```

**Step 2: Re-run full backend suite**

Run:

```powershell
cd E:\AI\cc+glm\backend
node --test
```

**Step 3: Re-run affected MCP flows**

At minimum:

- every flow that previously failed
- the main user purchase chain
- the main admin management chain

**Step 4: Finalize the report**

Include:

- final automated counts
- final MCP status
- outstanding risks if any
- whether the manual regression checklist is ready

**Step 5: Commit**

```powershell
git add docs/reports/2026-03-14-three-layer-testing-report.md
git commit -m "docs: finalize three-layer testing report"
```
