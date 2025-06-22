const authService = require('../services/authService');
const { validate, schemas } = require('../middlewares/validateMiddleware');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const resultado = await authService.login(username, password);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

const criarUsuario = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    const usuario = await authService.criarUsuario(username, password, role);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login: [validate(schemas.login), login],
  criarUsuario: [validate(schemas.usuario), criarUsuario],
};