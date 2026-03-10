#!/bin/bash

# 管理端订单管理APIs测试脚本
# Task 8: Admin Order Management APIs

echo "========================================="
echo "管理端订单管理APIs测试"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL
BASE_URL="http://localhost:3000/api/admin"

# 测试函数
test_api() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local token=$5
  
  echo -e "${YELLOW}测试: ${name}${NC}"
  echo "请求: ${method} ${BASE_URL}${endpoint}"
  
  if [ -z "$data" ]; then
    response=$(curl -s -X ${method} "${BASE_URL}${endpoint}" \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -X ${method} "${BASE_URL}${endpoint}" \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json" \
      -d "${data}")
  fi
  
  echo "响应: ${response}"
  echo ""
}

# 1. 管理员登录获取token
echo -e "${GREEN}步骤 1: 管理员登录${NC}"
login_response=$(curl -s -X POST "${BASE_URL}/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "登录响应: ${login_response}"

# 提取token (需要jq工具，如果没有安装会失败)
if command -v jq &> /dev/null; then
  ADMIN_TOKEN=$(echo ${login_response} | jq -r '.data.token')
  echo -e "${GREEN}Token获取成功: ${ADMIN_TOKEN:0:20}...${NC}"
else
  echo -e "${YELLOW}警告: 未安装jq，请手动从以下响应中提取token${NC}"
  echo "${login_response}"
  echo -e "${YELLOW}请设置ADMIN_TOKEN环境变量后继续测试${NC}"
  exit 1
fi

echo ""
echo "========================================="
echo "开始测试订单管理APIs"
echo "========================================="
echo ""

# 2. 获取订单列表
test_api \
  "获取订单列表" \
  "GET" \
  "/orders?page=1&pageSize=10" \
  "" \
  "${ADMIN_TOKEN}"

# 3. 按状态筛选订单
test_api \
  "按状态筛选订单（待发货）" \
  "GET" \
  "/orders?status=2&page=1&pageSize=10" \
  "" \
  "${ADMIN_TOKEN}"

# 4. 按订单号搜索
test_api \
  "按订单号搜索" \
  "GET" \
  "/orders?orderNo=ORDER&page=1&pageSize=10" \
  "" \
  "${ADMIN_TOKEN}"

# 5. 按手机号搜索
test_api \
  "按收货人手机号搜索" \
  "GET" \
  "/orders?receiverPhone=138&page=1&pageSize=10" \
  "" \
  "${ADMIN_TOKEN}"

# 6. 按时间范围筛选
test_api \
  "按时间范围筛选" \
  "GET" \
  "/orders?startTime=2024-01-01&endTime=2024-12-31&page=1&pageSize=10" \
  "" \
  "${ADMIN_TOKEN}"

# 7. 组合条件筛选
test_api \
  "组合条件筛选（状态+订单号）" \
  "GET" \
  "/orders?status=2&orderNo=ORDER&page=1&pageSize=10" \
  "" \
  "${ADMIN_TOKEN}"

# 8. 订单发货
test_api \
  "订单发货" \
  "PUT" \
  "/orders/1/ship" \
  '{"deliveryCompany":"顺丰速运","deliveryNo":"SF1234567890"}' \
  "${ADMIN_TOKEN}"

# 9. 测试参数验证 - 快递单号为空
test_api \
  "测试参数验证（快递单号为空）" \
  "PUT" \
  "/orders/1/ship" \
  '{"deliveryCompany":"顺丰速运"}' \
  "${ADMIN_TOKEN}"

# 10. 测试错误订单ID
test_api \
  "测试错误订单ID" \
  "PUT" \
  "/orders/99999/ship" \
  '{"deliveryCompany":"顺丰速运","deliveryNo":"SF1234567890"}' \
  "${ADMIN_TOKEN}"

echo "========================================="
echo -e "${GREEN}测试完成${NC}"
echo "========================================="
