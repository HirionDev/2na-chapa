const stringSimilarity = require('string-similarity');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const parseIntent = (text) => {
  const normalizedText = text.toLowerCase().trim();
  if (['oi', 'olá', 'hello', 'eai', 'eaí'].includes(normalizedText)) {
    return 'saudacao';
  }
  if (normalizedText.includes('combo') || normalizedText.includes('hambúrguer') || normalizedText.includes('pedido') || normalizedText.includes('quero')) {
    return 'pedido';
  }
  return 'desconhecido';
};

const parseItems = async (text) => {
  const normalizedText = text.toLowerCase().trim();
  const [itens, combos] = await Promise.all([
    prisma.item.findMany({ where: { ativo: true } }),
    prisma.combo.findMany({ where: { ativo: true } }),
  ]);

  const pedido = { itens: [], combos: [], total: 0 };
  const words = text.split(/\s+/);
  let currentQuantidade = 1;

  for (let i = 0; i < words.length; i++) {
    if (!isNaN(words[i])) {
      currentQuantidade = parseInt(words[i]);
      continue;
    }

    const word = words[i];
    const itemMatches = itens.map((item) => ({
      item,
      similarity: stringSimilarity.compareTwoStrings(word, item.nome.toLowerCase()),
    }));
    const comboMatches = combos.map((combo) => ({
      combo,
      similarity: stringSimilarity.compareTwoStrings(word, combo.nome.toLowerCase()),
    }));

    const bestItemMatch = itemMatches.reduce((best, current) => current.similarity > best.similarity ? current : best, { similarity: 0 });
    const bestComboMatch = comboMatches.reduce((best, current) => current.similarity > best.similarity ? current : best, { similarity: 0 });

    if (bestItemMatch.similarity > 0.7) {
      pedido.itens.push({
        itemId: bestItemMatch.item.id,
        quantidade: currentQuantidade,
        precoUnitario: bestItemMatch.item.preco,
        nome: bestItemMatch.item.nome,
      });
      pedido.total += bestItemMatch.item.preco * currentQuantidade;
      currentQuantidade = 1;
    } else if (bestComboMatch.similarity > 0.7) {
      pedido.combos.push({
        comboId: bestComboMatch.combo.id,
        quantidade: currentQuantidade,
        precoUnitario: bestComboMatch.combo.preco,
        nome: bestComboMatch.combo.nome,
      });
      pedido.total += bestComboMatch.combo.preco * currentQuantidade;
      currentQuantidade = 1;
    }
  }

  return pedido.itens.length > 0 || pedido.combos.length > 0 ? pedido : null;
};

module.exports = { parseIntent, parseItems };