import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, CheckCircle, Ban, 
  User, MapPin, Hash, AlertCircle, Smartphone, Activity
} from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Evento {
  id: string;
  titulo: string;
  tipo_evento: string;
  data_hora_evento: string;
  status: string;
  numero_processo?: string;
  local_link?: string;
  client?: {
    id: string;
    nome_completo: string;
    whatsapp: string;
  };
  notification_rules?: any[];
  notification_logs?: any[];
  tenant?: {
    config_tipos_eventos: string[];
    config_instancias_judiciais: string[];
    config_fases_administrativas: string[];
  };
}

const TIPO_LABELS: Record<string, string> = {
  PRAZO: 'Prazo Judiciário',
  AUDIENCIA: 'Audiência',
  REUNIAO: 'Reunião',
  PERICIA: 'Perícia',
  CARTORIO: 'Cartório',
  TESTEMUNHAS: 'Oitivas / Testemunhas',
};

const TIPO_COLORS: Record<string, string> = {
  PRAZO: 'bg-red-50 text-red-600 border-red-100',
  AUDIENCIA: 'bg-blue-50 text-blue-600 border-blue-100',
  REUNIAO: 'bg-amber-50 text-amber-600 border-amber-100',
  PERICIA: 'bg-purple-50 text-purple-600 border-purple-100',
  CARTORIO: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  TESTEMUNHAS: 'bg-indigo-50 text-indigo-600 border-indigo-100',
};

const formatTriggerDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const Events: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('AGENDADO');
  const [concludingEventId, setConcludingEventId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await fetchEvents();
      const res = await api.get('/api/tenant');
      setConfig(res.data);
    };
    init();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/events');
      setEventos(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (eventId: string, status: string, sendFeedback = false) => {
    try {
      await api.patch(`/api/events/${eventId}/status`, { status, sendFeedback });
      setConcludingEventId(null);
      fetchEvents();
    } catch {
      alert('Erro ao atualizar status.');
    }
  };

  const filteredEvents = eventos.filter(ev => {
    const matchesSearch = 
      ev.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ev.client?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || ev.tipo_evento === filterType;
    const matchesStatus = filterStatus === 'ALL' || ev.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-20" onClick={() => setConcludingEventId(null)}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#2F4858] font-display">Pauta Geral</h1>
          <p className="text-[#B69B74] font-bold text-sm mt-1 uppercase tracking-[0.2em] opacity-80">
            {eventos.length} registros no total
          </p>
        </div>
        
        <div className="flex bg-white/50 p-1.5 rounded-2xl border border-white/50 shadow-sm">
          {['AGENDADO', 'CONCLUIDO', 'CANCELADO', 'ALL'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === st ? 'bg-[#2F4858] text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </header>

      {/* Toolbar Pesquisa e Tipos */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por título ou cliente..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-transparent bg-white focus:border-[#B69B74]/30 focus:ring-4 focus:ring-[#B69B74]/5 transition-all outline-none font-semibold text-slate-700 shadow-sm"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <select 
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full pl-12 pr-8 py-4 rounded-2xl border border-transparent bg-white focus:border-[#B69B74]/30 transition-all outline-none font-bold text-slate-600 shadow-sm appearance-none cursor-pointer"
          >
            <option value="ALL">Todos os Tipos</option>
            {config?.config_fluxos?.map((fluxo: any) => (
              <optgroup key={fluxo.id} label={fluxo.nome}>
                {fluxo.tipos.map((t: any) => (
                  <option key={t.nome} value={t.nome}>{t.nome}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <button onClick={fetchEvents} className="py-4 bg-white text-[#B69B74] rounded-2xl font-black uppercase tracking-widest text-[10px] border border-[#B69B74]/20 hover:bg-[#B69B74]/5 transition-all shadow-sm">
          Atualizar Pauta
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-[#B69B74]/30 border-t-[#B69B74] rounded-full animate-spin" /></div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-20 text-center bg-white/40 rounded-[2.5rem] border border-dashed border-slate-300">
           <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-sm italic">Nenhum compromisso encontrado para estes filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredEvents.map(ev => {
              const isAgendado = ev.status === 'AGENDADO';
              const logs = ev.notification_logs || [];
              const rules = ev.notification_rules || [];

              return (
                <motion.div 
                  key={ev.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                  className={`group bg-white rounded-3xl p-6 border transition-all flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md ${!isAgendado ? 'opacity-60 grayscale-[0.5] border-transparent' : 'border-slate-100'}`}
                >
                  {/* Data & Hora Circle */}
                  <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-[#2F4858] group-hover:text-white transition-all">
                    <span className="text-lg font-black leading-none">{new Date(ev.data_hora_evento).getDate()}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">
                      {new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(ev.data_hora_evento)).replace('.', '')}
                    </span>
                    <div className="h-px w-8 bg-slate-200 my-2 group-hover:bg-white/20"></div>
                    <span className="text-[10px] font-bold">{new Date(ev.data_hora_evento).getHours().toString().padStart(2, '0')}:{new Date(ev.data_hora_evento).getMinutes().toString().padStart(2, '0')}</span>
                  </div>

                  {/* Informações Centrais */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${TIPO_COLORS[ev.tipo_evento] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {TIPO_LABELS[ev.tipo_evento] || ev.tipo_evento}
                      </span>
                      {(() => {
                        const currentFluxo = config?.config_fluxos?.find((f: any) => f.nome === ev.natureza);
                        if (!currentFluxo) return null;
                        return (
                          <span className="text-[8px] font-black text-blue-500 bg-blue-100/30 px-2 py-1 rounded-md border border-blue-100 uppercase tracking-widest">
                            {ev.instancia_judicial || ev.fase_administrativa || ''}
                          </span>
                        );
                      })()}
                      {ev.numero_processo && (
                        <span className="text-[8px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> {ev.numero_processo}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg font-bold text-[#2F4858] truncate ${!isAgendado && 'line-through'}`}>{ev.client?.nome_completo || 'Sem cliente'}</h3>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Activity className="w-4 h-4 text-[#B69B74]" /> {ev.titulo}
                      </div>
                      {ev.local_link && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                          <MapPin className="w-4 h-4" /> {ev.local_link.length > 30 ? ev.local_link.substring(0, 30) + '...' : ev.local_link}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cronograma de Automação (Transparency Feature) */}
                  {isAgendado && (
                    <div className="flex items-center gap-2 px-6 border-x border-slate-100">
                       <div className="flex flex-col items-center gap-1">
                          <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Automação SimJuris</span>
                          <div className="flex items-center gap-2">
                             {/* Confirmação (Sempre o primeiro log ou pendente) */}
                             <div className="flex flex-col items-center">
                                {logs.length > 0 ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="w-4 h-4 rounded-full border-2 border-slate-200" />
                                )}
                                <span className="text-[7px] font-bold text-slate-400 mt-1 uppercase">Confirmação</span>
                             </div>

                             <div className="w-4 h-px bg-slate-100"></div>

                             {/* Regras Planejadas (Lembretes) */}
                             {rules.map((rule, idx) => (
                               <React.Fragment key={rule.id}>
                                  <div className="flex flex-col items-center">
                                     {rule.status === 'EXECUTADA' ? (
                                       <CheckCircle className="w-4 h-4 text-emerald-500" />
                                     ) : (
                                       <div className="relative">
                                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}>
                                            <Smartphone className="w-4 h-4 text-[#B69B74]" />
                                          </motion.div>
                                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-white" title="Agendado"></div>
                                       </div>
                                     )}
                                     <span className="text-[7px] font-bold text-slate-500 mt-1 uppercase">
                                        {rule.dias_antecedencia > 0 ? `T-${rule.dias_antecedencia}d` : 'No Dia'}
                                     </span>
                                     <span className="text-[6px] font-black text-[#B69B74] opacity-80">{formatTriggerDate(rule.data_programada_disparo)}</span>
                                  </div>
                                  {idx < rules.length - 1 && <div className="w-4 h-px bg-slate-100"></div>}
                               </React.Fragment>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}

                  {/* Ações Rápidas */}
                  {isAgendado ? (
                    <div className="relative flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setConcludingEventId(concludingEventId === ev.id ? null : ev.id);
                        }}
                        className={`p-4 rounded-2xl transition-all shadow-sm ${concludingEventId === ev.id ? 'bg-[#2F4858] text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                        title="Concluir Pauta"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                      
                      <AnimatePresence>
                        {concludingEventId === ev.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 bottom-full mb-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              onClick={() => handleStatusChange(ev.id, 'CONCLUIDO', false)}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-500" /> Concluir Pauta
                            </button>
                            <div className="h-px bg-slate-50 my-1"></div>
                            <button 
                              onClick={() => handleStatusChange(ev.id, 'CONCLUIDO', true)}
                              className="w-full text-left px-4 py-3 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                            >
                              <CheckCircle className="w-4 h-4" /> Concluir e Avaliar ⭐
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button 
                         onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(ev.id, 'CANCELADO');
                         }}
                        className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Cancelar Pauta"
                      >
                        <Ban className="w-6 h-6" />
                      </button>
                    </div>
                  ) : (
                    <div className="px-6 py-3 bg-slate-100 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{ev.status}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Events;
