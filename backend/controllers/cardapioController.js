const cardapioService = require('../services/cardapioService');
const { validate, schemas } = require('../middlewares/validateMiddleware');

const listarItens = async (req, res, next) => {
  try {
    const itens = await cardapioService.listarItens();
    res.json(itens);
  } catch (error) {
    next(error);
  }
};

const criarItem = async (req, res, next) => {
  try {
    const item = await cardapioService.criarItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const criarCombo = async (req, res, next) => {
  try {
    const combo = await cardapioService.criarCombo(req.body);
    res.status(201).json(combo);
  } catch (error) {
    next(error);
  }
};

const listarCombos = async (req, res, next) => {
  try {
    const combos = await cardapioService.listarCombos();
    res.json(combos);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarItens,
  criarItem: [validate(schemas.item), criarItem],
  criarCombo: [validate(schemas.combo), criarCombo],
  listarCombos,
};