import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import EventosPage from './pages/EventosPage';
import ContactosPage from './pages/ContactosPage';
import TareasPage from './pages/TareasPage';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactElement, isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente de navegación
const NavBar: React.FC<{ userName: string, onLogout: () => void }> = ({ userName, onLogout }) => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">📅 Mi Agenda</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/eventos"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition"
            >
              📅 Eventos
            </Link>
            <Link
              to="/contactos"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition"
            >
              👥 Contactos
            </Link>
            <Link
              to="/tareas"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition"
            >
              ✅ Tareas
            </Link>
            <div className="border-l border-gray-300 pl-4 ml-4 flex items-center space-x-3">
              <span className="text-sm text-gray-600">👤 {userName}</span>
              <button
                onClick={onLogout}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Verificar si hay una sesión activa al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');

    if (token && storedUserId && storedUserName) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
      setUserName(storedUserName);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token: string, userId: string, userName: string) => {
    setIsAuthenticated(true);
    setUserId(userId);
    setUserName(userName);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserId(null);
    setUserName('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isAuthenticated && <NavBar userName={userName} onLogout={handleLogout} />}

        <main className={isAuthenticated ? "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" : ""}>
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/eventos" /> : <AuthPage onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? <Navigate to="/eventos" /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/eventos" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <EventosPage usuarioId={userId!} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contactos" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ContactosPage usuarioId={userId!} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tareas" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <TareasPage usuarioId={userId!} />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
