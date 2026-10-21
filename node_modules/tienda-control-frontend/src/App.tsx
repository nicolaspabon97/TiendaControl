import React, { useState } from 'react';
import { Login } from './components/Login';
import { MasterDashboard } from './components/MasterDashboard';

export const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <MasterDashboard onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;