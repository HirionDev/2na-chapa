const { processarMensagemWhatsApp } = require('../backend/services/integracoesService');
const { parseIntent, parseItems } = require('./messageParser');
let PrismaClient;
let prisma;
let stringSimilarity;
try {
  ({ PrismaClient } = require('@prisma/client'));
  prisma = new PrismaClient();
} catch {
  prisma = { pedido: { findFirst: async () => null, findMany: async () => [] } };
}
try {
  stringSimilarity = require('string-similarity');
} catch {
  stringSimilarity = { compareTwoStrings: () => 0 };
}
const { generateCardapioImage } = require('../image-generator/imageGenerator');
const { sendMessage } = require('./whatsapp');
const fs = require('fs').promises;


const processMessage = async (text, from, state = {}) => {
  const normalizedText = text.toLowerCase().trim();
  const telefone = from.replace('@c.us', '');
  const intent = parseIntent(normalizedText);

  // Inicializar estado da conversa
  if (!state.step) {
    state = { step: 'initial', pedido: { itens: [], combos: [], telefone } };
  }

  switch (state.step) {
    case 'initial':
      if (intent === 'saudacao') {
        const cardapioText = await getCardapio();
        const imagePath = await generateCardapioImage();
        await sendMessage(from, cardapioText, { media: imagePath });
        return {
          text: 'O que você gostaria de pedir hoje?',
          state: { step: 'awaiting_order', pedido: state.pedido },
        };
      }
      if (intent === 'pedido') {
        const parsedItems = await parseItems(normalizedText);
        if (parsedItems) {
          state.pedido.itens.push(...(parsedItems.itens || []));
          state.pedido.combos.push(...(parsedItems.combos || []));
          state.pedido.total = parsedItems.total || 0;
          return {
            text: `Entendi! Você pediu:\n${formatPedido(state.pedido)}\nPor favor, informe seu nome para confirmar o pedido.`,
            state: { step: 'awaiting_name', pedido: state.pedido },
          };
        }
        return {
          text: 'Não consegui entender seu pedido. Pode especificar? Ex.: "2 hambúrgueres" ou "combo 1".',
          state: { step: 'awaiting_order', pedido: state.pedido },
        };
      }
      return {
        text: 'Desculpe, não entendi. Digite "oi" para ver o cardápio ou informe seu pedido.',
        state: { step: 'initial', pedido: state.pedido },
      };

    case 'awaiting_name':
      state.pedido.clienteNome = text;
      return {
        text: `Obrigado, ${text}! Qual o tipo de pedido? (Balcão ou WhatsApp)`,
        state: { step: 'awaiting_type', pedido: state.pedido },
      };

    case 'awaiting_type':
      if (['balcão', 'balcao', 'whatsapp'].includes(normalizedText)) {
        state.pedido.tipo = normalizedText === 'balcao' || normalizedText === 'balcão' ? 'balcao' : 'whatsapp';
        if (state.pedido.tipo === 'balcao') {
          return {
            text: 'Informe o número da mesa, por favor.',
            state: { step: 'awaiting_table', pedido: state.pedido },
          };
        }
        return {
          text: 'Forma de pagamento? (Dinheiro, Cartão, Pix)',
          state: { step: 'awaiting_payment', pedido: state.pedido },
        };
      }
      return {
        text: 'Por favor, escolha entre "Balcão" ou "WhatsApp".',
        state: { step: 'awaiting_type', pedido: state.pedido },
      };

    case 'awaiting_table':
      state.pedido.observacoes = `Mesa: ${text}`;
      return {
        text: 'Forma de pagamento? (Dinheiro, Cartão, Pix)',
        state: { step: 'awaiting_payment', pedido: state.pedido },
      };

    case 'awaiting_payment':
      state.pedido.pagamento = normalizedText.includes('dinheiro') ? 'dinheiro' :
                               normalizedText.includes('cartão') || normalizedText.includes('cartao') ? 'cartao' :
                               normalizedText.includes('pix') ? 'pix' : 'pendente';
      try {
        const sugestao = await getSugestao(telefone);
        const pedido = await processarMensagemWhatsApp({
          ...state.pedido,
          observacoes: state.pedido.observacoes || '',
        }, telefone);
        let responseText = `Pedido #${pedido.id} registrado! Total: R$${pedido.total.toFixed(2)}.`;
        if (sugestao) {
          responseText += `\n\nSugestão com base em seus pedidos anteriores: ${sugestao.nome} por R$${sugestao.preco.toFixed(2)}. Deseja adicionar?`;
          state.step = 'awaiting_suggestion';
        } else {
          state.step = 'initial';
        }
        return {
          text: responseText,
          state: { ...state, pedido: { itens: [], combos: [], telefone } },
        };
      } catch (error) {
        return {
          text: 'Erro ao registrar o pedido. Tente novamente.',
          state: { step: 'initial', pedido: { itens: [], combos: [], telefone } },
        };
      }

    case 'awaiting_suggestion':
      if (['sim', 's', 'ok'].includes(normalizedText)) {
        const ultimoPedido = await prisma.pedido.findFirst({
          where: { telefone },
          orderBy: { criadoEm: 'desc' },
        });
        const sugestao = await getSugestao(telefone);
        if (sugestao) {
          state.pedido.itens.push({ itemId: sugestao.id, quantidade: 1, precoUnitario: sugestao.preco });
          state.pedido.total = sugestao.preco;
          const pedido = await processarMensagemWhatsApp({
            ...state.pedido,
            clienteNome: ultimoPedido?.clienteNome || 'Cliente WhatsApp',
            tipo: ultimoPedido?.tipo || 'whatsapp',
            observacoes: ultimoPedido?.observacoes || '',
          }, telefone);
          return {
            text: `Item sugerido adicionado! Pedido #${pedido.id} registrado. Total: R$${pedido.total.toFixed(2)}.`,
            state: { step: 'initial', pedido: { itens: [], combos: [], telefone } },
          };
        }
      }
      return {
        text: 'Ok, pedido finalizado! Digite "oi" para começar novamente.',
        state: { step: 'initial', pedido: { itens: [], combos: [], telefone } },
      };

    default:
      return {
        text: 'Estado inválido. Digite "oi" para recomeçar.',
        state: { step: 'initial', pedido: { itens: [], combos: [], telefone } },
      };
  }
};

