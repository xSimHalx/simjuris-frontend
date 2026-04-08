import React, { useEffect, useState } from 'react';
import { 
  Calendar, Clock, CheckCircle, 
  Search, MessageSquare, AlertTriangle,
  Activity, Smartphone, Server
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, sent_24h: 0, errors: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [waStatus, setWaStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, statsRes, chartRes, waRes] = await Promise.all([
          api.get('/api/events'),
          api.get('/api/notifications/stats'),
          api.get('/api/notifications/chart-stats'),
          api.get('/api/instances/').catch(() => ({ data: { status: 'offline' } }))
        ]);
        
        setEvents(eventsRes.data);
        setStats(statsRes.data);
        setChartData(chartRes.data);
        setWaStatus(waRes.data.status === 'open' ? 'online' : 'offline');
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-[#EFEDE8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#B69B74] border-t-[#2F4858] rounded-full animate-spin"></div>
          <p className="text-[#2F4858] font-bold animate-pulse uppercase tracking-widest text-xs">SimJuris carregando dados...</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (eventId: string, status: string) => {
    try {
      await api.patch(`/api/events/${eventId}/status`, { status, sendFeedback: false });
      setEvents(events.map(e => e.id === eventId ? { ...e, status } : e));
      const statsRes = await api.get('/api/notifications/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Erro ao atualizar status', err);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const activeEvents = events.filter(e => e.status === 'AGENDADO');
  const eventsToday = activeEvents.filter(e => e.data_hora_evento.startsWith(today));
  const upcomingEvents = activeEvents.filter(e => !e.data_hora_evento.startsWith(today));

  const getMessageStatus = (event: any) => {
    if (!event.notification_logs || event.notification_logs.length === 0) return null;
    return event.notification_logs[0].status_envio;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, opacity: 1, 
      transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Header com Saúde do Sistema */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#2F4858] font-display bg-clip-text text-transparent bg-premium-gradient" style={{ letterSpacing: '-0.02em' }}>Visão Geral</h2>
          <p className="text-[#B69B74] font-bold text-sm mt-1 uppercase tracking-[0.2em]">Painel de Controle e Métricas</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/40">
            <div className={`w-2 h-2 rounded-full animate-pulse ${waStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <Smartphone className={`w-4 h-4 ${waStatus === 'online' ? 'text-emerald-500' : 'text-slate-300'}`} />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">WhatsApp {waStatus}</span>
          </div>
          <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/40">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <Server className="w-4 h-4 text-[#B69B74]" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Servidor OK</span>
          </div>
          <button onClick={() => navigate('/eventos')} className="flex items-center gap-2 px-5 py-2.5 bg-[#2F4858] rounded-xl text-xs font-black text-white hover:brightness-110 transition-all shadow-lg active:scale-95 uppercase tracking-widest">
            <Search className="w-4 h-4" /> Buscar Processo
          </button>
        </div>
      </motion.div>

      {/* Alerta de Erros */}
      <AnimatePresence>
        {stats.errors > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onClick={() => navigate('/historico')}
            className="flex items-center gap-4 p-5 bg-red-50 border border-red-200 rounded-[2rem] cursor-pointer hover:bg-red-100 transition-all group overflow-hidden"
          >
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-500 flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-black text-red-700 text-sm">
                Encontramos {stats.errors} falhas de envio nas últimas notificações
              </p>
              <p className="text-xs text-red-400 font-medium mt-0.5">Analise o Histórico de Envios para entender o motivo e reenviar.</p>
            </div>
            <span className="text-red-300 font-black text-xs uppercase tracking-widest group-hover:text-red-500 transition-colors">Resolver →</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Principal: Métricas + Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Cards de Stats */}
        <div className="space-y-6">
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass p-8 rounded-[2.5rem] flex items-center justify-between border-l-8 border-l-[#2F4858] group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-[#B69B74] uppercase tracking-widest mb-2">Compromissos Hoje</p>
              <h3 className="text-5xl font-black text-[#2F4858]">{eventsToday.length}</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Agendamentos ativos</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-[#2F4858] shadow-inner group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass p-8 rounded-[2.5rem] flex items-center justify-between border-l-8 border-l-[#B69B74] group relative overflow-hidden">
             <div className="relative z-10">
              <p className="text-[10px] font-black text-[#B69B74] uppercase tracking-widest mb-2">Notificações Enviadas</p>
              <h3 className="text-5xl font-black text-[#2F4858]">{stats.sent_24h} <span className="text-sm font-bold text-emerald-500 ml-1">/ 24h</span></h3>
              <div className="flex gap-2 mt-2">
                <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase tracking-tighter">Motor OK</span>
                <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded uppercase tracking-tighter">{stats.pending} faturadas</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[#B69B74] shadow-inner group-hover:scale-110 transition-transform">
              <MessageSquare className="w-8 h-8" />
            </div>
          </motion.div>
        </div>

        {/* Lado Direito: Gráfico de Atividade */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-white/60 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h4 className="font-black text-[#2F4858] text-lg uppercase tracking-tight">Produtividade Semanal</h4>
              <p className="text-xs text-[#B69B74] font-bold uppercase tracking-widest">Controle de disparos realizados</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[#B69B74]" /> Mensagens
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[220px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B69B74" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#B69B74" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '11px', fontWeight: 'bold'
                  }}
                  cursor={{ stroke: '#B69B74', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#B69B74" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Listas Principais */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Agenda de Hoje */}
        <div className="glass rounded-[2.5rem] overflow-hidden flex flex-col h-[480px]">
          <div className="p-8 border-b border-white/40 flex justify-between items-center bg-white/20 backdrop-blur-md">
            <h3 className="font-black text-[#2F4858] flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#B69B74]">
                <Clock className="w-5 h-5" />
              </div>
              Agenda Prioritária
            </h3>
            <button onClick={() => navigate('/eventos')} className="text-[10px] text-[#B69B74] hover:text-[#2F4858] transition-colors font-black uppercase tracking-widest bg-white/50 px-4 py-2 rounded-xl border border-white/60">Ver Pauta Completa</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/20">
            {eventsToday.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 opacity-60">
                <Calendar className="w-12 h-12 text-[#2F4858]/20 mb-4" />
                <p className="text-[10px] font-black text-[#2F4858]/30 uppercase tracking-[0.2em]">Sem compromissos hoje</p>
              </div>
            ) : (
              eventsToday.map(event => {
                const msgStatus = getMessageStatus(event);
                return (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={event.id} 
                    className="p-8 hover:bg-white/40 transition-all flex gap-6 group"
                  >
                    <div className="text-center min-w-[50px]">
                      <p className="text-xl font-black text-[#2F4858] leading-none mb-1">
                        {new Date(event.data_hora_evento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[9px] font-black text-[#B69B74] uppercase tracking-tighter">Horário</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-[#2F4858] text-lg tracking-tight group-hover:text-black transition-colors">{event.titulo}</h4>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => handleStatusChange(event.id, 'CONCLUIDO')}
                             className="p-2 bg-emerald-50 text-emerald-500 rounded-[12px] hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                           >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{event.client?.nome_completo || 'Sem cliente'}</p>
                         {msgStatus && (
                            <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                              msgStatus === 'ENVIADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                            }`}>
                              {msgStatus === 'ENVIADO' ? 'Notificação OK' : 'Falha no Lembrete'}
                            </div>
                         )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Próximas Datas */}
        <div className="glass rounded-[2.5rem] overflow-hidden flex flex-col h-[480px]">
          <div className="p-8 border-b border-white/40 flex justify-between items-center bg-white/10 backdrop-blur-md">
            <h3 className="font-black text-[#2F4858] flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
              <div className="w-10 h-10 rounded-xl bg-[#2F4858] flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              Planejamento Semanal
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem eventos futuros</p>
                </div>
              ) : (
                upcomingEvents.map(event => {
                  const date = new Date(event.data_hora_evento);
                  return (
                    <motion.div 
                      key={event.id} 
                      className="flex gap-5 p-5 rounded-[2rem] bg-white/40 border border-white/60 hover:bg-white/80 transition-all cursor-default group"
                    >
                      <div className="bg-[#2F4858] px-4 py-3 rounded-2xl text-center min-w-[70px] flex flex-col justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <div className="text-[9px] text-[#B69B74] font-black uppercase tracking-widest leading-none mb-1">{date.toLocaleDateString('pt-BR', { month: 'short' })}</div>
                        <div className="text-2xl font-black text-white leading-none">{date.getDate()}</div>
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <h4 className="font-bold text-[#2F4858] tracking-tight group-hover:text-black transition-colors">{event.titulo}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[9px] font-black text-[#B69B74] uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{event.client?.nome_completo || 'Sem cliente'}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
