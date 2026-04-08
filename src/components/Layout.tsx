import React, { useState, useEffect } from 'react';
import { 
  Calendar, Bell, History, Menu, X, LogOut, ChevronDown, Shield, Settings,
  Home, Users, CalendarDays, MessageSquare, UserCircle, TestTube
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import OnboardingTour from './OnboardingTour';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadErrors, setUnreadErrors] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Visão Geral' },
    { path: '/crm', icon: Users, label: 'Carteira (CRM)' },
    { path: '/eventos', icon: CalendarDays, label: 'Pauta Geral' },
    { path: '/historico', icon: History, label: 'Log de Envios' },
    { path: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
    { path: '/testes', icon: TestTube, label: 'Laboratório de Testes' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' }
  ];

  useEffect(() => {
    fetchGlobalStats();
  }, [location.pathname]);

  const fetchGlobalStats = async () => {
    try {
      const res = await api.get('/api/notifications/logs');
      const errors = res.data.filter((l: any) => l.status_envio === 'ERRO').length;
      setUnreadErrors(errors);
    } catch { /* ignore */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#EFEDE8] flex font-sans overflow-hidden">
      <OnboardingTour />
      
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1F3645]/60 z-40 md:hidden backdrop-blur-md"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-br from-[#2F4858] to-[#1F3645] text-white transition-all duration-500 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static flex flex-col shadow-2xl border-r border-white/5
      `}>
        <div className="h-24 flex items-center justify-between px-8 border-b border-white/10">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B69B74] to-[#D4B991] flex items-center justify-center shadow-lg shadow-[#B69B74]/30">
              <Shield className="w-6 h-6 text-[#1F3645]" />
            </div>
            <span className="text-2xl font-black font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              SimJuris
            </span>
          </motion.div>
          <button className="md:hidden text-blue-200 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav id="sidebar-nav" className="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const itemIds: Record<string, string> = {
              '/': 'nav-dashboard',
              '/crm': 'nav-crm',
              '/eventos': 'nav-eventos',
              '/historico': 'nav-historico',
              '/whatsapp': 'nav-whatsapp',
              '/testes': 'nav-testes',
              '/configuracoes': 'nav-configuracoes'
            };

            return (
                <motion.div
                  key={item.path}
                  id={itemIds[item.path]}
                  initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-white/10 text-[#B69B74] shadow-lg border border-white/10' 
                      : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute left-0 inset-y-0 w-1 bg-[#B69B74] rounded-r-full"
                    />
                  )}
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[#B69B74]' : ''}`} />
                  <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-blue-200 hover:bg-[#6E3E3E]/10 hover:text-red-300 rounded-2xl transition-all duration-300 text-sm font-bold group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Background Decorative Blur */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#2F4858]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#B69B74]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Topbar glassmorphism */}
        <header className="h-24 glass border-b border-[#2F4858]/5 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-[#2F4858] rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex flex-col">
              <h1 className="text-xl font-bold text-[#2F4858] leading-tight">Mesa de Trabalho</h1>
              <p className="text-xs font-semibold text-gray-400 flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3 text-[#B69B74]" />
                {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              id="notification-bell"
              onClick={() => navigate('/historico')}
              className="relative p-3 text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100 hover:text-[#2F4858] hover:shadow-md transition-all duration-300 group"
            >
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {unreadErrors > 0 && (
                <span className="absolute top-2.5 right-3 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[8px] font-black text-white flex items-center justify-center">
                  {unreadErrors > 9 ? '9+' : unreadErrors}
                </span>
              )}
            </button>
            
            <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
            
            <div className="relative" id="profile-menu">
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-4 cursor-pointer hover:bg-white/50 p-2 pr-4 rounded-2xl transition-all group border border-transparent hover:border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl bg-super-light bg-gradient-to-br from-[#2F4858] to-[#1F3645] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-900/20">
                  {user?.nome?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-[#2F4858] leading-tight">{user?.nome || 'Advogado'}</p>
                  <p className="text-[10px] text-[#B69B74] font-bold uppercase tracking-widest mt-1">Sócio / Admin</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#2F4858] transition-all duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-60 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-50 mb-2">
                       <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">Conta Conectada</p>
                       <p className="text-sm font-bold text-slate-600 truncate">{user?.email}</p>
                    </div>
                    <button 
                      onClick={() => { navigate('/configuracoes'); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      <UserCircle className="w-5 h-5 text-[#B69B74]" /> Meu Perfil
                    </button>
                    <button 
                      onClick={() => { navigate('/configuracoes'); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      <Settings className="w-5 h-5 text-[#B69B74]" /> Configurações
                    </button>
                    <div className="h-px bg-gray-50 my-2"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <LogOut className="w-5 h-5" /> Sair com Segurança
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Viewport with Framer Motion integration */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar z-0 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-7xl mx-auto pb-20"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
