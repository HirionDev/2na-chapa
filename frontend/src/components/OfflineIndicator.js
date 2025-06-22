import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi, faSync } from '@fortawesome/free-solid-svg-icons';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-2 rounded-lg text-white flex items-center space-x-2">
      {isOnline ? (
        <>
          <FontAwesomeIcon icon={faWifi} className="text-green-500" />
          <span>Online</span>
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faWifi} className="text-red-500" />
          <span>Offline</span>
        </>
      )}
      {isSyncing && (
        <FontAwesomeIcon icon={faSync} className="animate-spin text-yellow-500" />
      )}
    </div>
  );
}

export default OfflineIndicator;