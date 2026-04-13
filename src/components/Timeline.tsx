import React from 'react';
import { 
  motion 
} from 'framer-motion';
import { 
  Clock, CheckCircle, Ban, MessageSquare, 
  Gavel, CalendarClock, Users, Microscope, 
  Search, Phone, Activity
} from 'lucide-react';
import StatusBadge from './StatusBadge';

interface Evento {
  id: string;
  titulo: string;
  tipo_evento: string;
  data_hora_evento: string;
  status: string;
  natureza: string;
  instancia_judicial?: string | null;
  fase_administrativa?: string | null;
  notification_logs?: any[];
}

interface TimelineProps {
  events: Evento[];
  onStatusChange: (eventId: string, status: string) => void;
  formatDate: (iso: string) => string;
}

const TIPO_CONFIG: Record<string, { icon: any; color: string; label: string; bg: string }> = {
  PRAZO: { 
    icon: CalendarClock, 
    color: 'text-red-500', 
    bg: 'bg-red-50',
    label: 'Prazo Judiciário' 
  },
  AUDIENCIA: { 
    icon: Gavel, 
    color: 'text-blue-500', 
    bg: 'bg-blue-50',
    label: 'Audiência' 
  },
  REUNIAO: { 
    icon: Users, 
    color: 'text-amber-500', 
    bg: 'bg-amber-50',
    label: 'Reunião' 
  },
  PERICIA: { 
    icon: Microscope, 
    color: 'text-purple-500', 
    bg: 'bg-purple-50',
    label: 'Perícia' 
  },
  CARTORIO: { 
    icon: Search, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50',
    label: 'Cartório' 
  },
  TESTEMUNHAS: { 
    icon: Users, 
    color: 'text-indigo-500', 
    bg: 'bg-indigo-50',
    label: 'Oitivas' 
  },
  DEFAULT: { 
    icon: Activity, 
    color: 'text-slate-500', 
    bg: 'bg-slate-50',
    label: 'Evento' 
  }
};

const Timeline: React.FC<TimelineProps> = ({ events, onStatusChange, formatDate }) => {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.data_hora_evento).getTime() - new Date(a.data_hora_evento).getTime()
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <Activity className="w-16 h-16 text-[#B69B74] mb-4 stroke-1" />
        <p className="text-xs font-black uppercase text-[#2F4858] tracking-[0.3em]">Aguardando Movimentações</p>
        <p className="text-[10px] text-slate-400 mt-2">Nenhum evento registrado nesta linha do tempo</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative space-y-6 pt-4 pb-8"
    >
      {/* Linha Vertical Mestra */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2F4858]/20 via-[#B69B74]/20 to-transparent hidden sm:block" />

      {sortedEvents.map((ev, index) => {
        const config = TIPO_CONFIG[ev.tipo_evento] || TIPO_CONFIG.DEFAULT;
        const Icon = config.icon;
        const isAgendado = ev.status === 'AGENDADO';
        const msgStatus = ev.notification_logs?.[0]?.status_envio;
        
        return (
          <motion.div 
            key={ev.id} 
            variants={itemVariants}
            className={`relative pl-14 sm:pl-16 group ${!isAgendado ? 'opacity-60 grayscale-[0.2]' : ''}`}
          >
            {/* Marcador na Timeline */}
            <div className={`absolute left-4 sm:left-[18px] top-6 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center transition-transform group-hover:scale-125 ${config.color.replace('text-', 'bg-')}`}>
                <div className="w-1 h-1 bg-white rounded-full" />
            </div>

            <div className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-slate-200/50 border-l-8 ${config.color.replace('text-', 'border-l-')}`}>
              
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg} ${config.color} text-[9px] font-black uppercase tracking-widest`}>
                      <Icon className="w-3.5 h-3.5" />
                      {config.label}
                    </div>
                    {ev.instancia_judicial && (
                      <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">
                        {ev.instancia_judicial}
                      </span>
                    )}
                    {ev.fase_administrativa && (
                      <span className="text-[9px] font-black text-purple-500 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 uppercase tracking-widest">
                        {ev.fase_administrativa}
                      </span>
                    )}
                    {!isAgendado && (
                      <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        {ev.status}
                      </span>
                    )}
                  </div>

                  <h4 className={`text-lg font-bold text-[#2F4858] tracking-tight mb-2 ${!isAgendado ? 'line-through decoration-slate-300' : ''}`}>
                    {ev.titulo}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-[#B69B74]" />
                      {formatDate(ev.data_hora_evento)}
                    </div>
                    
                    {msgStatus && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[#B69B74]/40" />
                        <StatusBadge 
                          status={msgStatus === 'ENVIADO' ? 'enviado' : msgStatus === 'ERRO' ? 'erro' : 'pendente'} 
                          text={msgStatus === 'ENVIADO' ? 'Notificação Entregue' : msgStatus === 'ERRO' ? 'Falha no WhatsApp' : 'Disparo Agendado'} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {isAgendado && (
                  <div className="flex gap-2 self-end sm:self-start">
                    <button 
                      onClick={() => onStatusChange(ev.id, 'CONCLUIDO')}
                      title="Marcar como Concluído"
                      className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onStatusChange(ev.id, 'CANCELADO')}
                      title="Cancelar Evento"
                      className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#2F4858] hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default Timeline;
