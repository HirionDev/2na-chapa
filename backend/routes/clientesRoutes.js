const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, clientesController.criarCliente);
router.get('/', authMiddleware, clientesController.listarClientes);
router.get('/:telefone', authMiddleware, clientesController.buscarClientePorTelefone);
router.put('/:id', authMiddleware, clientesController.atualizarCliente);
router.delete('/:id', authMiddleware, clientesController.excluirCliente);

module.exports = router;