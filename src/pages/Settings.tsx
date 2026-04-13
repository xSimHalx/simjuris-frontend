import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Building2, Save, Globe, CheckCircle, AlertCircle, PlusCircle, Trash2, Pencil, X
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
    config_fluxos: [] as any[],
    hide_error_alerts: false
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
        config_fluxos: tenant.config_fluxos,
        hide_error_alerts: tenant.hide_error_alerts
      });
      setSuccess('Configurações atualizadas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('ERRO AO SALVAR TENANT (VPS):', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Erro ao atualizar configurações. Verifique a conexão com a VPS.');
    } finally {
      setLoading(false);
    }
  };

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
              
              <div className="flex justify-between items-center bg-white/40 p-6 rounded-[2rem] border border-white/60 shadow-inner">
                <div>
                   <h2 className="text-2xl font-black text-[#2F4858] flex items-center gap-3">
                     <Globe className="w-6 h-6 text-[#B69B74]" />
                     Fluxos de Trabalho
                   </h2>
                   <p className="text-xs text-[#B69B74] font-bold uppercase tracking-widest mt-1">Arquitetura Estratégica do Escritório</p>
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
                  className="px-8 py-4 bg-[#2F4858] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-[#1F3645] transition-all active:scale-95 group"
                >
                  <PlusCircle className="w-5 h-5 text-[#B69B74] group-hover:rotate-90 transition-transform duration-500" /> Novo Fluxo
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
                <AnimatePresence>
                  {tenant.config_fluxos.map((fluxo, fIdx) => (
                    <motion.div 
                      key={fluxo.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] border border-white/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] space-y-8 flex flex-col relative group overflow-hidden"
                    >
                      {/* Background Decoration */}
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#B69B74]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#B69B74]/10 transition-colors" />
                      
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
                        className="absolute top-8 right-8 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-5 relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#2F4858] to-[#456276] rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
                          <Shield className="w-7 h-7 text-[#B69B74]" />
                        </div>
                        <div className="flex-1">
                          <input 
                            value={fluxo.nome} 
                            onChange={(e) => {
                              const newFluxos = [...tenant.config_fluxos];
                              newFluxos[fIdx].nome = e.target.value.toUpperCase();
                              setTenant({...tenant, config_fluxos: newFluxos});
                            }}
                            className="text-2xl font-black text-[#2F4858] bg-transparent border-none p-0 outline-none w-full font-display tracking-tight focus:text-[#B69B74] transition-colors"
                          />
                          <p className="text-[10px] text-[#B69B74] font-black uppercase tracking-[0.3em]">Estrutura de Natureza</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Configuração de Tipos</label>
                          <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                              {fluxo.tipos.map((t: any, tIdx: number) => (
                                <motion.div 
                                  key={tIdx}
                                  layout
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="p-6 bg-slate-50/70 rounded-[2rem] border-2 border-slate-50 space-y-4 hover:border-[#B69B74]/20 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all group/type"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#2F4858] group-hover/type:text-[#B69B74] transition-colors">
                                         <PlusCircle className="w-4 h-4" />
                                      </div>
                                      <div className="flex flex-col">
                                        <input 
                                          className="text-xs font-black text-[#2F4858] bg-transparent outline-none w-48 border-b border-transparent focus:border-[#B69B74]/30"
                                          value={t.nome}
                                          onChange={(e) => {
                                            const newFluxos = [...tenant.config_fluxos];
                                            newFluxos[fIdx].tipos[tIdx].nome = e.target.value.toUpperCase();
                                            setTenant({...tenant, config_fluxos: newFluxos});
                                          }}
                                        />
                                        <span className="text-[8px] font-black text-[#B69B74]/60 uppercase tracking-tighter italic">Categoria de Compromisso</span>
                                      </div>
                                    </div>
                                    <button onClick={() => {
                                      setModal({
                                        isOpen: true,
                                        title: 'Remover Compromisso',
                                        message: `Deseja excluir "${t.nome}" deste fluxo?`,
                                        type: 'confirm',
                                        onConfirm: () => {
                                          const newFluxos = [...tenant.config_fluxos];
                                          newFluxos[fIdx].tipos = fluxo.tipos.filter((_: any, i: number) => i !== tIdx);
                                          setTenant({...tenant, config_fluxos: newFluxos});
                                          setModal(m => ({ ...m, isOpen: false }));
                                        }
                                      });
                                    }} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/type:opacity-100 transition-opacity">
                                      <X className="w-5 h-5" />
                                    </button>
                                  </div>

                                  <div className="pl-6 border-l-4 border-[#B69B74]/10 space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Pencil className="w-3.5 h-3.5 text-[#B69B74]/40" />
                                      <input 
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-transparent outline-none w-full focus:text-[#2F4858] transition-colors"
                                        value={t.sub_label}
                                        onChange={(e) => {
                                          const newFluxos = [...tenant.config_fluxos];
                                          newFluxos[fIdx].tipos[tIdx].sub_label = e.target.value;
                                          setTenant({...tenant, config_fluxos: newFluxos});
                                        }}
                                      />
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                      <AnimatePresence mode="popLayout">
                                        {t.sub_items.map((item: string, iIdx: number) => (
                                          <motion.span 
                                            key={iIdx} 
                                            layout
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl text-[10px] font-bold text-[#2F4858] shadow-sm border border-slate-100 hover:border-[#B69B74]/30 hover:shadow-md transition-all group/chip cursor-default"
                                          >
                                            {item}
                                            <button onClick={() => {
                                              const newFluxos = [...tenant.config_fluxos];
                                              newFluxos[fIdx].tipos[tIdx].sub_items = t.sub_items.filter((_: any, i: number) => i !== iIdx);
                                              setTenant({...tenant, config_fluxos: newFluxos});
                                            }} className="hover:text-red-500 transition-colors">
                                              <X className="w-3.5 h-3.5 opacity-30 group-hover/chip:opacity-100" />
                                            </button>
                                          </motion.span>
                                        ))}
                                      </AnimatePresence>
                                      
                                      <div className="relative group/add">
                                        <input 
                                          className="text-[10px] font-bold text-[#B69B74] outline-none bg-white/40 border-2 border-dashed border-[#B69B74]/20 rounded-xl px-4 py-2 w-32 placeholder:text-[#B69B74]/40 focus:w-48 focus:border-[#B69B74]/50 focus:bg-white transition-all shadow-inner"
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
                                        <PlusCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B69B74]/30 pointer-events-none group-focus-within/add:rotate-90 transition-transform" />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                          
                          <button 
                            onClick={() => {
                              const newFluxos = [...tenant.config_fluxos];
                              newFluxos[fIdx].tipos.push({ nome: 'NOVO TIPO', sub_label: 'Etapa/Fase', sub_items: [] });
                              setTenant({...tenant, config_fluxos: newFluxos});
                            }}
                            className="w-full py-5 border-2 border-dashed border-slate-100 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-[#B69B74]/40 hover:text-[#B69B74] hover:bg-[#B69B74]/5 transition-all mt-6 flex items-center justify-center gap-2 group/addbtn"
                          >
                            <PlusCircle className="w-5 h-5 group-hover/addbtn:scale-110 transition-transform" />
                            Adicionar Tipo ao Fluxo {fluxo.nome}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex justify-center pt-12">
                 <button onClick={() => handleUpdateTenant()} className="px-14 py-6 bg-[#2F4858] text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-[0_30px_60px_-15px_rgba(47,72,88,0.4)] hover:brightness-110 active:scale-[0.98] transition-all text-[11px] group">
                    <Save className="w-7 h-7 text-[#B69B74] group-hover:scale-110 transition-transform" /> 
                    Sincronizar Arquitetura Elite
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
