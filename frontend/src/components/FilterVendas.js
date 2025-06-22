import { useForm } from 'react-hook-form';
import Button from './Button';

function FilterVendas({ onFilter }) {
  const { register, handleSubmit } = useForm();

  const submitFilter = (data) => {
    onFilter({
      inicio: data.inicio,
      fim: data.fim,
      tipo: data.tipo || undefined,
      status: data.status || undefined,
      clienteNome: data.clienteNome || undefined,
      clienteTelefone: data.clienteTelefone || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submitFilter)} className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2">Filtro de Vendas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1">Início</label>
          <input
            type="date"
            {...register('inicio', { required: true })}
            className="p-2 bg-gray-700 rounded text-white w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Fim</label>
          <input
            type="date"
            {...register('fim', { required: true })}
            className="p-2 bg-gray-700 rounded text-white w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Tipo</label>
          <select {...register('tipo')} className="p-2 bg-gray-700 rounded text-white w-full">
            <option value="">Todos</option>
            <option value="balcao">Balcão</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select {...register('status')} className="p-2 bg-gray-700 rounded text-white w-full">
            <option value="">Todos</option>
            <option value="em_preparacao">Em Preparação</option>
            <option value="pronto">Pronto</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Nome do Cliente</label>
          <input
            {...register('clienteNome')}
            placeholder="Ex.: João"
            className="p-2 bg-gray-700 rounded text-white w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Telefone do Cliente</label>
          <input
            {...register('clienteTelefone')}
            placeholder="Ex.: 11987654321"
            className="p-2 bg-gray-700 rounded text-white w-full"
          />
        </div>
      </div>
      <Button type="submit">Filtrar</Button>
    </form>
  );
}

export default FilterVendas;