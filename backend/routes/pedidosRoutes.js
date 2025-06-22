const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, pedidosController.criarPedido);
router.get('/', authMiddleware, pedidosController.listarPedidos);
router.put('/:id/status', authMiddleware, pedidosController.atualizarStatusPedido);
router.put('/:id/pagamento', authMiddleware, pedidosController.atualizarPagamentoPedido);

module.exports = router;