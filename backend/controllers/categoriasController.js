const categoriasService = require('../services/categoriasService');
const { validate, schemas } = require('../middlewares/validateMiddleware');

const criarCategoria = async (req, res, next) => {
  try {
    const categoria = await categoriasService.criarCategoria(req.body.nome);
    res.status(201).json(categoria);
  } catch (error) {
    next(error);
  }
};

const listarCategorias = async (req, res, next) => {
  try {
    const categorias = await categoriasService.listarCategorias();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
};

const atualizarCategoria = async (req, res, next) => {
  try {
    const categoria = await categoriasService.atualizarCategoria(parseInt(req.params.id), req.body.nome);
    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

const excluirCategoria = async (req, res, next) => {
  try {
    await categoriasService.excluirCategoria(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  criarCategoria: [validate(schemas.categoria), criarCategoria],
  listarCategorias,
  atualizarCategoria: [validate(schemas.categoria), atualizarCategoria],
  excluirCategoria,
};