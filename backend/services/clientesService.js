const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const criarCliente = async (dados) => {
  const { nome, telefone } = dados;
  return prisma.cliente.create({
    data: { nome, telefone },
  });
};

const listarClientes = async () => {
  return prisma.cliente.findMany({
    orderBy: { nome: 'asc' },
  });
};

const buscarClientePorTelefone = async (telefone) => {
  return prisma.cliente.findUnique({
    where: { telefone },
  });
};

const atualizarCliente = async (id, dados) => {
  return prisma.cliente.update({
    where: { id },
    data: dados,
  });
};

const excluirCliente = async (id) => {
  return prisma.cliente.delete({
    where: { id },
  });
};

module.exports = {
  criarCliente,
  listarClientes,
  buscarClientePorTelefone,
  atualizarCliente,
  excluirCliente,
};