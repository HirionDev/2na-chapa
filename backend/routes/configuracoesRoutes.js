const express = require('express');
const router = express.Router();
const configuracoesController = require('../controllers/configuracoesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, configuracoesController.salvarConfiguracao);
router.get('/:chave', authMiddleware, configuracoesController.buscarConfiguracao);
router.get('/', authMiddleware, configuracoesController.listarConfiguracoes);

module.exports = router;