import { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

function WhatsApp() {
  const [qrCode, setQRCode] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/whatsapp/status');
        setIsConnected(response.data.isConnected);
        if (!response.data.isConnected) {
          const qrResponse = await api.get('/whatsapp/qr');
          if (qrResponse.data.qrCode) {
            setQRCode(qrResponse.data.qrCode);
          } else {
            setError('QR Code não disponível. Tente novamente em alguns segundos.');
          }
        }
        setLoading(false);
      } catch (err) {
        setError('Erro ao verificar status do WhatsApp. Verifique se o módulo AI está ativo.');
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Integração com WhatsApp</h2>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-2">Status: {isConnected ? 'Conectado' : 'Desconectado'}</h3>
        {!isConnected && qrCode && (
          <div className="mb-4">
            <p>Escaneie o QR Code com o WhatsApp:</p>
            <img src={qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
          </div>
        )}
        {isConnected && (
          <p className="text-green-500">WhatsApp pronto para receber mensagens!</p>
        )}
      </div>
    </div>
  );
}

export default WhatsApp;