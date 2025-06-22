const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, categoriasController.criarCategoria);
router.get('/', categoriasController.listarCategorias);
router.put('/:id', authMiddleware, categoriasController.atualizarCategoria);
router.delete('/:id', authMiddleware, categoriasController.excluirCategoria);

module.exports = router;