const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

beforeAll(async () => {
  // Limpar banco de teste
  await prisma.pedido.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.item.deleteMany();
  await prisma.combo.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.configuracao.deleteMany();
  await prisma.usuario.deleteMany();

  // Criar dados iniciais
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.usuario.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const categoria = await prisma.categoria.create({
    data: { nome: 'Lanches' },
  });

  await prisma.item.create({
    data: {
      nome: 'Hambúrguer',
      preco: 20.90,
      categoriaId: categoria.id,
      ativo: true,
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});