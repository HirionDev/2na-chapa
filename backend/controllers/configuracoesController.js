const configuracoesService = require('../services/configuracoesService');
const { validate, schemas } = require('../middlewares/validateMiddleware');

const salvarConfiguracao = async (req, res, next) => {
  try {
    const { chave, valor } = req.body;
    const configuracao = await configuracoesService.salvarConfiguracao(chave, valor);
    res.json(configuracao);
  } catch (error) {
    next(error);
  }
};

const buscarConfiguracao = async (req, res, next) => {
  try {
    const configuracao = await configuracoesService.buscarConfiguracao(req.params.chave);
    if (!configuracao) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    res.json(configuracao);
  } catch (error) {
    next(error);
  }
};

const listarConfiguracoes = async (req, res, next) => {
  try {
    const configuracoes = await configuracoesService.listarConfiguracoes();
    res.json(configuracoes);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  salvarConfiguracao: [validate(schemas.configuracao), salvarConfiguracao],
  buscarConfiguracao,
  listarConfiguracoes,
};