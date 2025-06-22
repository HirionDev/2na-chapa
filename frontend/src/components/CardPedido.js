import Button from './Button';
import api from '../services/api';

function CardPedido({ pedido, onStatusChange }) {
  const handlePrint = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.printOrder(pedido.id);
        if (result.success) {
          alert('Impressão enviada!');
        } else {
          alert(`Erro ao imprimir: ${result.error}`);
        }
      } else {
        alert('Impressão enviada (mock)!');
      }
    } catch (error) {
      alert('Erro ao enviar impressão');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await api.put(`/pedidos/${id}/status`, { status });
      if (status === 'pronto' && window.electronAPI) {
        window.electronAPI.showNotification({
          title: `Pedido #${id} Pronto`,
          body: `O pedido de ${pedido.clienteNome} está pronto!`,
        });
      }
      onStatusChange(id, response.data);
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold">Pedido #{pedido?.id || 'N/A'}</h3>
      <p>Cliente: {pedido?.clienteNome || 'Anônimo'}</p>
      <p>Status: {pedido?.status || 'Em preparação'}</p>
      <p>Pagamento: {pedido?.pagamento || 'Pendente'}</p>
      <p>Total: R${pedido?.total?.toFixed(2) || '0.00'}</p>
      <div className="mt-2">
        <p className="font-semibold">Itens:</p>
        <ul className="list-disc pl-5">
          {(pedido?.itens || []).map((item, index) => (
            <li key={index}>{item?.item?.nome} x{item?.quantidade}</li>
          ))}
          {(pedido?.combos || []).map((combo, index) => (
            <li key={index}>{combo?.combo?.nome} x{combo?.quantidade}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex space-x-2">
        <Button onClick={() => handleStatusChange(pedido.id, 'pronto')} variant="secondary">Marcar como Pronto</Button>
        <Button onClick={() => handleStatusChange(pedido.id, 'cancelado')}>Cancelar</Button>
        <Button onClick={handlePrint}>Imprimir</Button>
      </div>
    </div>
  );
}

export default CardPedido;