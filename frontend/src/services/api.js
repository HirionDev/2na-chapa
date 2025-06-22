import axios from 'axios';
import { VITE_API_URL, VITE_USE_MOCK } from '../../tests/__mocks__/viteEnv';

const api = axios.create({
  baseURL: VITE_API_URL || 'http://localhost:3001/api',
});

const mockData = {
  '/auth/login': {
    token: 'mock-token',
    usuario: { id: 1, username: 'admin', role: 'admin' },
  },
  '/pedidos': [
    {
      id: 1,
      clienteNome: 'João',
      total: 41.80,
      status: 'em_preparacao',
      pagamento: 'pendente',
      itens: [{ item: { nome: 'Hambúrguer' }, quantidade: 2 }],
      criadoEm: new Date().toISOString(),
    },
  ],
  '/cardapio/itens': [
    { id: 1, nome: 'Hambúrguer', preco: 20.90, categoria: { nome: 'Lanches' }, ativo: true },
    { id: 2, nome: 'Batata Frita', preco: 10.90, categoria: { nome: 'Acompanhamentos' }, ativo: true },
  ],
  '/cardapio/combos': [
    { id: 1, nome: 'Combo 1', preco: 35.90, categoria: { nome: 'Combos' }, ativo: true },
  ],
  '/vendas': {
    vendas: [
      { id: 1, clienteNome: 'João', total: 41.80, criadoEm: new Date().toISOString() },
    ],
    estatisticas: {
      totalVendas: 41.80,
      totalPedidos: 1,
      itensMaisVendidos: [{ nome: 'Hambúrguer', quantidade: 2 }],
      vendasPorDia: [{ data: new Date().toISOString().split('T')[0], total: 41.80 }],
      vendasPorTipo: [{ tipo: 'balcao', total: 41.80 }],
    },
  },
  '/configuracoes': [
    { chave: 'impressora_endereco', valor: 'USB' },
    { chave: 'whatsapp_numero', valor: '+5511999999999' },
    { chave: 'horario_funcionamento', valor: '10:00-22:00' },
  ],
  '/categorias': [
    { id: 1, nome: 'Lanches' },
    { id: 2, nome: 'Acompanhamentos' },
    { id: 3, nome: 'Combos' },
  ],
};

api.interceptors.request.use((config) => {
  if (VITE_USE_MOCK === 'true' || !navigator.onLine) {
    return Promise.reject({ config, isMock: true });
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.isMock) {
      const mockResponse = mockData[error.config.url] || { error: 'Mock não encontrado' };
      return Promise.resolve({ data: mockResponse });
    }
    return Promise.reject({ message: 'Servidor indisponível. Usando dados mockados.' });
  }
);

export default api;