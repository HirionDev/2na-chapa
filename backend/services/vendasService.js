const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const filtrarVendas = async (filtros) => {
  const { inicio, fim, tipo, status, clienteNome, clienteTelefone } = filtros;
  const where = {
    criadoEm: {
      gte: new Date(inicio),
      lte: new Date(fim),
    },
  };

  if (tipo) where.tipo = tipo;
  if (status) where.status = status;
  if (clienteNome) where.clienteNome = { contains: clienteNome, mode: 'insensitive' };
  if (clienteTelefone) where.telefone = clienteTelefone;

  const [vendas, totalVendas, itensVendidos, vendasPorDia, vendasPorTipo] = await Promise.all([
    prisma.pedido.findMany({
      where,
      select: {
        id: true,
        clienteNome: true,
        telefone: true,
        total: true,
        tipo: true,
        status: true,
        observacoes: true,
        criadoEm: true,
        itens: {
          select: {
            quantidade: true,
            precoUnitario: true,
            item: { select: { id: true, nome: true } },
          },
        },
        combos: {
          select: {
            quantidade: true,
            precoUnitario: true,
            combo: { select: { id: true, nome: true } },
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    }),
    prisma.pedido.aggregate({
      where,
      _sum: { total: true },
    }),
    prisma.itemPedido.groupBy({
      by: ['itemId'],
      where: {
        pedido: where,
      },
      _sum: { quantidade: true, precoUnitario: true },
      include: {
        item: { select: { nome: true } },
      },
    }).then((items) => {
      const combos = prisma.comboPedido.groupBy({
        by: ['comboId'],
        where: { pedido: where },
        _sum: { quantidade: true, precoUnitario: true },
        include: {
          combo: { select: { nome: true } },
        },
      });
      return Promise.all([items, combos]).then(([items, combos]) => ({
        items: items.map((i) => ({
          id: i.itemId,
          nome: i.item.nome,
          quantidade: i._sum.quantidade,
          total: i._sum.precoUnitario * i._sum.quantidade,
        })),
        combos: combos.map((c) => ({
          id: c.comboId,
          nome: c.combo.nome,
          quantidade: c._sum.quantidade,
          total: c._sum.precoUnitario * c._sum.quantidade,
        })),
      }));
    }),
    prisma.pedido.groupBy({
      by: ['criadoEm'],
      where,
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.pedido.groupBy({
      by: ['tipo'],
      where,
      _sum: { total: true },
      _count: { id: true },
    }),
  ]);

  const estatisticas = {
    totalVendas: totalVendas._sum.total || 0,
    totalPedidos: vendas.length,
    itensMaisVendidos: [
      ...itensVendidos.items,
      ...itensVendidos.combos,
    ].sort((a, b) => b.quantidade - a.quantidade).slice(0, 5),
    vendasPorDia: vendasPorDia.map((v) => ({
      data: new Date(v.criadoEm).toISOString().split('T')[0],
      total: v._sum.total || 0,
      pedidos: v._count.id,
    })),
    vendasPorTipo: vendasPorTipo.map((v) => ({
      tipo: v.tipo,
      total: v._sum.total || 0,
      pedidos: v._count.id,
    })),
  };

  return { vendas, estatisticas };
};

const gerarRelatorioPDF = async (vendas, estatisticas, inicio, fim) => {
  const doc = new PDFDocument();
  const filePath = path.join(process.env.REPORTS_DIR || './reports', `relatorio_${Date.now()}.pdf`);
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text('Relatório de Vendas - Na Chapa', { align: 'center' });
  doc.fontSize(12).text(`Período: ${new Date(inicio).toLocaleDateString()} a ${new Date(fim).toLocaleDateString()}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text('Resumo', { underline: true });
  doc.fontSize(12);
  doc.text(`Total de Vendas: R$${estatisticas.totalVendas.toFixed(2)}`);
  doc.text(`Total de Pedidos: ${estatisticas.totalPedidos}`);
  doc.moveDown();

  doc.fontSize(14).text('Itens Mais Vendidos', { underline: true });
  estatisticas.itensMaisVendidos.forEach((item) => {
    doc.text(`- ${item.nome}: ${item.quantidade} unidades (R$${item.total.toFixed(2)})`);
  });
  doc.moveDown();

  doc.fontSize(14).text('Pedidos', { underline: true });
  vendas.forEach((pedido) => {
    doc.fontSize(12);
    doc.text(`Pedido #${pedido.id} - ${pedido.clienteNome} (${pedido.tipo})`);
    doc.text(`Data: ${new Date(pedido.criadoEm).toLocaleString()}`);
    doc.text('Itens:');
    pedido.itens.forEach((item) => {
      doc.text(`- ${item.item.nome} x${item.quantidade} = R$${(item.precoUnitario * item.quantidade).toFixed(2)}`);
    });
    pedido.combos.forEach((combo) => {
      doc.text(`- ${combo.combo.nome} x${combo.quantidade} = R$${(combo.precoUnitario * combo.quantidade).toFixed(2)}`);
    });
    doc.text(`Total: R$${pedido.total.toFixed(2)}`);
    doc.moveDown();
  });

  doc.end();
  return filePath;
};

const gerarRelatorioExcel = async (vendas, estatisticas, inicio, fim) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Relatório de Vendas');
  const filePath = path.join(process.env.REPORTS_DIR || './reports', `relatorio_${Date.now()}.xlsx`);

  worksheet.columns = [
    { header: 'ID Pedido', key: 'id', width: 10 },
    { header: 'Cliente', key: 'clienteNome', width: 20 },
    { header: 'Tipo', key: 'tipo', width: 10 },
    { header: 'Data', key: 'criadoEm', width: 20 },
    { header: 'Itens/Combos', key: 'itens', width: 30 },
    { header: 'Total', key: 'total', width: 15 },
  ];

  vendas.forEach((pedido) => {
    const itensText = [
      ...pedido.itens.map((i) => `${i.item.nome} x${i.quantidade}`),
      ...pedido.combos.map((c) => `${c.combo.nome} x${c.quantidade}`),
    ].join(', ');
    worksheet.addRow({
      id: pedido.id,
      clienteNome: pedido.clienteNome,
      tipo: pedido.tipo,
      criadoEm: new Date(pedido.criadoEm).toLocaleString(),
      itens: itensText,
      total: pedido.total,
    });
  });

  worksheet.addRow({ total: `Total Geral: R$${estatisticas.totalVendas.toFixed(2)}` });

  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

module.exports = {
  filtrarVendas,
  gerarRelatorioPDF,
  gerarRelatorioExcel,
};