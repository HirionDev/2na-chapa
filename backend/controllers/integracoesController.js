const integracoesService = require('../services/integracoesService');
const { validate, schemas } = require('../middlewares/validateMiddleware');
const { printOrder } = require('../../printer/printer');

const processarMensagemWhatsApp = async (req, res, next) => {
  try {
    const pedido = await integracoesService.processarMensagemWhatsApp(req.body, req.body.telefone);
    res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
};

const prepararDadosImpressao = async (req, res, next) => {
  try {
    const dados = await integracoesService.prepararDadosImpressao(parseInt(req.params.pedidoId));
    res.json(dados);
  } catch (error) {
    next(error);
  }
};

const notifyPedidoPronto = async (req, res, next) => {
  try {
    await integracoesService.notifyPedidoPronto(parseInt(req.params.pedidoId));
    res.status(200).json({ message: 'Notificação enviada' });
  } catch (error) {
    next(error);
  }
};

const printPedido = async (req, res, next) => {
  try {
    await printOrder(parseInt(req.params.pedidoId));
    res.status(200).json({ message: 'Impressão enviada' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processarMensagemWhatsApp: [validate(schemas.pedido), processarMensagemWhatsApp],
  prepararDadosImpressao,
  notifyPedidoPronto,
  printPedido,
};