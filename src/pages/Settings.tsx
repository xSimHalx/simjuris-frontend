import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Building2, Save, Globe, CheckCircle, AlertCircle
} from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'perfil' | 'escritorio';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('perfil');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Estados Perfil
  const [perfil, setPerfil] = useState({ nome: '', email: '', password: '', confirmPassword: '' });
  
  // Estados Escritório
  const [tenant, setTenant] = useState({ 
    nome_fantasia: '', 
    google_maps_link: '', 
    evolution_instance_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, tenantRes] = await Promise.all([
        api.get('/api/users/me'),
        api.get('/api/tenant')
      ]);
      setPerfil({ ...perfil, nome: userRes.data.nome, email: userRes.data.email });
      setTenant(tenantRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.patch('/api/users/profile', {
        nome: perfil.nome,
        email: perfil.email
      });
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTenant = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.patch('/api/tenant', {
        nome_fantasia: tenant.nome_fantasia,
        google_maps_link: tenant.google_maps_link
      });
      setSuccess('Configurações atualizadas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent bg-white/50 focus:border-[#B69B74]/50 focus:bg-white focus:ring-4 focus:ring-[#B69B74]/10 transition-all outline-none font-semibold text-slate-700 placeholder:text-slate-300";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <div className="flex items-center gap-4 mb-2">
           <div className="w-10 h-10 bg-[#2F4858] rounded-xl flex items-center justify-center shadow-lg"><Shield className="w-6 h-6 text-[#B69B74]" /></div>
           <h1 className="text-4xl font-black text-[#2F4858] font-display italic">SimJuris</h1>
        </div>
        <p className="text-[#B69B74] font-bold text-sm uppercase tracking-[0.2em] opacity-80 ml-14">Ecossistema SimHal de Gestão Jurídica</p>
      </header>

      {/* Tabs Navigation */}
      <div className="flex p-1.5 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm w-fit">
        {[
          { id: 'perfil', label: 'Meu Perfil', icon: User },
          { id: 'escritorio', label: 'Escritório', icon: Building2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`
              flex items-center gap-2 px-6 py-3.5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-[#2F4858] text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feedback Banners */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl font-bold text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5" /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'perfil' && (
            <motion.form key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleUpdatePerfil} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input type="text" value={perfil.nome} onChange={e => setPerfil({...perfil, nome: e.target.value})} className={inputCls} placeholder="Seu nome" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">E-mail de Acesso</label>
                  <div className="relative"><Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" /><input type="email" value={perfil.email} onChange={e => setPerfil({...perfil, email: e.target.value})} className={inputCls} /></div>
                </div>
              </div>
              <div className="flex justify-end pt-8 mt-10 border-t border-slate-100">
                <button type="submit" disabled={loading} className="px-10 py-4 bg-[#2F4858] text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#1F3645] transition-all">
                  {loading ? 'Processando...' : <><Save className="w-5 h-5" /> Salvar Perfil</>}
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'escritorio' && (
            <motion.form key="escritorio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleUpdateTenant} className="space-y-8 relative z-10">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome Fantasia do Escritório</label>
                  <div className="relative"><Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" /><input type="text" value={tenant.nome_fantasia} onChange={e => setTenant({...tenant, nome_fantasia: e.target.value})} className={inputCls} /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">Link de Avaliação Google Maps</label>
                  <div className="relative"><Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" /><input type="text" value={tenant.google_maps_link || ''} onChange={e => setTenant({...tenant, google_maps_link: e.target.value})} className={inputCls} /></div>
                </div>
              </div>
              <div className="flex justify-end pt-8 mt-10 border-t border-slate-100">
                <button type="submit" disabled={loading} className="px-10 py-4 bg-[#B69B74] text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl">
                  {loading ? 'Gravando...' : <><Save className="w-5 h-5" /> Atualizar Escritório</>}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Settings;
