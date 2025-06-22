const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const { notifyPedidoPronto } = require('./integracoesService'); // Corrigido
const { notifyClients } = require('../server');

dotenv.config();

const prisma = new PrismaClient();

const isDentroDoHorario = () => {
  const horario = process.env.OPENING_HOURS || '00:00-23:59';
  const [abertura, fechamento] = horario.split('-').map((t) => {
    const [h = 0, m = 0] = t.split(':').map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  });
  const now = new Date();
  if (fechamento <= abertura) {
    const fechamentoNextDay = new Date(fechamento);
    fechamentoNextDay.setDate(fechamentoNextDay.getDate() + 1);
    return now >= abertura || now <= fechamentoNextDay;
  }
  return now >= abertura && now <= fechamento;
};

const criarPedido = async (dados) => {
  if (!isDentroDoHorario()) {
    throw new Error('Fora do horário de funcionamento');
  }

  const { clienteNome, telefone, itens = [], combos = [], tipo, observacoes } = dados;
  let total = 0;

  const pedidoItens = await Promise.all(
    itens.map(async (item) => {
      const itemDb = await prisma.item.findUnique({ where: { id: item.itemId } });
      if (!itemDb || !itemDb.ativo) {
        throw new Error(`Item ${item.itemId} não encontrado ou inativo`);
      }
      const subtotal = itemDb.preco * item.quantidade;
      total += subtotal;
      return {
        itemId: item.itemId,
        quantidade: item.quantidade,
        precoUnitario: itemDb.preco,
      };
    })
  );

  const pedidoCombos = await Promise.all(
    combos.map(async (combo) => {
      const comboDb = await prisma.combo.findUnique({ where: { id: combo.comboId } });
      if (!comboDb || !comboDb.ativo) {
        throw new Error(`Combo ${combo.comboId} não encontrado ou inativo`);
      }
      const subtotal = comboDb.preco * combo.quantidade;
      total += subtotal;
      return {
        comboId: combo.comboId,
        quantidade: combo.quantidade,
        precoUnitario: comboDb.preco,
      };
    })
  );

  const pedido = await prisma.pedido.create({
    data: {
      clienteNome,
      telefone,
      total,
      tipo,
      observacoes,
      itens: { create: pedidoItens },
      combos: { create: pedidoCombos },
    },
    include: {
      itens: { include: { item: true } },
      combos: { include: { combo: true } },
    },
  });

  notifyClients({ type: 'novo_pedido', pedido });

  return pedido;
};

const listarPedidos = async () => {
  return prisma.pedido.findMany({
    include: {
      itens: { include: { item: true } },
      combos: { include: { combo: true } },
    },
    orderBy: { criadoEm: 'desc' },
  });
};

const atualizarStatusPedido = async (id, status) => {
  if (!['em_preparacao', 'pronto', 'cancelado'].includes(status)) {
    throw new Error('Status inválido');
  }
  const pedido = await prisma.pedido.update({
    where: { id },
    data: { status },
    include: {
      itens: { include: { item: true } },
      combos: { include: { combo: true } },
    },
  });

  if (status === 'pronto') {
    await notifyPedidoPronto(id);
  }

  return pedido;
};

const atualizarPagamentoPedido = async (id, pagamento) => {
  if (!['pendente', 'pago'].includes(pagamento)) {
    throw new Error('Status de pagamento inválido');
  }
  return prisma.pedido.update({
    where: { id },
    data: { pagamento },
    include: {
      itens: { include: { item: true } },
      combos: { include: { combo: true } },
    },
  });
};

module.exports = {
  criarPedido,
  listarPedidos,
  atualizarStatusPedido,
  atualizarPagamentoPedido,
};