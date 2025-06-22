import { useState, useEffect } from 'react';
import CardItemCardapio from '../components/CardItemCardapio';
import api from '../services/api';

function Cardapio() {
  const [itens, setItens] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/cardapio/itens'),
      api.get('/cardapio/combos'),
    ])
      .then(([itensResponse, combosResponse]) => {
        setItens(itensResponse.data);
        setCombos(combosResponse.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Erro ao carregar cardápio');
        setLoading(false);
      });
  }, []);

  const handleAdd = (item) => {
    console.log('Adicionar item:', item);
    // Placeholder: Implementar adição ao pedido
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Cardápio</h2>
      <h3 className="text-xl font-bold mb-2">Itens</h3>
      {itens.length === 0 ? (
        <p>Nenhum item encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {itens.map((item) => (
            <CardItemCardapio key={item.id} item={item} onAdd={handleAdd} />
          ))}
        </div>
      )}
      <h3 className="text-xl font-bold mb-2">Combos</h3>
      {combos.length === 0 ? (
        <p>Nenhum combo encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {combos.map((combo) => (
            <CardItemCardapio key={combo.id} item={combo} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Cardapio;