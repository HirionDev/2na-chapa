import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineIndicator from './components/OfflineIndicator';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import NovoPedido from './pages/NovoPedido';
import StatusPedidos from './pages/StatusPedidos';
import Cardapio from './pages/Cardapio';
import Vendas from './pages/Vendas';
import Configuracoes from './pages/Configuracoes';
import WhatsApp from './pages/WhatsApp';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useEffect } from 'react';
import { startSync } from './services/syncService';

function App() {
  useEffect(() => {
    if (process.env.VITE_USE_MOCK !== 'true') {
      startSync();
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/*"
            element={
              <div className="flex h-screen bg-primary text-white">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1 p-6 overflow-auto">
                    <Routes>
                      <Route
                        path="/dashboard"
                        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                      />
                      <Route
                        path="/pedidos"
                        element={<ProtectedRoute><Pedidos /></ProtectedRoute>}
                      />
                      <Route
                        path="/pedidos/novo"
                        element={<ProtectedRoute><NovoPedido /></ProtectedRoute>}
                      />
                      <Route
                        path="/pedidos/status"
                        element={<ProtectedRoute><StatusPedidos /></ProtectedRoute>}
                      />
                      <Route
                        path="/cardapio"
                        element={<ProtectedRoute><Cardapio /></ProtectedRoute>}
                      />
                      <Route
                        path="/vendas"
                        element={<ProtectedRoute><Vendas /></ProtectedRoute>}
                      />
                      <Route
                        path="/configuracoes"
                        element={<ProtectedRoute><Configuracoes /></ProtectedRoute>}
                      />
                      <Route
                        path="/whatsapp"
                        element={<ProtectedRoute><WhatsApp /></ProtectedRoute>}
                      />
                    </Routes>
                  </main>
                </div>
                <OfflineIndicator />
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;