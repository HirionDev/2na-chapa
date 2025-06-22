import { useForm } from 'react-hook-form';
import Button from './Button';
import api from '../services/api';
import { useState, useEffect } from 'react';

function FormPedido({ onSubmit }) {
  const { register, handleSubmit, reset } = useForm();
  const [itens, setItens] = useState([]);
  const [combos, setCombos] = useState([]);
  const [selectedItens, setSelectedItens] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState([]);
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

  const addItem = (itemId, quantidade) => {
    const item = itens.find((i) => i.id === parseInt(itemId));
    if (item && quantidade > 0) {
      setSelectedItens([...selectedItens, { itemId: item.id, quantidade, nome: item.nome, preco: item.preco }]);
    }
  };

  const addCombo = (comboId, quantidade) => {
    const combo = combos.find((c) => c.id === parseInt(comboId));
    if (combo && quantidade > 0) {
      setSelectedCombos([...selectedCombos, { comboId: combo.id, quantidade, nome: combo.nome, preco: combo.preco }]);
    }
  };

  const removeItem = (index) => {
    setSelectedItens(selectedItens.filter((_, i) => i !== index));
  };

  const removeCombo = (index) => {
    setSelectedCombos(selectedCombos.filter((_, i) => i !== index));
  };

  const submitForm = (data) => {
    const pedido = {
      clienteNome: data.clienteNome,
      telefone: data.telefone,
      itens: selectedItens.map((i) => ({ itemId: i.itemId, quantidade: i.quantidade })),
      combos: selectedCombos.map((c) => ({ comboId: c.comboId, quantidade: c.quantidade })),
      tipo: data.tipo,
      observacoes: data.observacoes,
    };
    onSubmit(pedido);
    reset();
    setSelectedItens([]);
    setSelectedCombos([]);
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <form onSubmit={handleSubmit(submitForm)} className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">Novo Pedido</h3>
      <div className="mb-4">
        <label className="block mb-1">Nome do Cliente</label>
        <input
          {...register('clienteNome', { required: true })}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Telefone</label>
        <input
          {...register('telefone')}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Tipo</label>
        <select
          {...register('tipo', { required: true })}
          className="w-full p-2 bg-gray-700 rounded text-white"
        >
          <option value="balcao">Balcão</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Adicionar Item</label>
        <div className="flex space-x-2">
          <select
            className="p-2 bg-gray-700 rounded text-white"
            onChange={(e) => addItem(e.target.value, 1)}
          >
            <option value="">Selecione um item</option>
            {itens.map((item) => (
              <option key={item.id} value={item.id}>{item.nome}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Adicionar Combo</label>
        <div className="flex space-x-2">
          <select
            className="p-2 bg-gray-700 rounded text-white"
            onChange={(e) => addCombo(e.target.value, 1)}
          >
            <option value="">Selecione um combo</option>
            {combos.map((combo) => (
              <option key={combo.id} value={combo.id}>{combo.nome}</option>
            ))}
          </select>
        </div>
      </div>
      {(selectedItens.length > 0 || selectedCombos.length > 0) && (
        <div className="mb-4">
          <p className="font-semibold">Selecionados:</p>
          <ul className="list-disc pl-5">
            {selectedItens.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.nome} x{item.quantidade}</span>
                <button onClick={() => removeItem(index)} className="text-red-500">Remover</button>
              </li>
            ))}
            {selectedCombos.map((combo, index) => (
              <li key={index} className="flex justify-between">
                <span>{combo.nome} x{combo.quantidade}</span>
                <button onClick={() => removeCombo(index)} className="text-red-500">Remover</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mb-4">
        <label className="block mb-1">Observações</label>
        <textarea
          {...register('observacoes')}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <Button type="submit">Criar Pedido</Button>
    </form>
  );
}

export default FormPedido;