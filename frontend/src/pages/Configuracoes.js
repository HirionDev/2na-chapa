import { useForm } from 'react-hook-form';
import Button from '../components/Button';
import api from '../services/api';
import { useState, useEffect } from 'react';

function Configuracoes() {
  const { register, handleSubmit, reset } = useForm();
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/configuracoes')
      .then((response) => {
        const configMap = response.data.reduce((acc, { chave, valor }) => ({ ...acc, [chave]: valor }), {});
        setConfigs(configMap);
        reset(configMap);
        setLoading(false);
      })
      .catch((err) => {
        setError('Erro ao carregar configurações');
        setLoading(false);
      });
  }, [reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await Promise.all(
        Object.entries(data).map(([chave, valor]) =>
          api.post('/configuracoes', { chave, valor })
        )
      );
      setConfigs(data);
      alert('Configurações salvas!');
      setLoading(false);
    } catch (error) {
      setError('Erro ao salvar configurações');
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Configurações</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-2">Impressora Térmica</h3>
        <input
          {...register('impressora_endereco')}
          placeholder="Endereço da Impressora (ex.: 192.168.1.100:9100 ou USB)"
          className="w-full p-2 bg-gray-700 rounded text-white mb-4"
        />
        <h3 className="text-lg font-bold mb-2">WhatsApp</h3>
        <input
          {...register('whatsapp_numero')}
          placeholder="Número Opcional (ex.: +5511999999999)"
          className="w-full p-2 bg-gray-700 rounded text-white mb-4"
        />
        <h3 className="text-lg font-bold mb-2">Horário de Funcionamento</h3>
        <input
          {...register('horario_funcionamento')}
          placeholder="Ex.: 10:00-22:00"
          className="w-full p-2 bg-gray-700 rounded text-white mb-4"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </div>
  );
}

export default Configuracoes;