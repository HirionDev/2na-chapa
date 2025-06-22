const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [pedidosHoje, vendasHoje, itensAtivos] = await Promise.all([
    prisma.pedido.count({
      where: {
        criadoEm: { gte: today, lt: tomorrow },
        status: { not: 'cancelado' },
      },
    }),
    prisma.pedido.aggregate({
      where: {
        criadoEm: { gte: today, lt: tomorrow },
        status: { not: 'cancelado' },
      },
      _sum: { total: true },
    }),
    prisma.item.count({ where: { ativo: true } }),
  ]);

  return {
    pedidosHoje,
    vendasHoje: vendasHoje._sum.total || 0,
    itensAtivos,
  };
};

module.exports = { getStats };