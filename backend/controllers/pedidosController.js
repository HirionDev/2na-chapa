const pedidosService = require('../services/pedidosService');
const { validate, schemas } = require('../middlewares/validateMiddleware');

const criarPedido = async (req, res, next) => {
  try {
    const pedido = await pedidosService.criarPedido(req.body);
    res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
};

const listarPedidos = async (req, res, next) => {
  try {
    const pedidos = await pedidosService.listarPedidos();
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

const atualizarStatusPedido = async (req, res, next) => {
  try {
    const pedido = await pedidosService.atualizarStatusPedido(parseInt(req.params.id), req.body.status);
    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

const atualizarPagamentoPedido = async (req, res, next) => {
  try {
    const pedido = await pedidosService.atualizarPagamentoPedido(parseInt(req.params.id), req.body.pagamento);
    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  criarPedido: [validate(schemas.pedido), criarPedido],
  listarPedidos,
  atualizarStatusPedido,
  atualizarPagamentoPedido,
};