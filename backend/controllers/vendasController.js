const vendasService = require('../services/vendasService');
const { validate, schemas } = require('../middlewares/validateMiddleware');

const filtrarVendas = async (req, res, next) => {
  try {
    const { inicio, fim, tipo, status, clienteNome, clienteTelefone } = req.body;
    const result = await vendasService.filtrarVendas({ inicio, fim, tipo, status, clienteNome, clienteTelefone });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const gerarRelatorioPDF = async (req, res, next) => {
  try {
    const { inicio, fim, tipo, status, clienteNome, clienteTelefone } = req.body;
    const { vendas, estatisticas } = await vendasService.filtrarVendas({ inicio, fim, tipo, status, clienteNome, clienteTelefone });
    const filePath = await vendasService.gerarRelatorioPDF(vendas, estatisticas, inicio, fim);
    res.download(filePath);
  } catch (error) {
    next(error);
  }
};

const gerarRelatorioExcel = async (req, res, next) => {
  try {
    const { inicio, fim, tipo, status, clienteNome, clienteTelefone } = req.body;
    const { vendas, estatisticas } = await vendasService.filtrarVendas({ inicio, fim, tipo, status, clienteNome, clienteTelefone });
    const filePath = await vendasService.gerarRelatorioExcel(vendas, estatisticas, inicio, fim);
    res.download(filePath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  filtrarVendas: [validate(schemas.vendasFiltro), filtrarVendas],
  gerarRelatorioPDF: [validate(schemas.vendasFiltro), gerarRelatorioPDF],
  gerarRelatorioExcel: [validate(schemas.vendasFiltro), gerarRelatorioExcel],
};