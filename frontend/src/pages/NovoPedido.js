import FormPedido from '../components/FormPedido';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function NovoPedido() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (pedido) => {
    try {
      await api.post('/pedidos', pedido);
      navigate('/pedidos');
    } catch (error) {
      setError('Erro ao criar pedido');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Novo Pedido</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <FormPedido onSubmit={handleSubmit} />
    </div>
  );
}

export default NovoPedido;