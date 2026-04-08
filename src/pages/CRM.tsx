import React, { useState, useEffect } from 'react';
import { 
  Search, UserPlus, User, Calendar as CalendarIcon, 
  Phone, X, ArrowRight, CheckCircle, Clock, Tag, FileText, Hash,
  PlusCircle, AlertCircle, ChevronRight, MessageSquare, Trash2, Pencil,
  Ban, ShieldAlert
} from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../components/StatusBadge';

interface Evento {
  id: string;
  titulo: string;
  tipo_evento: string;
  data_hora_evento: string;
  status: string;
  numero_processo?: string;
  notification_logs?: any[];
}

interface Cliente {
  id: string;
  nome_completo: string;
  documento: string | null;
  whatsapp: string;
  notas_internas?: string;
  events: Evento[];
}

type PanelMode = 'create-client' | 'ficha' | 'add-event' | 'edit-client';

const TIPO_LABELS: Record<string, string> = {
  PRAZO: 'Prazo Judiciário',
  AUDIENCIA: 'Audiência',
  REUNIAO: 'Reunião',
};
const TIPO_COLORS: Record<string, string> = {
  PRAZO: 'bg-red-100 text-red-700',
  AUDIENCIA: 'bg-blue-100 text-blue-700',
  REUNIAO: 'bg-amber-100 text-amber-700',
};

// ── Classes de Input ─────────────────────────────────────────────────────────
const inputCls = "w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent bg-white focus:border-[#B69B74]/50 focus:ring-4 focus:ring-[#B69B74]/10 transition-all outline-none font-semibold text-slate-700";

// ── Componente de Formulário ─────────────────────────────────────────────────
interface EventFormProps {
  eventForm: any;
  setEventForm: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string;
  success: string;
}

const EventForm: React.FC<EventFormProps> = ({ eventForm, setEventForm, onSubmit, saving, error, success }) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">O que será agendado?</label>
        <div className="relative">
          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input type="text" required placeholder="Ex: Audiência de Instrução" value={eventForm.titulo}
            onChange={e => setEventForm({...eventForm, titulo: e.target.value})} className={inputCls} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tipo de Compromisso</label>
        <div className="relative">
          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <select value={eventForm.tipo} onChange={e => setEventForm({...eventForm, tipo: e.target.value})}
            className={`${inputCls} appearance-none`}>
            <option value="PRAZO">Prazo Judiciário</option>
            <option value="AUDIENCIA">Audiência</option>
            <option value="REUNIAO">Reunião</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data e Horário</label>
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input type="datetime-local" required value={eventForm.dataHora}
            onChange={e => setEventForm({...eventForm, dataHora: e.target.value})} className={inputCls} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nº Processo <span className="opacity-50 text-[9px]">(Opcional)</span></label>
        <div className="relative">
          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input type="text" placeholder="0000000-00.0000.0.00.0000" value={eventForm.processo}
            onChange={e => setEventForm({...eventForm, processo: e.target.value})} className={inputCls} />
        </div>
      </div>
    </div>

    {error && (
      <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
      </div>
    )}
    {success && (
      <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-200">
        <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
      </div>
    )}

    <button type="submit" disabled={saving}
      className="w-full py-5 bg-[#2F4858] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#1F3645] transition-all shadow-xl shadow-blue-900/20 active:scale-95">
      {saving ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CalendarIcon className="w-5 h-5" /> Consolidar Agenda</>}
    </button>
  </form>
);

