import { useState, useEffect } from 'react';
import CardPedido from '../components/CardPedido';
import api from '../services/api';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { connectWebSocket } from '../services/websocket';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await api.get('/pedidos');
        setPedidos(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar pedidos');
        setLoading(false);
      }
    };

    fetchPedidos();

    const disconnect = connectWebSocket((message) => {
      if (message.type === 'novo_pedido') {
        setPedidos((prev) => [message.pedido, ...prev]);
        if (window.electronAPI) {
          window.electronAPI.showNotification({
            title: `Novo Pedido #${message.pedido.id}`,
            body: `Cliente: ${message.pedido.clienteNome}`,
          });
        }
      }
    });

    return disconnect;
  }, []);

  const handleStatusChange = async (id, updatedPedido) => {
    setPedidos(pedidos.map((p) => (p.id === id ? updatedPedido : p)));
  };

  if (loading) return <div className="text-white">Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        <Link to="/pedidos/novo">
          <Button>Novo Pedido</Button>
        </Link>
      </div>
      {pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidos.map((pedido) => (
            <CardPedido key={pedido.id} pedido={pedido} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Pedidos;