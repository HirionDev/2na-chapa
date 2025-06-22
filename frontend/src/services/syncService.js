import api from './api';
import { getPedidosPendentes, updatePedidoStatus } from './offlineStorage';

const syncData = async () => {
  if (!navigator.onLine || import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('Offline ou modo mock: Sincronização adiada');
    return;
  }

  try {
    const pendentes = await getPedidosPendentes();
    for (const pedido of pendentes) {
      try {
        const response = await api.post('/pedidos', {
          clienteNome: pedido.clienteNome,
          telefone: pedido.telefone,
          itens: pedido.itens,
          combos: pedido.combos,
          tipo: pedido.tipo,
          observacoes: pedido.observacoes,
        });
        await updatePedidoStatus(pedido.localId, 'sincronizado', response.data.id);
        if (window.electronAPI) {
          window.electronAPI.showNotification({
            title: 'Sincronização Concluída',
            body: `Pedido #${pedido.localId} sincronizado com o servidor.`,
          });
        }
      } catch (error) {
        console.error('Erro ao sincronizar pedido:', error);
      }
    }

    const [itensResponse, combosResponse, categoriasResponse] = await Promise.all([
      api.get('/cardapio/itens'),
      api.get('/cardapio/combos'),
      api.get('/categorias'),
    ]);
    await saveCardapioOffline(itensResponse.data, combosResponse.data, categoriasResponse.data);

    const clientesResponse = await api.get('/clientes');
    for (const cliente of clientesResponse.data) {
      await saveClienteOffline(cliente);
    }
  } catch (error) {
    console.error('Erro na sincronização:', error);
    if (window.electronAPI) {
      window.electronAPI.showNotification({
        title: 'Erro na Sincronização',
        body: 'Não foi possível sincronizar os dados. Tente novamente mais tarde.',
      });
    }
  }
};

const startSync = () => {
  syncData();
  setInterval(syncData, 60000);
};

export { startSync, syncData };