// ── MODAL DE EXCLUSÃO PREMIUM ────────────────────────────────────────────────
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, clientName }) => {
  const [countdown, setCountdown] = useState(2);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(2);
      setCanDelete(false);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0.1) {
            clearInterval(timer);
            setCanDelete(true);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-[#2F4858]/80 backdrop-blur-md z-[200]" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[2.5rem] p-8 z-[201] shadow-2xl text-center">
            
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-100">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-[#2F4858] mb-2 font-display">Atenção Crítica!</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
              Você está prestes a apagar <strong>{clientName}</strong>. Esta ação é irreversível e removerá todo o histórico de pautas e mensagens.
            </p>

            <div className="space-y-3">
              <button 
                onClick={onConfirm}
                disabled={!canDelete}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
                  canDelete 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}>
                {canDelete ? 'Excluir Permanentemente' : `Segurança (${countdown.toFixed(1)}s)`}
              </button>
              <button onClick={onClose}
                className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                Manter Cliente
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CRM = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ── Painel Lateral ──────────────────────────────────────────────────────────
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('create-client');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  // ── Modal de Exclusão ──────────────────────────────────────────────────────
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Cliente | null>(null);

  // ── Estados do step de Cadastro/Edição ─────────────────────────────────────
  const [step, setStep] = useState<'client' | 'success' | 'event'>('client');
  const [newClientId, setNewClientId] = useState('');
  const [clientForm, setClientForm] = useState({ id: '', nome: '', zap: '', doc: '' });
  const [eventForm, setEventForm] = useState({ titulo: '', dataHora: '', tipo: 'PRAZO', processo: '' });
  const [saving, setSaving] = useState(false);
  const [eventError, setEventError] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');
  const [sendFeedback, setSendFeedback] = useState(true);
  const [notasInternas, setNotasInternas] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/api/clients');
      setClientes(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const openCreatePanel = () => {
    resetForms();
    setPanelMode('create-client');
    setShowPanel(true);
  };

  const openFichaPanel = (c: Cliente) => {
    setSelectedClient(c);
    setNotasInternas(c.notas_internas || '');
    setPanelMode('ficha');
    setShowPanel(true);
  };

  const openEditPanel = (c: Cliente) => {
    setClientForm({ id: c.id, nome: c.nome_completo, zap: c.whatsapp, doc: c.documento || '' });
    setPanelMode('edit-client');
  };

  const openAddEventPanel = (c: Cliente) => {
    setSelectedClient(c);
    setNewClientId(c.id);
    setEventForm({ titulo: '', dataHora: '', tipo: 'PRAZO', processo: '' });
    setEventError('');
    setEventSuccess('');
    setPanelMode('add-event');
    setShowPanel(true);
  };

  const resetForms = () => {
    setStep('client');
    setClientForm({ id: '', nome: '', zap: '', doc: '' });
    setEventForm({ titulo: '', dataHora: '', tipo: 'PRAZO', processo: '' });
    setNewClientId('');
    setEventError('');
    setEventSuccess('');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Hoje às ${time}`;
    return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${time}`;
  };

  const hasFutureEvent = (events: Evento[]) =>
    events.some(e => e.status === 'AGENDADO' && new Date(e.data_hora_evento) >= new Date());

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEventError('');
    try {
      const res = await api.post('/api/clients', {
        nome_completo: clientForm.nome,
        whatsapp: clientForm.zap,
        documento: clientForm.doc || '00000000000'
      });
      const createdClient = res.data;
      setNewClientId(createdClient.id);
      setSelectedClient(createdClient);
      setStep('success');
      fetchClients();
    } catch (err: any) { 
      setEventError(err.response?.data?.error || 'Erro ao salvar cliente. Tente novamente.'); 
    }
    finally { setSaving(false); }
  };

  const handleSaveNotes = async () => {
    if (!selectedClient) return;
    setSavingNotes(true);
    try {
      await api.patch(`/api/clients/${selectedClient.id}`, {
        notas_internas: notasInternas
      });
      fetchClients();
      setEventSuccess('Notas salvas!');
      setTimeout(() => setEventSuccess(''), 2000);
    } catch {
      alert('Erro ao salvar notas.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEventError('');
    try {
      await api.patch(`/api/clients/${clientForm.id}`, {
        nome_completo: clientForm.nome,
        whatsapp: clientForm.zap,
        documento: clientForm.doc
      });
      fetchClients();
      const updated = { ...selectedClient!, nome_completo: clientForm.nome, whatsapp: clientForm.zap, documento: clientForm.doc };
      setSelectedClient(updated);
      setPanelMode('ficha');
    } catch (err: any) { 
      setEventError(err.response?.data?.error || 'Erro ao atualizar. Verifique os dados.'); 
    }
    finally { setSaving(false); }
  };

  const triggerDelete = (c: Cliente) => {
    setClientToDelete(c);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await api.delete(`/api/clients/${clientToDelete.id}`);
      fetchClients();
      setIsDeleteModalOpen(false);
      setShowPanel(false);
    } catch {
      alert('Erro ao excluir cliente.');
    }
  };

  const handleStatusChange = async (eventId: string, status: string) => {
    try {
      await api.patch(`/api/events/${eventId}/status`, { 
        status, 
        sendFeedback: status === 'CONCLUIDO' ? sendFeedback : false 
      });
      
      fetchClients();
      if (selectedClient) {
        const updatedEvents = selectedClient.events.map(ev => 
          ev.id === eventId ? { ...ev, status } : ev
        );
        setSelectedClient({ ...selectedClient, events: updatedEvents });
      }
      
      if (status === 'CONCLUIDO' && sendFeedback) {
        setEventSuccess('Concluído com envio de feedback!');
        setTimeout(() => setEventSuccess(''), 3000);
      }
    } catch {
      alert('Erro ao atualizar status do evento.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEventError('');
    try {
      const eventRes = await api.post('/api/events', {
        titulo: eventForm.titulo,
        numero_processo: eventForm.processo,
        data_hora_evento: new Date(eventForm.dataHora).toISOString(),
        tipo_evento: eventForm.tipo,
        antecedencia_aviso_horas: 24,
        client_id: newClientId || selectedClient?.id
      });

      try {
        const notifRes = await api.post('/api/notifications/send-now', { event_id: eventRes.data.id });
        const lembretes: string[] = notifRes.data.lembretes || [];
        setEventSuccess(`Agendado! ${lembretes.join(' · ')}`);
      } catch {
        setEventSuccess('Agendado! (WhatsApp offline — confirmação não enviada)');
      }

      fetchClients();
      if (panelMode === 'ficha' || panelMode === 'add-event') {
        const updatedRes = await api.get('/api/clients');
        const cId = newClientId || selectedClient?.id;
        const updatedClient = updatedRes.data.find((c: Cliente) => c.id === cId);
        if (updatedClient) setSelectedClient(updatedClient);
        setTimeout(() => { setEventSuccess(''); setPanelMode('ficha'); }, 3000);
      } else {
        setTimeout(() => { setShowPanel(false); resetForms(); }, 2500);
      }
    } catch { setEventError('Erro ao agendar evento. Verifique os dados.'); }
    finally { setSaving(false); }
  };

  const filteredClients = clientes.filter(c =>
    c.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.whatsapp.includes(searchTerm) ||
    (c.documento && c.documento.includes(searchTerm))
  );

  const getMessageStatus = (event: Evento) => {
    if (!event.notification_logs || event.notification_logs.length === 0) return null;
    return event.notification_logs[0].status_envio;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
        clientName={clientToDelete?.nome_completo || ''} 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#2F4858]">Carteira de Clientes</h1>
          <p className="text-[#73706E] mt-2 font-medium">
            {clientes.length} {clientes.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
          </p>
        </div>
        <button onClick={openCreatePanel}
          className="bg-[#2F4858] hover:bg-[#1F3645] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#2F4858]/20 transition-all flex items-center gap-2 active:scale-95">
          <UserPlus className="w-5 h-5" /> Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Buscar por nome, documento ou telefone..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white px-5 py-4 pl-12 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#B69B74]/20 transition-all shadow-sm text-slate-800 placeholder-slate-400 font-medium" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#B69B74]/30 border-t-[#B69B74] rounded-full animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <p className="text-slate-400 font-medium italic">Nenhum cliente encontrado.</p>
            {!searchTerm && (
              <button onClick={openCreatePanel}
                className="inline-flex items-center gap-2 text-[#B69B74] font-bold text-sm hover:text-amber-600 transition-colors">
                <PlusCircle className="w-4 h-4" /> Cadastrar primeiro cliente
              </button>
            )}
          </div>
        ) : filteredClients.map(cliente => {
          const ativo = hasFutureEvent(cliente.events);
          return (
            <motion.div key={cliente.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] flex flex-col border border-slate-100 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.1)] overflow-hidden hover:shadow-[0_15px_45px_-10px_rgba(0,0,0,0.12)] transition-all group">
              
              <div className="p-7 pb-5 border-b border-slate-100 border-dashed">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display font-bold text-lg text-[#2F4858] leading-tight group-hover:text-[#B69B74] transition-colors line-clamp-1">{cliente.nome_completo}</h3>
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${ativo ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-300'}`} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-[#73706E] font-medium">
                    <User className="w-4 h-4 text-[#B69B74]/60 flex-shrink-0" />
                    <span className="truncate">{cliente.documento && cliente.documento !== '00000000000' ? cliente.documento : 'Sem documento'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#73706E] font-medium">
                    <Phone className="w-4 h-4 text-[#B69B74]/60 flex-shrink-0" />
                    <span>{cliente.whatsapp}</span>
                  </div>
                </div>
              </div>

              <div className="p-7 bg-slate-50/40 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black uppercase text-[#B69B74] flex items-center gap-2 tracking-[0.15em]">
                    <CalendarIcon className="w-4 h-4" /> Pautas Ativas
                  </h4>
                </div>
                <div className="space-y-2">
                  {cliente.events.filter(e => e.status === 'AGENDADO').length === 0 ? (
                    <div className="bg-white/50 border border-dashed border-slate-200 rounded-2xl p-5 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider italic">Nenhuma pauta pendente</p>
                    </div>
                  ) : (
                    cliente.events.filter(e => e.status === 'AGENDADO').slice(0, 2).map(ev => {
                       const msgStatus = getMessageStatus(ev);
                       return (
                        <div key={ev.id} className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-[#2F4858] truncate">{ev.titulo}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${TIPO_COLORS[ev.tipo_evento] || 'bg-slate-100 text-slate-500'}`}>
                                {TIPO_LABELS[ev.tipo_evento] || ev.tipo_evento}
                              </span>
                              {msgStatus && (
                                <StatusBadge 
                                  status={msgStatus === 'ENVIADO' ? 'enviado' : msgStatus === 'ERRO' ? 'erro' : 'pendente'} 
                                  text={msgStatus === 'ENVIADO' ? 'Zap OK' : msgStatus === 'ERRO' ? 'Zap Fail' : 'Zap ...'} 
                                />
                              )}
                            </div>
                          </div>
                          <div className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg whitespace-nowrap ml-2 flex-shrink-0">
                            {formatDate(ev.data_hora_evento).split(' às ')[0]}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 border-t border-slate-100">
                <button onClick={() => openAddEventPanel(cliente)}
                  className="py-4 text-xs font-black uppercase tracking-widest text-[#B69B74] hover:bg-[#B69B74]/10 transition-all flex items-center justify-center gap-1.5 border-r border-slate-100">
                  <PlusCircle className="w-4 h-4" /> Agendar
                </button>
                <button onClick={() => openFichaPanel(cliente)}
                  className="py-4 text-xs font-black uppercase tracking-widest text-[#2F4858] hover:bg-[#2F4858]/5 transition-all flex items-center justify-center gap-1.5">
                  Ver Ficha <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
              className="fixed inset-0 bg-[#2F4858]/60 backdrop-blur-sm z-[100]" />

            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#EFEDE8] z-[101] shadow-2xl flex flex-col">

              <div className="p-7 flex justify-between items-center bg-[#2F4858] text-white flex-shrink-0 shadow-lg">
                <div>
                  <h2 className="text-xl font-bold font-display">
                    {panelMode === 'create-client' && 'Novo Cliente'}
                    {panelMode === 'edit-client' && 'Editar Cliente'}
                    {panelMode === 'ficha' && selectedClient?.nome_completo}
                    {panelMode === 'add-event' && `Agendar para ${selectedClient?.nome_completo?.split(' ')[0]}`}
                  </h2>
                  <p className="text-xs text-blue-100/60 font-medium uppercase tracking-widest mt-1">
                    {panelMode === 'create-client' && 'Cadastro Dinâmico'}
                    {panelMode === 'edit-client' && 'Atualizar Informações'}
                    {panelMode === 'ficha' && 'Ficha Completa do Cliente'}
                    {panelMode === 'add-event' && 'Novo Lançamento'}
                  </p>
                </div>
                <button onClick={() => setShowPanel(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-7 space-y-6 custom-scrollbar">
                {(panelMode === 'create-client' || panelMode === 'edit-client') && (
                  <>
                    {step === 'client' && (
                      <form onSubmit={panelMode === 'create-client' ? handleCreateClient : handleUpdateClient} className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome Completo</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="text" required placeholder="Ex: João da Silva" value={clientForm.nome}
                                onChange={e => setClientForm({...clientForm, nome: e.target.value})} className={inputCls} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">WhatsApp</label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="text" required placeholder="(11) 99999-9999" value={clientForm.zap}
                                onChange={e => setClientForm({...clientForm, zap: e.target.value})} className={inputCls} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">CPF / CNPJ</label>
                            <div className="relative">
                              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                              <input type="text" placeholder="000.000.000-00" value={clientForm.doc}
                                onChange={e => setClientForm({...clientForm, doc: e.target.value})} className={inputCls} />
                            </div>
                          </div>
                        </div>
                        
                        {eventError && <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100"><AlertCircle className="w-4 h-4" /> {eventError}</div>}
                        
                        <div className="flex flex-col gap-3">
                          <button type="submit" disabled={saving}
                            className="w-full py-5 bg-[#2F4858] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#1F3645] transition-all shadow-xl active:scale-95">
                            {saving ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
                              <><CheckCircle className="w-5 h-5" /> {panelMode === 'create-client' ? 'Salvar Cliente' : 'Atualizar Cliente'}</>
                            }
                          </button>
                        </div>
                      </form>
                    )}
                    
                    {step === 'success' && panelMode === 'create-client' && (
                      <div className="flex flex-col items-center justify-center text-center space-y-8 pt-16">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                          <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-[#2F4858]">Cliente Registrado!</h3>
                          <p className="text-slate-500 font-medium"><strong>{clientForm.nome}</strong> já está na sua carteira.</p>
                        </div>
                        <div className="w-full space-y-3">
                          <button onClick={() => { setPanelMode('add-event'); setStep('client'); }}
                            className="w-full py-5 bg-[#B69B74] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-xl">
                            Agendar Lançamento <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {panelMode === 'ficha' && selectedClient && (
                  <div className="space-y-6">
                    <div className="flex gap-2">
                       <button onClick={() => openEditPanel(selectedClient)}
                        className="flex-1 py-3 bg-white border border-slate-200 text-[#2F4858] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                        <Pencil className="w-3.5 h-3.5" /> Editar Dados
                      </button>
                      <button onClick={() => triggerDelete(selectedClient)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm border border-slate-100">
                      <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#B69B74]">
                        <User className="w-4 h-4" /> Contatos Vincularados
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <div className="p-2 bg-slate-50 rounded-lg"><Phone className="w-4 h-4 text-[#B69B74]" /></div> {selectedClient.whatsapp}
                        </div>
                        {selectedClient.documento && selectedClient.documento !== '00000000000' && (
                          <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                            <div className="p-2 bg-slate-50 rounded-lg"><Hash className="w-4 h-4 text-[#B69B74]" /></div> {selectedClient.documento}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#B69B74]">
                          <FileText className="w-4 h-4" /> Notas Internas / Prontuário
                        </div>
                        <button 
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
                        >
                          {savingNotes ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                      </div>
                      <textarea 
                        value={notasInternas}
                        onChange={e => setNotasInternas(e.target.value)}
                        placeholder="Anotações estratégicas sobre o caso, perfil do cliente ou lembretes privados..."
                        className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 font-medium focus:bg-white focus:border-[#B69B74]/30 outline-none transition-all resize-none"
                      />
                    </div>

                    <button onClick={() => openAddEventPanel(selectedClient)}
                      className="w-full py-4 bg-[#B69B74] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-lg">
                      <PlusCircle className="w-5 h-5" /> Novo Agendamento
                    </button>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#B69B74]">
                          <CalendarIcon className="w-4 h-4" /> Linha do Tempo ({selectedClient.events.length})
                        </div>
                      </div>

                      {selectedClient.events.length === 0 ? (
                        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                          <p className="text-slate-400 text-sm font-medium italic">Sem pautas registradas.</p>
                        </div>
                      ) : (
                        selectedClient.events.sort((a, b) => new Date(b.data_hora_evento).getTime() - new Date(a.data_hora_evento).getTime()).map(ev => {
                          const isAgendado = ev.status === 'AGENDADO';
                          const msgStatus = getMessageStatus(ev);
                          return (
                            <div key={ev.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-opacity duration-300 ${isAgendado ? 'border-slate-100' : 'opacity-60 border-slate-50 grayscale-[0.3]'}`}>
                              <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0 flex-1">
                                   <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${TIPO_COLORS[ev.tipo_evento] || 'bg-slate-100 text-slate-500'}`}>
                                      {TIPO_LABELS[ev.tipo_evento] || ev.tipo_evento}
                                    </span>
                                    {!isAgendado && <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{ev.status}</span>}
                                  </div>
                                  <p className={`font-bold text-[#2F4858] text-sm truncate ${!isAgendado && 'line-through'}`}>{ev.titulo}</p>
                                  <p className="text-[10px] text-slate-400 font-medium mt-1">{formatDate(ev.data_hora_evento)}</p>
                                  
                                  {msgStatus && (
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
                                      <MessageSquare className="w-3 h-3 text-[#B69B74]/50" />
                                      <StatusBadge 
                                        status={msgStatus === 'ENVIADO' ? 'enviado' : msgStatus === 'ERRO' ? 'erro' : 'pendente'} 
                                        text={msgStatus} 
                                      />
                                    </div>
                                  )}
                                </div>

                                {isAgendado && (
                                  <div className="flex flex-col gap-2">
                                    <button 
                                      onClick={() => {
                                        if (ev.tipo_evento !== 'PRAZO') {
                                          const ok = window.confirm('Deseja enviar uma mensagem de agradecimento com o link do Google Feedback ao concluir?');
                                          setSendFeedback(ok);
                                          handleStatusChange(ev.id, 'CONCLUIDO');
                                        } else {
                                          handleStatusChange(ev.id, 'CONCLUIDO');
                                        }
                                      }}
                                      className="p-2 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                                      <CheckCircle className="w-5 h-5" />
                                    </button>
                                    <button 
                                      onClick={() => handleStatusChange(ev.id, 'CANCELADO')}
                                      className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-[#2F4858] hover:text-white transition-all">
                                      <Ban className="w-5 h-5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {panelMode === 'add-event' && selectedClient && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[#2F4858] font-bold text-sm uppercase tracking-widest">
                      <CalendarIcon className="w-5 h-5 text-[#B69B74]" /> Novo Lançamento
                    </div>
                    <div className="bg-[#2F4858]/5 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#2F4858] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {selectedClient.nome_completo[0]}
                      </div>
                      <div>
                        <p className="font-bold text-[#2F4858] text-sm">{selectedClient.nome_completo}</p>
                        <p className="text-xs text-slate-500">{selectedClient.whatsapp}</p>
                      </div>
                    </div>
                    <EventForm 
                      eventForm={eventForm}
                      setEventForm={setEventForm}
                      onSubmit={handleCreateEvent}
                      saving={saving}
                      error={eventError}
                      success={eventSuccess}
                    />
                    <button type="button" onClick={() => openFichaPanel(selectedClient)}
                      className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                      ← Voltar para a Ficha
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRM;
