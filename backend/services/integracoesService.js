const { PrismaClient } = require('@prisma/client');
const { sendMessage } = require('../../ai/whatsapp');
const prisma = new PrismaClient();

const processarMensagemWhatsApp = async (mensagem, telefone) => {
  const cliente = await prisma.cliente.upsert({
    where: { telefone },
    update: { nome: mensagem.clienteNome || 'Cliente WhatsApp' },
    create: { nome: mensagem.clienteNome || 'Cliente WhatsApp', telefone },
  });

  const pedido = await prisma.pedido.create({
    data: {
      clienteNome: cliente.nome,
      telefone,
      total: mensagem.total || 0,
      tipo: 'whatsapp',
      observacoes: mensagem.texto,
      status: 'em_preparacao',
      itens: {
        create: mensagem.itens?.map((item) => ({
          itemId: item.itemId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        })) || [],
      },
      combos: {
        create: mensagem.combos?.map((combo) => ({
          comboId: combo.comboId,
          quantidade: combo.quantidade,
          precoUnitario: combo.precoUnitario,
        })) || [],
      },
    },
  });

  // Enviar confirmação ao cliente
  await sendMessage(telefone, `Pedido #${pedido.id} recebido! Total: R$${pedido.total.toFixed(2)}. Em breve, notificaremos quando estiver pronto.`);

  // Enviar cópia para número opcional
  const config = await prisma.configuracao.findUnique({ where: { chave: 'whatsapp_numero' } });
  if (config?.valor) {
    await sendMessage(config.valor, `Novo pedido #${pedido.id} de ${cliente.nome}: R$${pedido.total.toFixed(2)}.`);
  }

  return pedido;
};

const prepararDadosImpressao = async (pedidoId) => {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      itens: { include: { item: true } },
      combos: { include: { combo: true } },
    },
  });
  if (!pedido) {
    throw new Error('Pedido não encontrado');
  }

  return {
    id: pedido.id,
    cliente: pedido.clienteNome,
    tipo: pedido.tipo,
    data: pedido.criadoEm.toLocaleString(),
    itens: [
      ...pedido.itens.map((i) => ({
        nome: i.item.nome,
        quantidade: i.quantidade,
        preco: i.precoUnitario,
      })),
      ...pedido.combos.map((c) => ({
        nome: c.combo.nome,
        quantidade: c.quantidade,
        preco: c.precoUnitario,
      })),
    ],
    total: pedido.total,
    observacoes: pedido.observacoes,
  };
};

const notifyPedidoPronto = async (pedidoId) => {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { itens: true, combos: true },
  });
  if (!pedido || !pedido.telefone) return;

  const mensagem = `Seu pedido #${pedido.id} está pronto! Total: R$${pedido.total.toFixed(2)}.`;
  await sendMessage(pedido.telefone, mensagem);
};

module.exports = {
  processarMensagemWhatsApp,
  prepararDadosImpressao,
  notifyPedidoPronto,
};