const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Erro de validação',
      details: error.details.map((detail) => detail.message),
    });
  }
  next();
};

const schemas = {
  pedido: Joi.object({
    clienteNome: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Nome do cliente deve ter pelo menos 2 caracteres',
      'string.max': 'Nome do cliente deve ter no máximo 100 caracteres',
      'any.required': 'Nome do cliente é obrigatório',
    }),
    telefone: Joi.string().pattern(/^\d{10,11}$/).allow(null).messages({
      'string.pattern.base': 'Telefone deve ter 10 ou 11 dígitos',
    }),
    itens: Joi.array().items(
      Joi.object({
        itemId: Joi.number().integer().positive().required(),
        quantidade: Joi.number().integer().min(1).required(),
      })
    ).min(0),
    combos: Joi.array().items(
      Joi.object({
        comboId: Joi.number().integer().positive().required(),
        quantidade: Joi.number().integer().min(1).required(),
      })
    ).min(0),
    tipo: Joi.string().valid('balcao', 'whatsapp').required().messages({
      'any.only': 'Tipo deve ser "balcao" ou "whatsapp"',
      'any.required': 'Tipo é obrigatório',
    }),
    observacoes: Joi.string().max(500).allow(null, '').messages({
      'string.max': 'Observações devem ter no máximo 500 caracteres',
    }),
  }),
  item: Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    preco: Joi.number().positive().required(),
    categoriaId: Joi.number().integer().positive().required(),
    ativo: Joi.boolean().default(true),
  }),
  combo: Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    preco: Joi.number().positive().required(),
    categoriaId: Joi.number().integer().positive().required(),
    itens: Joi.array().items(
      Joi.object({
        itemId: Joi.number().integer().positive().required(),
        quantidade: Joi.number().integer().min(1).required(),
      })
    ).min(1).required(),
    ativo: Joi.boolean().default(true),
  }),
  cliente: Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    telefone: Joi.string().pattern(/^\d{10,11}$/).required(),
  }),
  categoria: Joi.object({
    nome: Joi.string().min(2).max(100).required(),
  }),
  configuracao: Joi.object({
    chave: Joi.string().min(2).max(100).required(),
    valor: Joi.string().max(500).required(),
  }),
  usuario: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid('admin', 'funcionario').default('admin'),
  }),
  login: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).max(100).required(),
  }),
  vendasFiltro: Joi.object({
    inicio: Joi.date().iso().required(),
    fim: Joi.date().iso().required(),
    tipo: Joi.string().valid('balcao', 'whatsapp').optional(),
    status: Joi.string().valid('em_preparacao', 'pronto', 'cancelado').optional(),
    clienteNome: Joi.string().max(100).optional(),
    clienteTelefone: Joi.string().pattern(/^\d{10,11}$/).optional(),
  }),
};

module.exports = { validate, schemas };