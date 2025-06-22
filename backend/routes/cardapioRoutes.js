const express = require('express');
const router = express.Router();
const cardapioController = require('../controllers/cardapioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/itens', cardapioController.listarItens);
router.post('/itens', authMiddleware, cardapioController.criarItem);
router.get('/combos', cardapioController.listarCombos);
router.post('/combos', authMiddleware, cardapioController.criarCombo);

module.exports = router;