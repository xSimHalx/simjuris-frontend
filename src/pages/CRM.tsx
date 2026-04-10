import React, { useState, useEffect } from 'react';
import { 
  Search, UserPlus, User, Calendar as CalendarIcon, 
  Phone, X, ArrowRight, CheckCircle, Clock, Tag, FileText, Hash,
  PlusCircle, AlertCircle, ChevronRight, MessageSquare, Trash2, Pencil,
  Ban, ShieldAlert, Activity
} from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import MaskedInput from '../components/MaskedInput';
import PremiumDatePicker from '../components/PremiumDatePicker';

interface Evento {
  id: string;
  titulo: string;
  tipo_evento: string;
  data_hora_evento: string;
  status: string;
  natureza: string;
  instancia_judicial?: string | null;
  fase_administrativa?: string | null;
  local_link?: string | null;
  omit_location?: boolean;
  numero_processo?: string;
  notification_logs?: any[];
}

interface Cliente {
  id: string;
  nome_completo: string;
  documento: string | null;
  whatsapp: string;
  notas_internas?: string;
  tenant?: any;
  events: Evento[];
}

type PanelMode = 'create-client' | 'ficha' | 'add-event' | 'edit-client';

const TIPO_LABELS: Record<string, string> = {
  PRAZO: 'Prazo Judiciário',
  AUDIENCIA: 'Audiência',
  REUNIAO: 'Reunião',
  PERICIA: 'Perícia',
  CARTORIO: 'Cartório',
  TESTEMUNHAS: 'Oitivas / Testemunhas',
};
const TIPO_COLORS: Record<string, string> = {
  PRAZO: 'bg-red-500 text-white',
  AUDIENCIA: 'bg-blue-500 text-white',
  REUNIAO: 'bg-amber-500 text-white',
  PERICIA: 'bg-purple-500 text-white',
  CARTORIO: 'bg-emerald-500 text-white',
  TESTEMUNHAS: 'bg-indigo-500 text-white',
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
  contextClient: any;
  globalConfig: any;
}

