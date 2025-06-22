import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-primary text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">Na Chapa</h1>
      </div>
      {user && (
        <div className="flex items-center space-x-4">
          <span>{user.username}</span>
          <button onClick={handleLogout} className="text-white">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;