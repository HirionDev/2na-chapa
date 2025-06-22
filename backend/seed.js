const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.usuario.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('Usuário admin criado');
}

seed()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());