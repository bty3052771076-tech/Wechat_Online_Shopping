const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const agentController = require('../controllers/agent.controller');

// 所有 agent 接口都需要用户认证
router.post('/chat', authenticate, agentController.chat);
router.get('/sessions', authenticate, agentController.getSessions);
router.get('/sessions/:id/messages', authenticate, agentController.getMessages);
router.delete('/sessions/:id', authenticate, agentController.deleteSession);

module.exports = router;
