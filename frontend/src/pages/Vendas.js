import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FilterVendas from '../components/FilterVendas';
import api from '../services/api';
import Button from '../components/Button';
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset } = useForm();

  const handleFilter = async (filtro) => {
    setLoading(true);
    try {
      const response = await api.post('/vendas', filtro);
      setVendas(response.data.vendas);
      setEstatisticas(response.data.estatisticas);
      setLoading(false);
    } catch (err) {
      setError('Erro ao filtrar vendas');
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (filtro) => {
    try {
      const response = await api.post('/vendas/relatorio/pdf', filtro, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setError('Erro ao baixar PDF');
    }
  };

  const handleDownloadExcel = async (filtro) => {
    try {
      const response = await api.post('/vendas/relatorio/excel', filtro, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setError('Erro ao baixar Excel');
    }
  };

  const COLORS = ['#FBBF24', '#F97316', '#000000', '#FFFFFF'];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vendas</h2>
      <FilterVendas onFilter={handleFilter} />
      <div className="mt-4 flex space-x-4">
        <Button onClick={() => handleDownloadPDF(estatisticas ? { inicio: vendas[0]?.criadoEm, fim: vendas[vendas.length - 1]?.criadoEm } : {})}>
          Baixar Relatório PDF
        </Button>
        <Button onClick={() => handleDownloadExcel(estatisticas ? { inicio: vendas[0]?.criadoEm, fim: vendas[vendas.length - 1]?.criadoEm } : {})}>
          Baixar Relatório Excel
        </Button>
      </div>
      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {estatisticas && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Resumo</h3>
          <p>Total de Vendas: R${estatisticas.totalVendas.toFixed(2)}</p>
          <p>Total de Pedidos: {estatisticas.totalPedidos}</p>
          <div className="mt-4">
            <h4 className="text-md font-bold">Vendas por Dia</h4>
            <LineChart width={600} height={300} data={estatisticas.vendasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#FBBF24" name="Total (R$)" />
              <Line type="monotone" dataKey="pedidos" stroke="#F97316" name="Pedidos" />
            </LineChart>
          </div>
          <div className="mt-4">
            <h4 className="text-md font-bold">Distribuição por Tipo</h4>
            <PieChart width={400} height={300}>
              <Pie data={estatisticas.vendasPorTipo} dataKey="total" nameKey="tipo" cx="50%" cy="50%" outerRadius={100}>
                {estatisticas.vendasPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
          <div className="mt-4">
            <h4 className="text-md font-bold">Itens Mais Vendidos</h4>
            <BarChart width={600} height={300} data={estatisticas.itensMaisVendidos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#FBBF24" name="Quantidade" />
              <Bar dataKey="total" fill="#F97316" name="Total (R$)" />
            </BarChart>
          </div>
        </div>
      )}
      <div className="mt-4">
        {vendas.length === 0 ? (
          <p>Nenhuma venda encontrada.</p>
        ) : (
          <ul className="space-y-2">
            {vendas.map((venda) => (
              <li key={venda.id} className="bg-gray-800 p-4 rounded-lg">
                Pedido #{venda.id} - R${venda.total.toFixed(2)} - {new Date(venda.criadoEm).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Vendas;