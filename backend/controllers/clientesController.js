const clientesService = require('../services/clientesService');
const { validate, schemas } = require('../middlewares/validateMiddleware');

const criarCliente = async (req, res, next) => {
  try {
    const cliente = await clientesService.criarCliente(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
};

const listarClientes = async (req, res, next) => {
  try {
    const clientes = await clientesService.listarClientes();
    res.json(clientes);
  } catch (error) {
    next(error);
  }
};

const buscarClientePorTelefone = async (req, res, next) => {
  try {
    const cliente = await clientesService.buscarClientePorTelefone(req.params.telefone);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

const atualizarCliente = async (req, res, next) => {
  try {
    const cliente = await clientesService.atualizarCliente(parseInt(req.params.id), req.body);
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

const excluirCliente = async (req, res, next) => {
  try {
    await clientesService.excluirCliente(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  criarCliente: [validate(schemas.cliente), criarCliente],
  listarClientes,
  buscarClientePorTelefone,
  atualizarCliente: [validate(schemas.cliente), atualizarCliente],
  excluirCliente,
};