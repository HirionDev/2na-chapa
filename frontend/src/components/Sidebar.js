import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faList, faPlus, faUtensils, faChartBar, faCog, faComment } from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
  return (
    <aside className="bg-gray-800 w-64 h-screen p-4">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/dashboard" className="flex items-center text-white p-2 hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/pedidos" className="flex items-center text-white p-2 hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faList} className="mr-2" />
              Pedidos
            </Link>
          </li>
          <li>
            <Link to="/pedidos/novo" className="flex items-center text-white p-2 hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Novo Pedido
            </Link>
          </li>
          <li>
            <Link to="/cardapio" className="flex items-center text-white p-2 hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faUtensils} className="mr-2" />
              Cardápio
            </Link>
          </li>
          <li>
            <Link to="/vendas" className="flex items-center text-white p-2 hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faChartBar} className="mr-2" />
              Vendas
            </Link>
          </li>
          <li>
            <Link to="/configuracoes" className="flex items-center text-white p-2 hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faCog} className="mr-2" />
              Configurações
            </Link>
          </li>
          <li>
            <Link to="/whatsapp" className="flex items-center text-white p-2 hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faComment} className="mr-2" />
              WhatsApp
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;