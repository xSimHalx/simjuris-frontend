import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Instances from './pages/Instances';
import History from './pages/History';
import CRM from './pages/CRM';
import Settings from './pages/Settings';
import Tests from './pages/Tests';

// Componente para proteger rotas privadas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEDE8]">
        <div className="w-12 h-12 border-4 border-[#B69B74] border-t-legal-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/eventos" element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/whatsapp" element={<PrivateRoute><Instances /></PrivateRoute>} />
          <Route path="/historico" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/crm" element={<PrivateRoute><CRM /></PrivateRoute>} />
          <Route path="/configuracoes" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/testes" element={<PrivateRoute><Tests /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};


export default App;
