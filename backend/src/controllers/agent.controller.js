const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { buildMessages, chatCompletionStream } = require('../services/agent.service');
const {
  MAX_MESSAGE_LENGTH,
  MAX_SESSIONS_PER_USER,
  RATE_LIMIT_PER_MINUTE,
} = require('../config/agent-prompt');

// 简单内存限流（生产环境应使用 Redis）
const rateLimitMap = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const key = `agent:${userId}`;
  const record = rateLimitMap.get(key) || { count: 0, resetAt: now + 60000 };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + 60000;
  }

  record.count += 1;
  rateLimitMap.set(key, record);

  return record.count <= RATE_LIMIT_PER_MINUTE;
}

class AgentController {
  async chat(req, res, next) {
    try {
      // JWT payload 使用 user_id 字段
      const userId = req.user.user_id;
      const { sessionId, message } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return errorResponse(res, 400, 'InvalidParam', '消息内容不能为空');
      }
      if (message.length > MAX_MESSAGE_LENGTH) {
        return errorResponse(res, 400, 'InvalidParam', `消息不能超过${MAX_MESSAGE_LENGTH}字`);
      }

      if (!checkRateLimit(userId)) {
        return errorResponse(res, 429, 'RateLimit', '发送太频繁，请稍后再试');
      }

      let session;
      if (sessionId) {
        session = await ChatSession.findOne({
          where: { id: sessionId, user_id: userId, status: 1 },
        });
        if (!session) {
          return errorResponse(res, 404, 'SessionNotFound', '会话不存在');
        }
      } else {
        const sessionCount = await ChatSession.count({
          where: { user_id: userId, status: 1 },
        });
        if (sessionCount >= MAX_SESSIONS_PER_USER) {
          return errorResponse(res, 400, 'SessionLimit', `会话数量已达上限(${MAX_SESSIONS_PER_USER})`);
        }

        session = await ChatSession.create({
          user_id: userId,
          title: message.trim().slice(0, 20),
        });
      }

      await ChatMessage.create({
        session_id: session.id,
        role: 'user',
        content: message.trim(),
      });

      const historyMessages = await ChatMessage.findAll({
        where: { session_id: session.id },
        order: [['created_at', 'ASC']],
        attributes: ['role', 'content'],
      });

      const historyForLLM = historyMessages.slice(0, -1).map((m) => m.toJSON());
      const messages = buildMessages(historyForLLM, message.trim());

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      let fullContent = '';
      let products = null;

      const result = await chatCompletionStream(
        messages,
        (delta) => {
          fullContent += delta;
          res.write(`event: delta\ndata: ${JSON.stringify({ content: delta })}\n\n`);
        },
        (productList) => {
          products = productList;
          res.write(`event: products\ndata: ${JSON.stringify({ products: productList })}\n\n`);
        },
      );

      if (!fullContent && result.content) {
        fullContent = result.content;
      }
      if (!products && result.products) {
        products = result.products;
      }

      const assistantMessage = await ChatMessage.create({
        session_id: session.id,
        role: 'assistant',
        content: fullContent,
        metadata: products ? { products } : null,
      });

      res.write(`event: done\ndata: ${JSON.stringify({
        sessionId: session.id,
        messageId: assistantMessage.id,
      })}\n\n`);

      res.end();
    } catch (error) {
      if (res.headersSent) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: '抱歉，我暂时开小差了，请稍后再试' })}\n\n`);
        res.end();
      } else {
        next(error);
      }
    }
  }

  async getSessions(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
      const limit = parseInt(pageSize, 10);

      const { count, rows } = await ChatSession.findAndCountAll({
        where: { user_id: userId, status: 1 },
        order: [['updated_at', 'DESC']],
        limit,
        offset,
        attributes: ['id', 'title', 'updated_at'],
      });

      return paginatedResponse(res, 200, '获取成功', rows, {
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
        total: count,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { id } = req.params;
      const { page = 1, pageSize = 50 } = req.query;

      const session = await ChatSession.findOne({
        where: { id, user_id: userId, status: 1 },
      });
      if (!session) {
        return errorResponse(res, 404, 'SessionNotFound', '会话不存在');
      }

      const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
      const limit = parseInt(pageSize, 10);

      const { count, rows } = await ChatMessage.findAndCountAll({
        where: { session_id: id },
        order: [['created_at', 'ASC']],
        limit,
        offset,
        attributes: ['id', 'role', 'content', 'metadata', 'created_at'],
      });

      return paginatedResponse(res, 200, '获取成功', rows, {
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
        total: count,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { id } = req.params;

      const session = await ChatSession.findOne({
        where: { id, user_id: userId, status: 1 },
      });
      if (!session) {
        return errorResponse(res, 404, 'SessionNotFound', '会话不存在');
      }

      await session.update({ status: 0 });

      return successResponse(res, 200, '会话已删除');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AgentController();
