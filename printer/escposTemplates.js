const printPedido = async (printer, pedido) => {
  // Configurações
  printer.align('ct');
  printer.size(1, 1);
  printer.text('Na Chapa');
  printer.size(0, 0);
  printer.text('-------------------------------');

  // Cabeçalho
  printer.align('lt');
  printer.text(`Pedido #${pedido.id}`);
  printer.text(`Cliente: ${pedido.cliente}`);
  printer.text(`Data: ${pedido.data}`);
  printer.text(`Tipo: ${pedido.tipo.toUpperCase()}`);
  printer.text('-------------------------------');

  // Itens
  printer.tableCustom([
    { text: 'Qtd', align: 'LEFT', width: 0.15 },
    { text: 'Item', align: 'LEFT', width: 0.55 },
    { text: 'Valor', align: 'RIGHT', width: 0.3 },
  ]);

  pedido.itens.forEach((item) => {
    printer.tableCustom([
      { text: `${item.quantidade}x`, align: 'LEFT', width: 0.15 },
      { text: item.nome, align: 'LEFT', width: 0.55 },
      { text: `R$${item.preco.toFixed(2)}`, align: 'RIGHT', width: 0.3 },
    ]);
  });

  printer.text('-------------------------------');

  // Total
  printer.align('rt');
  printer.text(`Total: R$${pedido.total.toFixed(2)}`);
  printer.align('lt');
  if (pedido.observacoes) {
    printer.text('Observações:');
    printer.text(pedido.observacoes);
  }

  printer.text('-------------------------------');
  printer.feed(2); // Avançar papel
};

module.exports = { printPedido };