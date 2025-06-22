const express = require('express');
const router = express.Router();
const vendasController = require('../controllers/vendasController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware(['admin']), vendasController.filtrarVendas);
router.post('/relatorio/pdf', authMiddleware(['admin']), vendasController.gerarRelatorioPDF);
router.post('/relatorio/excel', authMiddleware(['admin']), vendasController.gerarRelatorioExcel);

module.exports = router;