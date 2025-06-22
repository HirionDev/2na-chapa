import { useState, useEffect } from 'react';
import CardPedido from '../components/CardPedido';
import api from '../services/api';
import { connectWebSocket } from '../services/websocket';

function StatusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/pedidos')
      .then((response) => {
        setPedidos(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Erro ao carregar pedidos');
        setLoading(false);
      });

    const disconnect = connectWebSocket((message) => {
      console.log('WebSocket message:', message);
    });

    return disconnect;
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const response = await api.put(`/pedidos/${id}/status`, { status });
      setPedidos(pedidos.map((p) => (p.id === id ? response.data : p)));
    } catch (error) {
      setError('Erro ao atualizar status');
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Status de Pedidos</h2>
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

export default StatusPedidos;