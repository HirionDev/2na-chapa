const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const salvarConfiguracao = async (chave, valor) => {
  return prisma.configuracao.upsert({
    where: { chave },
    update: { valor },
    create: { chave, valor },
  });
};

const buscarConfiguracao = async (chave) => {
  return prisma.configuracao.findUnique({
    where: { chave },
  });
};

const listarConfiguracoes = async () => {
  return prisma.configuracao.findMany();
};

module.exports = {
  salvarConfiguracao,
  buscarConfiguracao,
  listarConfiguracoes,
};