const getCardapio = async () => {
  const [itens, combos] = await Promise.all([
    prisma.item.findMany({ where: { ativo: true }, include: { categoria: true } }),
    prisma.combo.findMany({ where: { ativo: true }, include: { categoria: true } }),
  ]);

  let cardapioText = '🍔 *Cardápio Na Chapa* 🍔\n\n';
  cardapioText += '*Itens*\n';
  itens.forEach((item) => {
    cardapioText += `- ${item.nome} (R$${item.preco.toFixed(2)}) - ${item.categoria.nome}\n`;
  });
  cardapioText += '\n*Combos*\n';
  combos.forEach((combo) => {
    cardapioText += `- ${combo.nome} (R$${combo.preco.toFixed(2)}) - ${combo.categoria.nome}\n`;
  });

  return cardapioText;
};

const getSugestao = async (telefone) => {
  const pedidos = await prisma.pedido.findMany({
    where: { telefone },
    include: { itens: { include: { item: true } }, combos: { include: { combo: true } } },
    orderBy: { criadoEm: 'desc' },
    take: 5,
  });

  if (pedidos.length === 0) return null;

  const itemCounts = {};
  pedidos.forEach((pedido) => {
    pedido.itens.forEach((i) => {
      itemCounts[i.itemId] = (itemCounts[i.itemId] || 0) + i.quantidade;
    });
    pedido.combos.forEach((c) => {
      itemCounts[`combo_${c.comboId}`] = (itemCounts[`combo_${c.comboId}`] || 0) + c.quantidade;
    });
  });

  const mostFrequent = Object.keys(itemCounts).reduce((a, b) => itemCounts[a] > itemCounts[b] ? a : b, null);
  if (!mostFrequent) return null;

  if (mostFrequent.startsWith('combo_')) {
    const comboId = parseInt(mostFrequent.replace('combo_', ''));
    return prisma.combo.findUnique({ where: { id: comboId } });
  } else {
    const itemId = parseInt(mostFrequent);
    return prisma.item.findUnique({ where: { id: itemId } });
  }
};

const formatPedido = (pedido) => {
  let text = '';
  if (pedido.itens.length > 0) {
    text += pedido.itens.map((i) => `${i.nome} x${i.quantidade}`).join('\n');
  }
  if (pedido.combos.length > 0) {
    text += pedido.combos.map((c) => `${c.nome} x${c.quantidade}`).join('\n');
  }
  if (pedido.total) {
    text += `\nTotal: R$${pedido.total.toFixed(2)}`;
  }
  return text || 'Nenhum item selecionado';
};

module.exports = { processMessage };