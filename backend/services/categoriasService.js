const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const criarCategoria = async (nome) => {
  return prisma.categoria.create({
    data: { nome },
  });
};

const listarCategorias = async () => {
  return prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
  });
};

const atualizarCategoria = async (id, nome) => {
  return prisma.categoria.update({
    where: { id },
    data: { nome },
  });
};

const excluirCategoria = async (id) => {
  return prisma.categoria.delete({
    where: { id },
  });
};

module.exports = {
  criarCategoria,
  listarCategorias,
  atualizarCategoria,
  excluirCategoria,
};