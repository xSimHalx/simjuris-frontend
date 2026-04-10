import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Building2, Save, Globe, CheckCircle, AlertCircle, Smartphone, Clock, PlusCircle, Trash2, Pencil, X
} from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumModal from '../components/PremiumModal';
import MaskedInput from '../components/MaskedInput';

type Tab = 'perfil' | 'escritorio' | 'personalizacao';

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
    evolution_instance_id: '',
    config_fluxos: [] as any[]
  });

  // Estado do Modal Premium
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'input';
    onConfirm: (val?: string) => void;
    defaultValue?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: () => {}
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
      setPerfil({ ...perfil, nome: userRes.data?.nome || '', email: userRes.data?.email || '' });
      setTenant({
        ...tenantRes.data,
        config_fluxos: tenantRes.data.config_fluxos || []
      });
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
        google_maps_link: tenant.google_maps_link,
        config_fluxos: tenant.config_fluxos
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
          { id: 'escritorio', label: 'Escritório', icon: Building2 },
          { id: 'personalizacao', label: 'Personalização', icon: Globe }
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
                <MaskedInput 
                  mask="none"
                  label="Nome Completo"
                  placeholder="Seu nome"
                  icon={<User />}
                  value={perfil.nome}
                  onChange={e => setPerfil({...perfil, nome: e.target.value})}
                />
                <MaskedInput 
                  mask="none"
                  label="E-mail de Acesso"
                  placeholder="seu@email.com"
                  icon={<Globe />}
                  type="email"
                  value={perfil.email}
                  onChange={e => setPerfil({...perfil, email: e.target.value})}
                />
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
                <MaskedInput 
                  mask="none"
                  label="Nome Fantasia do Escritório"
                  icon={<Building2 />}
                  value={tenant.nome_fantasia}
                  onChange={e => setTenant({...tenant, nome_fantasia: e.target.value})}
                />
                <MaskedInput 
                  mask="none"
                  label="Link de Avaliação Google Maps"
                  icon={<Globe />}
                  value={tenant.google_maps_link || ''}
                  onChange={e => setTenant({...tenant, google_maps_link: e.target.value})}
                />
              </div>
              <div className="flex justify-end pt-8 mt-10 border-t border-slate-100">
                <button type="submit" disabled={loading} className="px-10 py-4 bg-[#B69B74] text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl">
                  {loading ? 'Gravando...' : <><Save className="w-5 h-5" /> Atualizar Escritório</>}
                </button>
              </div>
            </motion.form>
          )}
          {activeTab === 'personalizacao' && (
            <div className="space-y-12 relative z-10">
              
              <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-black text-[#2F4858]">Fluxos de Trabalho</h2>
                   <p className="text-xs text-[#B69B74] font-bold uppercase tracking-widest">Gerencie as naturezas e regras do seu escritório</p>
                </div>
                <button 
                  onClick={() => {
                    setModal({
                      isOpen: true,
                      title: 'Nova Natureza',
                      message: 'Informe o nome para o novo fluxo de trabalho do escritório.',
                      type: 'input',
                      defaultValue: '',
                      onConfirm: (nome) => {
                        if (nome) {
                          setTenant({
                            ...tenant, 
                            config_fluxos: [
                              ...tenant.config_fluxos, 
                              { 
                                id: Date.now().toString(), 
                                nome: nome.toUpperCase(), 
                                tipos: [
                                  { nome: 'PRAZO', sub_label: 'Instância', sub_items: [] },
                                  { nome: 'AUDIÊNCIA', sub_label: 'Tipo de Audiência', sub_items: [] }
                                ]
                              }
                            ]
                          });
                        }
                        setModal(m => ({ ...m, isOpen: false }));
                      }
                    });
                  }}
                  className="px-6 py-3 bg-[#2F4858] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:brightness-110"
                >
                  <PlusCircle className="w-4 h-4 text-[#B69B74]" /> Novo Fluxo
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                {tenant.config_fluxos.map((fluxo, fIdx) => (
                  <motion.div key={fluxo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 rounded-[2.5rem] border border-white/60 space-y-8 flex flex-col shadow-sm hover:shadow-xl transition-all relative group">
                    
                    <button 
                      onClick={() => {
                        setModal({
                          isOpen: true,
                          title: 'Excluir Natureza',
                          message: `Tem certeza que deseja remover o fluxo "${fluxo.nome}"? Esta ação não pode ser desfeita.`,
                          type: 'confirm',
                          onConfirm: () => {
                            setTenant({...tenant, config_fluxos: tenant.config_fluxos.filter(f => f.id !== fluxo.id)});
                            setModal(m => ({ ...m, isOpen: false }));
                          }
                        });
                      }}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <input 
                          value={fluxo.nome} 
                          onChange={(e) => {
                            const newFluxos = [...tenant.config_fluxos];
                            newFluxos[fIdx].nome = e.target.value.toUpperCase();
                            setTenant({...tenant, config_fluxos: newFluxos});
                          }}
                          className="text-xl font-black text-[#2F4858] bg-transparent border-none p-0 outline-none w-full"
                        />
                        <p className="text-[9px] text-[#B69B74] font-black uppercase tracking-widest">Estrutura de Natureza</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Tipos dentro do Fluxo */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipos de Compromisso & Sub-Categorias</label>
                        <div className="space-y-4">
                          {fluxo.tipos.map((t: any, tIdx: number) => (
                            <div key={tIdx} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3 group-relative">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <input 
                                    className="text-[11px] font-black text-[#2F4858] bg-transparent outline-none w-32 border-b border-transparent focus:border-indigo-200"
                                    value={t.nome}
                                    onChange={(e) => {
                                      const newFluxos = [...tenant.config_fluxos];
                                      newFluxos[fIdx].tipos[tIdx].nome = e.target.value.toUpperCase();
                                      setTenant({...tenant, config_fluxos: newFluxos});
                                    }}
                                  />
                                  <span className="text-[8px] font-black text-[#B69B74] uppercase tracking-tighter italic">Compromisso</span>
                                </div>
                                <button onClick={() => {
                                  setModal({
                                    isOpen: true,
                                    title: 'Remover Compromisso',
                                    message: `Deseja excluir "${t.nome}" deste fluxo? Isso removerá as configurações de sub-categoria dele.`,
                                    type: 'confirm',
                                    onConfirm: () => {
                                      const newFluxos = [...tenant.config_fluxos];
                                      newFluxos[fIdx].tipos = fluxo.tipos.filter((_: any, i: number) => i !== tIdx);
                                      setTenant({...tenant, config_fluxos: newFluxos});
                                      setModal(m => ({ ...m, isOpen: false }));
                                    }
                                  });
                                }} className="text-slate-300 hover:text-red-500">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Configuração de Itens Isolados deste Tipo */}
                              <div className="pl-4 border-l-2 border-indigo-100 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Pencil className="w-3 h-3 text-indigo-400" />
                                  <input 
                                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-transparent outline-none w-full"
                                    value={t.sub_label}
                                    onChange={(e) => {
                                      const newFluxos = [...tenant.config_fluxos];
                                      newFluxos[fIdx].tipos[tIdx].sub_label = e.target.value;
                                      setTenant({...tenant, config_fluxos: newFluxos});
                                    }}
                                  />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {t.sub_items.map((item: string, iIdx: number) => (
                                    <span key={iIdx} className="flex items-center gap-2 px-2.5 py-1 bg-white rounded-lg text-[9px] font-bold text-[#2F4858] border border-slate-200 group-hover:bg-slate-50">
                                      {item}
                                      <button onClick={() => {
                                        const newFluxos = [...tenant.config_fluxos];
                                        newFluxos[fIdx].tipos[tIdx].sub_items = t.sub_items.filter((_: any, i: number) => i !== iIdx);
                                        setTenant({...tenant, config_fluxos: newFluxos});
                                      }} className="text-slate-300 hover:text-red-500">
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                  <input 
                                    className="text-[9px] font-bold text-indigo-400 outline-none bg-transparent w-24 placeholder:text-indigo-200"
                                    placeholder="+ Sub-opção"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const val = (e.target as HTMLInputElement).value.trim();
                                        if (val && !t.sub_items.includes(val)) {
                                          const newFluxos = [...tenant.config_fluxos];
                                          newFluxos[fIdx].tipos[tIdx].sub_items = [...t.sub_items, val];
                                          setTenant({...tenant, config_fluxos: newFluxos});
                                          (e.target as HTMLInputElement).value = '';
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button 
                          onClick={() => {
                            const newFluxos = [...tenant.config_fluxos];
                            newFluxos[fIdx].tipos.push({ nome: 'NOVO TIPO', sub_label: 'Etapa/Fase', sub_items: [] });
                            setTenant({...tenant, config_fluxos: newFluxos});
                          }}
                          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-400 transition-all mt-4"
                        >
                          + Adicionar Tipo ao Fluxo {fluxo.nome}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                 <button onClick={() => handleUpdateTenant()} className="px-12 py-5 bg-[#2F4858] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl hover:brightness-110 active:scale-95 transition-all text-xs">
                    <Save className="w-6 h-6 text-[#B69B74]" /> Sincronizar Todos os Fluxos
                 </button>
              </div>
            </div>
          )}
        </AnimatePresence>

        <PremiumModal 
          isOpen={modal.isOpen}
          onClose={() => setModal(m => ({ ...m, isOpen: false }))}
          onConfirm={modal.onConfirm}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          defaultValue={modal.defaultValue}
          confirmLabel={modal.type === 'confirm' ? 'Confirmar Exclusão' : 'Criar Fluxo'}
        />
      </main>
    </div>
  );
};

export default Settings;
