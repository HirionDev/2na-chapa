const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listarItens = async () => {
  return prisma.item.findMany({
    where: { ativo: true },
    include: { categoria: true },
    orderBy: { nome: 'asc' },
  });
};

const criarItem = async (dados) => {
  const { nome, preco, categoriaId } = dados;
  return prisma.item.create({
    data: {
      nome,
      preco,
      categoriaId,
    },
  });
};

const criarCombo = async (dados) => {
  const { nome, preco, categoriaId, itens } = dados;
  return prisma.combo.create({
    data: {
      nome,
      preco,
      categoriaId,
      itens: {
        create: itens.map((item) => ({
          itemId: item.itemId,
          quantidade: item.quantidade,
        })),
      },
    },
    include: { itens: { include: { item: true } } },
  });
};

const listarCombos = async () => {
  return prisma.combo.findMany({
    where: { ativo: true },
    include: {
      categoria: true,
      itens: { include: { item: true } },
    },
    orderBy: { nome: 'asc' },
  });
};

module.exports = {
  listarItens,
  criarItem,
  criarCombo,
  listarCombos,
};