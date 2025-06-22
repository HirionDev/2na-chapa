import Button from './Button';

function CardItemCardapio({ item, onAdd }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center">
      <img src={item?.imagem || '/assets/images/placeholder.png'} alt={item?.nome} className="w-32 h-32 object-cover rounded mb-2" />
      <h3 className="text-lg font-bold">{item?.nome || 'Item'}</h3>
      <p>R${item?.preco?.toFixed(2) || '0.00'}</p>
      <Button onClick={() => onAdd(item)} className="mt-2">Adicionar</Button>
    </div>
  );
}

export default CardItemCardapio;