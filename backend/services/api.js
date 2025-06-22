import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Dados mockados para teste
const mockData = {
  '/auth/login': {
    token: 'mock-token',
    usuario: { id: 1, username: 'admin', role: 'admin' },
  },
  '/pedidos': [
    { id: 1, clienteNome: 'João', total: 41.80, status: 'em_preparacao', itens: [{ item: { nome: 'Hambúrguer' }, quantidade: 2 }] },
  ],
  '/cardapio/itens': [
    { id: 1, nome: 'Hambúrguer', preco: 20.90, categoria: { nome: 'Lanches' } },
  ],
  '/cardapio/combos': [
    { id: 1, nome: 'Combo 1', preco: 35.90, categoria: { nome: 'Combos' } },
  ],
};

// Interceptor para mockar respostas
api.interceptors.request.use((config) => {
  if (!navigator.onLine || import.meta.env.VITE_USE_MOCK === 'true') {
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
    console.error('Erro na API:', error);
    return Promise.reject({ message: 'Erro ao conectar com o servidor. Tente novamente.' });
  }
);

export default api;