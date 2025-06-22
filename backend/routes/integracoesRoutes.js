const express = require('express');
const router = express.Router();
const integracoesController = require('../controllers/integracoesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/whatsapp', authMiddleware, integracoesController.processarMensagemWhatsApp);
router.get('/impressao/:pedidoId', authMiddleware, integracoesController.prepararDadosImpressao);
router.post('/whatsapp/notify/:pedidoId', authMiddleware, integracoesController.notifyPedidoPronto);
router.post('/impressao/:pedidoId', authMiddleware, integracoesController.printPedido);

module.exports = router;