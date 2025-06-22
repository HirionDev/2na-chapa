import { render, screen } from '@testing-library/react';
import CardPedido from '../components/CardPedido';

test('renders pedido details', () => {
  const pedido = {
    id: 1,
    clienteNome: 'João',
    status: 'Em preparação',
    total: 45.90,
    itens: [{ item: { nome: 'Hambúrguer' }, quantidade: 2 }],
  };

  render(<CardPedido pedido={pedido} />);

  expect(screen.getByText(/pedido #1/i)).toBeInTheDocument();
  expect(screen.getByText(/joão/i)).toBeInTheDocument();
  expect(screen.getByText(/r\$45.90/i)).toBeInTheDocument();
});