const EventForm: React.FC<EventFormProps> = ({ eventForm, setEventForm, onSubmit, saving, error, success, contextClient, globalConfig }) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MaskedInput 
        mask="none"
        label="O que será agendado?"
        placeholder="Ex: Audiência de Instrução"
        icon={<FileText />}
        value={eventForm.titulo}
        onChange={e => setEventForm({...eventForm, titulo: e.target.value})}
        required
      />
      
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">Natureza do Caso</label>
        <div className="flex bg-white/70 p-1.5 rounded-2xl border-2 border-slate-100 gap-1">
          {(globalConfig?.config_fluxos || contextClient?.tenant?.config_fluxos)?.map((fluxo: any) => (
            <button key={fluxo.id} type="button" 
              onClick={() => {
                const firstType = fluxo.tipos[0];
                setEventForm({
                  ...eventForm, 
                  natureza: fluxo.nome, 
                  tipo: firstType?.nome || '', 
                  instancia: firstType?.sub_items[0] || '',
                  fase: firstType?.sub_items[0] || ''
                });
              }}
              className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-tight transition-all ${eventForm.natureza === fluxo.nome ? 'bg-[#2F4858] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
              {fluxo.nome}
            </button>
          ))}
        </div>
      </div>

      {(() => {
        const currentFluxo = (globalConfig?.config_fluxos || contextClient?.tenant?.config_fluxos)?.find((f: any) => f.nome === eventForm.natureza);
        if (!currentFluxo) return null;

        const currentTipoObj = currentFluxo.tipos.find((t: any) => t.nome === eventForm.tipo);
        
        return (
          <>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tipo de Compromisso</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <select 
                  value={eventForm.tipo} 
                  onChange={e => {
                    const tipoNome = e.target.value;
                    const tipoObj = currentFluxo.tipos.find((t: any) => t.nome === tipoNome);
                    setEventForm({
                      ...eventForm, 
                      tipo: tipoNome, 
                      instancia: tipoObj?.sub_items[0] || '',
                      fase: tipoObj?.sub_items[0] || ''
                    });
                  }}
                  className={`${inputCls} appearance-none`}>
                  {currentFluxo.tipos.map((t: any) => (
                    <option key={t.nome} value={t.nome}>{t.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <PremiumDatePicker 
              label="Data e Horário"
              value={eventForm.dataHora}
              onChange={val => setEventForm({...eventForm, dataHora: val})}
            />

            {currentTipoObj && currentTipoObj.sub_label && (
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">{currentTipoObj.sub_label}</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <select value={eventForm.instancia} onChange={e => setEventForm({...eventForm, instancia: e.target.value, fase: e.target.value})}
                    className={`${inputCls} appearance-none`}>
                    {currentTipoObj.sub_items.length === 0 ? (
                      <option disabled>Nenhuma opção cadastrada...</option>
                    ) : (
                      currentTipoObj.sub_items.map((item: string) => (
                        <option key={item} value={item}>{item}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            )}

            <MaskedInput 
              mask="none"
              label="Nº Processo (Opcional)"
              placeholder="0000000-00.0000.0.00.0000"
              icon={<Hash />}
              value={eventForm.processo}
              onChange={e => setEventForm({...eventForm, processo: e.target.value})}
            />

            <div className="col-span-full">
              <MaskedInput 
                mask="none"
                label="📍 Localização / Link do Google Maps (Opcional)"
                placeholder="Ex: Sala Zoom, Link do Meet ou Link do Google Maps do Fórum"
                icon={<Activity className="text-emerald-500" />}
                value={eventForm.localLink}
                onChange={e => setEventForm({...eventForm, localLink: e.target.value})}
              />
              <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight ml-2">
                💡 Se vazio, usaremos o endereço padrão do seu escritório.
              </p>
            </div>

            {/* Controle de Privacidade Elite */}
            <div className="col-span-full">
              <button 
                type="button"
                onClick={() => setEventForm({...eventForm, omitLocation: !eventForm.omitLocation})}
                className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${
                  eventForm.omitLocation 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-white border-slate-100 hover:border-[#B69B74]/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    eventForm.omitLocation ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {eventForm.omitLocation ? <Ban className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-black uppercase tracking-widest ${eventForm.omitLocation ? 'text-red-700' : 'text-[#2F4858]'}`}>
                      {eventForm.omitLocation ? 'Localização Omitida' : 'Localização Ativa'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                      {eventForm.omitLocation ? 'Nenhum mapa será enviado nesta pauta' : 'O cliente receberá o link do mapa'}
                    </p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${
                  eventForm.omitLocation ? 'bg-red-500' : 'bg-slate-200'
                }`}>
                  <motion.div 
                    animate={{ x: eventForm.omitLocation ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </div>
              </button>
            </div>
          </>
        );
      })()}
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
  const [tenantConfig, setTenantConfig] = useState<any>(null);

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
  const [eventForm, setEventForm] = useState({ 
    titulo: '', 
    dataHora: '', 
    tipo: 'PRAZO', 
    processo: '',
    natureza: 'JUDICIAL',
    instancia: '1_INSTANCIA',
    fase: 'AGUARDANDO_PERICIA',
    localLink: '',
    omitLocation: false // Novo controle de privacidade
  });
  const [saving, setSaving] = useState(false);
  const [eventError, setEventError] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');
  const [sendFeedback, setSendFeedback] = useState(true);
  const [notasInternas, setNotasInternas] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const [searchParams] = useSearchParams();
  const clientIdFromUrl = searchParams.get('clientId');

  useEffect(() => {
    fetchClients();
    fetchTenantConfig();
  }, []);

  // Lógica de Auto-Abertura Elite: 
  // Se viermos do Dashboard com um ID de cliente, abre a ficha dele direto.
  useEffect(() => {
    if (clientIdFromUrl && clientes.length > 0) {
      const cliente = clientes.find(c => c.id === clientIdFromUrl);
      if (cliente) {
        openFichaPanel(cliente);
        // Limpar o parâmetro da URL para evitar re-abertura indesejada no refresh
        window.history.replaceState({}, '', '/crm');
      }
    }
  }, [clientIdFromUrl, clientes]);

  const fetchTenantConfig = async () => {
    try {
      const res = await api.get('/api/tenant');
      setTenantConfig(res.data);
      return res.data;
    } catch (err) {
      console.error('Erro ao buscar config do tenant:', err);
      return null;
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/api/clients');
      setClientes(res.data);
      // Se houver um cliente selecionado, atualizamos ele também para pegar o tenant config
      if (selectedClient) {
        const updated = res.data.find((c: any) => c.id === selectedClient.id);
        if (updated) setSelectedClient(updated);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const openCreatePanel = () => {
    resetForms();
    setPanelMode('create-client');
    fetchTenantConfig();
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
    setShowPanel(true);
  };

  const openAddEventPanel = async (c: Cliente) => {
    setSelectedClient(c);
    setNewClientId(c.id);
    const config = await fetchTenantConfig();
    
    // Inicialização Inteligente baseada no primeiro fluxo disponível
    const firstFluxo = config?.config_fluxos?.[0];
    const firstType = firstFluxo?.tipos?.[0];

    setEventForm({ 
      titulo: '', 
      dataHora: new Date().toISOString(), 
      tipo: firstType?.nome || 'PRAZO', 
      processo: '',
      natureza: firstFluxo?.nome || 'JUDICIAL',
      instancia: firstType?.sub_items?.[0] || '',
      fase: firstType?.sub_items?.[0] || '',
      localLink: '',
      omitLocation: false
    });
    setEventError('');
    setEventSuccess('');
    setPanelMode('add-event');
    setShowPanel(true);
  };

  const resetForms = () => {
    setStep('client');
    setClientForm({ id: '', nome: '', zap: '', doc: '' });
    setEventForm({
      titulo: '',
      dataHora: '',
      tipo: 'REUNIAO',
      processo: '',
      natureza: 'JUDICIAL',
      instancia: '1_INSTANCIA',
      fase: 'AGUARDANDO_PERICIA',
      localLink: '',
      omitLocation: false
    });
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
        whatsapp: clientForm.zap.replace(/\D/g, ''),
        documento: clientForm.doc.replace(/\D/g, '') || '00000000000'
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
        whatsapp: clientForm.zap.replace(/\D/g, ''),
        documento: clientForm.doc.replace(/\D/g, '')
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
    if (!eventForm.dataHora) {
      setEventError('Por favor, selecione uma data e horário válidos.');
      setSaving(false);
      return;
    }

    try {
      const eventRes = await api.post('/api/events', {
        titulo: eventForm.titulo,
        numero_processo: eventForm.processo,
        data_hora_evento: new Date(eventForm.dataHora).toISOString(),
        tipo_evento: eventForm.tipo,
        natureza: eventForm.natureza,
        instancia_judicial: eventForm.natureza === 'JUDICIAL' ? eventForm.instancia : null,
        fase_administrativa: eventForm.natureza === 'ADMINISTRATIVO' ? eventForm.fase : null,
        local_link: eventForm.localLink,
        omit_location: eventForm.omitLocation, // Enviando preferência de privacidade
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

  const selectedCustomerEvents = selectedClient?.events 
    ? [...selectedClient.events].sort((a, b) => new Date(b.data_hora_evento).getTime() - new Date(a.data_hora_evento).getTime())
    : [];

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
          
          // Lógica para extrair a \"Etapa Atual\" (o compromisso agendado mais próximo)
          const nextEvent = [...cliente.events]
            .filter(e => e.status === 'AGENDADO')
            .sort((a, b) => new Date(a.data_hora_evento).getTime() - new Date(b.data_hora_evento).getTime())[0];
          
          const etapaAtual = nextEvent ? (nextEvent.instancia_judicial || nextEvent.fase_administrativa || nextEvent.tipo_evento) : null;

          return (
            <motion.div key={cliente.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] flex flex-col border border-slate-100 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.1)] overflow-hidden hover:shadow-[0_15px_45px_-10px_rgba(0,0,0,0.12)] transition-all group">
              
              <div className="p-7 pb-5 border-b border-slate-100 border-dashed">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="font-display font-bold text-lg text-[#2F4858] leading-tight group-hover:text-[#B69B74] transition-colors line-clamp-1">{cliente.nome_completo}</h3>
                    {etapaAtual && (
                      <span className="text-[9px] font-black uppercase text-[#B69B74] tracking-[0.2em] flex items-center gap-1.5">
                        <Activity className="w-3 h-3" /> Etapa: {etapaAtual}
                      </span>
                    )}
                  </div>
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
              className={`fixed right-0 top-0 h-full w-full ${panelMode === 'ficha' ? 'max-w-5xl' : panelMode === 'add-event' ? 'max-w-3xl' : 'max-w-md'} bg-[#EFEDE8] z-[101] shadow-2xl flex flex-col`}>

              {/* Cabeçalho do Painel */}
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

              {/* Corpo do Painel */}
              <div className="flex-1 overflow-y-auto p-7 space-y-6 custom-scrollbar">
                
                {/* Blocos de Cadastro / Edição */}
                {(panelMode === 'create-client' || panelMode === 'edit-client') && (
                  <>
                    {step === 'client' && (
                      <form onSubmit={panelMode === 'create-client' ? handleCreateClient : handleUpdateClient} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <MaskedInput 
                            mask="none"
                            label="Nome Completo"
                            placeholder="Ex: João da Silva"
                            icon={<User />}
                            value={clientForm.nome}
                            onChange={e => setClientForm({...clientForm, nome: e.target.value})}
                            required
                          />
                          <MaskedInput 
                            mask="phone"
                            label="WhatsApp"
                            placeholder="(11) 99999-9999"
                            icon={<Phone />}
                            value={clientForm.zap}
                            onChange={e => setClientForm({...clientForm, zap: e.target.value})}
                            required
                          />
                          <MaskedInput 
                            mask="document"
                            label="CPF / CNPJ"
                            placeholder="000.000.000-00"
                            icon={<Hash />}
                            value={clientForm.doc}
                            onChange={e => setClientForm({...clientForm, doc: e.target.value})}
                          />
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

                {/* Bloco de Ficha do Cliente (Layout 2 Colunas) */}
                {panelMode === 'ficha' && selectedClient && (
                  <div className="space-y-8">
                    {/* Placar de Resumo (Stats Chips) */}
                    <div className="flex flex-wrap gap-3">
                      <div className="px-5 py-2.5 bg-white rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Prazos</span>
                        <span className="text-base font-black text-[#2F4858]">{selectedCustomerEvents.filter(e => e.tipo_evento === 'PRAZO' && e.status === 'AGENDADO').length}</span>
                      </div>
                      <div className="px-5 py-2.5 bg-white rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Audiências</span>
                        <span className="text-base font-black text-[#2F4858]">{selectedCustomerEvents.filter(e => e.tipo_evento === 'AUDIENCIA' && e.status === 'AGENDADO').length}</span>
                      </div>
                      <div className="px-5 py-2.5 bg-[#B69B74]/5 rounded-2xl border border-[#B69B74]/20 flex items-center gap-3">
                        <Activity className="w-4 h-4 text-[#B69B74]" />
                        <span className="text-[10px] font-black uppercase text-[#B69B74] tracking-widest">Eficiência</span>
                        <span className="text-base font-black text-[#B69B74]">100%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                      {/* Coluna Esquerda: Linha do Tempo */}
                      <div className="space-y-6 lg:border-r lg:border-slate-200/60 lg:pr-8 relative min-h-[400px]">
                        {/* A Trilha Visual (Linha Vertical) */}
                        <div className="absolute left-6 top-16 bottom-10 w-0.5 bg-slate-200/50 hidden sm:block" />
                        
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#B69B74]">
                            <CalendarIcon className="w-4 h-4" /> Linha do Tempo ({selectedCustomerEvents.length})
                          </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                          {selectedCustomerEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                              <Activity className="w-16 h-16 text-[#B69B74] mb-4 stroke-1" />
                              <p className="text-xs font-black uppercase text-[#2F4858] tracking-[0.3em]">Aguardando Movimentações</p>
                              <p className="text-[10px] text-slate-400 mt-2">Nenhum evento registrado nesta linha do tempo</p>
                            </div>
                          ) : (
                            selectedCustomerEvents.map(ev => {
                              const isAgendado = ev.status === 'AGENDADO';
                              const msgStatus = getMessageStatus(ev);
                              
                              const borderColor = 
                                ev.tipo_evento === 'PRAZO' ? 'border-l-red-400' :
                                ev.tipo_evento === 'AUDIENCIA' ? 'border-l-blue-400' :
                                ev.tipo_evento === 'REUNIAO' ? 'border-l-amber-400' :
                                ev.tipo_evento === 'PERICIA' ? 'border-l-purple-400' : 'border-l-slate-300';

                              const dotColor = 
                                ev.tipo_evento === 'PRAZO' ? 'bg-red-400' :
                                ev.tipo_evento === 'AUDIENCIA' ? 'bg-blue-400' :
                                ev.tipo_evento === 'REUNIAO' ? 'bg-amber-400' :
                                ev.tipo_evento === 'PERICIA' ? 'bg-purple-400' : 'bg-slate-300';

                              return (
                                <motion.div 
                                  key={ev.id} 
                                  whileHover={{ x: 6, scale: 1.005 }}
                                  className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all duration-300 relative pl-12 border-l-4 ${borderColor} ${!isAgendado && 'opacity-60 grayscale-[0.3]'}`}>
                                  
                                  {/* Bolinha Indicadora de Conexão na Trilha */}
                                  <div className={`absolute left-[22.5px] top-8 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${dotColor}`} />

                                  <div className="flex justify-between items-start gap-3">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${TIPO_COLORS[ev.tipo_evento] || 'bg-slate-100 text-slate-500'}`}>
                                          {TIPO_LABELS[ev.tipo_evento] || ev.tipo_evento}
                                        </span>
                                        {!isAgendado && <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{ev.status}</span>}
                                      </div>
                                      <p className={`font-bold text-[#2F4858] text-[15px] leading-tight truncate ${!isAgendado && 'line-through'}`}>{ev.titulo}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" /> {formatDate(ev.data_hora_evento)}
                                      </p>
                                      
                                      {msgStatus && (
                                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
                                          <MessageSquare className="w-3.5 h-3.5 text-[#B69B74]/50" />
                                          <StatusBadge 
                                            status={msgStatus === 'ENVIADO' ? 'enviado' : msgStatus === 'ERRO' ? 'erro' : 'pendente'} 
                                            text={msgStatus === 'ENVIADO' ? 'WhatsApp Entregue' : msgStatus === 'ERRO' ? 'Falha no Envio' : 'Aguardando Disparo'} 
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
                                          className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                          <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button 
                                          onClick={() => handleStatusChange(ev.id, 'CANCELADO')}
                                          className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#2F4858] hover:text-white transition-all shadow-sm">
                                          <Ban className="w-5 h-5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Coluna Direita: Dados e Ações */}
                      <div className="space-y-6">
                        <div className="flex gap-2">
                          <button onClick={() => openEditPanel(selectedClient)}
                            className="flex-1 py-4 bg-white border border-slate-200 text-[#2F4858] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                            <Pencil className="w-4 h-4" /> Editar Cadastro
                          </button>
                          <button onClick={() => triggerDelete(selectedClient)}
                            className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="bg-white rounded-3xl p-7 space-y-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#B69B74]">
                            <User className="w-4 h-4" /> Dados de Contato
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-[#2F4858] font-bold">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#B69B74] shadow-inner"><Phone className="w-5 h-5" /></div> 
                              {selectedClient.whatsapp}
                            </div>
                            {selectedClient.documento && selectedClient.documento !== '00000000000' && (
                              <div className="flex items-center gap-4 text-sm text-[#2F4858] font-bold">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#B69B74] shadow-inner"><Hash className="w-5 h-5" /></div> 
                                {selectedClient.documento}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-3xl p-7 space-y-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#B69B74]">
                              <FileText className="w-4 h-4" /> Notas Estratégicas
                            </div>
                            <button 
                              onClick={handleSaveNotes}
                              disabled={savingNotes}
                              className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-700 transition-colors disabled:opacity-50"
                            >
                              {savingNotes ? 'Gravando...' : 'Salvar Notas'}
                            </button>
                          </div>
                          <textarea 
                            value={notasInternas}
                            onChange={e => setNotasInternas(e.target.value)}
                            placeholder="Anotações internas sobre o processo..."
                            className="w-full h-36 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 text-sm text-[#2F4858] font-medium focus:bg-white focus:border-[#B69B74]/30 outline-none transition-all resize-none shadow-inner"
                          />
                        </div>

                        <button onClick={() => openAddEventPanel(selectedClient)}
                          className="w-full py-5 bg-[#B69B74] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-xl shadow-amber-900/10 active:scale-[0.98]">
                          <PlusCircle className="w-6 h-6" /> Novo Agendamento
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bloco de Agendamento */}
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
                      contextClient={selectedClient}
                      globalConfig={tenantConfig}
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
