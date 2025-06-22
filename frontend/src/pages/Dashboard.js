import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import api from '../services/api';

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.post('/vendas', {
          inicio: new Date().toISOString().split('T')[0],
          fim: new Date().toISOString().split('T')[0],
        });
        setData(response.data.estatisticas.vendasPorDia);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-white">Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-2">Vendas por Dia</h3>
        <BarChart width={600} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#FBBF24" />
        </BarChart>
      </div>
    </div>
  );
}

export default Dashboard;