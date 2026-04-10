import React, { useState, useEffect } from 'react';
import { 
  Send, TestTube, MapPin, Scale, CalendarClock, Clock,
  CheckCircle, AlertCircle, Shield, Building2, Star, X,
  Zap, MessageSquare, Phone, Eye
} from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const Tests: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [wasSent, setWasSent] = useState(false);
  const [currentParams, setCurrentParams] = useState<{tipo: string, contexto: string} | null>(null);

  useEffect(() => {
    fetchTenant();
  }, []);

  const fetchTenant = async () => {
    try {
      const res = await api.get('/api/tenant');
      setTenant(res.data);
    } catch (err) {
      console.error('Erro ao buscar dados do escritório:', err);
    }
  };

  const handleDebugTest = async (tipo: string, contexto: string) => {
    // Agora o primeiro clique é SEMPRE apenas PREVIEW
    setLoading(true);
    setError('');
    setWasSent(false);
    setCurrentParams({ tipo, contexto });
    
    try {
      const res = await api.post('/api/notifications/debug-trigger', {
        tipo,
        contexto,
        telefone: testNumber, // Opcional no preview
        previewOnly: true
      });
      setPreview(res.data.preview);
      setShowPreviewModal(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao gerar prévia.');
    } finally {
      setLoading(false);
    }
  };

  const handleActualSend = async () => {
    if (!testNumber) {
      setError('Informe seu WhatsApp para o disparo real.');
      return;
    }

    if (!currentParams) return;

    setSending(true);
    setError('');
    
    try {
      await api.post('/api/notifications/debug-trigger', {
        ...currentParams,
        telefone: testNumber,
        previewOnly: false
      });
      setWasSent(true);
      setSuccess('Simulação disparada com sucesso! 🚀');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao disparar mensagem.');
    } finally {
      setSending(false);
    }
  };

  const handleSimpleTest = async () => {
    if (!testNumber) {
      setError('Informe o número de destino.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/notifications/test-message', { numero: testNumber });
      setSuccess('Conexão Validada ✅');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar teste simples.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32">
      {/* Header Elite */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-top duration-700">
        <div className="space-y-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#c5a36b] rounded-2xl flex items-center justify-center shadow-xl shadow-[#c5a36b]/30">
              <TestTube className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Simulations <span className="text-[#c5a36b]">Lab</span></h1>
              <p className="text-[#c5a36b] font-bold text-xs uppercase tracking-[0.4em] mt-1">Ambiente de Alta Performance SimJuris</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-2 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-[#c5a36b]/10">
          <div className="relative flex-1 group">
            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#c5a36b] transition-colors" />
            <input 
              type="text" 
              value={testNumber} 
              onChange={(e) => setTestNumber(e.target.value)}
              placeholder="WhatsApp de Teste"
              className="pl-14 pr-8 py-4 rounded-[1.5rem] bg-slate-50 focus:bg-white border-2 border-transparent focus:border-[#c5a36b]/30 outline-none font-bold text-slate-700 w-full md:w-64 transition-all"
            />
          </div>
          <button 
            onClick={handleSimpleTest}
            disabled={loading}
            className="h-[56px] px-10 bg-[#1e293b] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-[#c5a36b] active:scale-95 transition-all shadow-lg"
          >
            {loading ? 'Processando...' : <><Zap className="w-4 h-4 fill-white" /> Validar Canal</>}
          </button>
        </div>
      </header>

      {/* Audit Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] p-10 border border-[#c5a36b]/20 shadow-xl shadow-[#c5a36b]/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a36b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 rounded-[2.5rem] bg-[#1e293b] flex items-center justify-center border-4 border-[#c5a36b]/20 shadow-2xl">
                <Building2 className="w-10 h-10 text-[#c5a36b]" />
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#1e293b]">{tenant?.nome_fantasia || 'SimJuris Office'}</h2>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Motor Elite Operacional - Brasil-SE1
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
             <div className="flex items-center gap-4 px-8 py-4 bg-[#f8f5f0] rounded-2xl border border-[#c5a36b]/10">
                <MapPin className="w-5 h-5 text-[#c5a36b]" />
                <span className="text-xs font-black text-[#1e293b] uppercase tracking-wider">{tenant?.google_maps_link ? 'Localização OK' : 'Localização Pendente'}</span>
             </div>
             <div className="flex items-center gap-4 px-8 py-4 bg-[#1e293b] rounded-2xl">
                <Shield className="w-5 h-5 text-[#c5a36b]" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Criptografia Ativa</span>
             </div>
          </div>
        </div>
      </motion.section>

      {/* New Flow-Based Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Régua Elite Group */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <Zap className="w-5 h-5 text-[#c5a36b] fill-[#c5a36b]" />
            <h3 className="text-lg font-black text-[#1e293b] uppercase tracking-tighter">Régua de Contato Automática</h3>
          </div>

          <div className="space-y-4">
            {[
              { id: 'confirmacao', label: 'Confirmação de Agendamento', sub: 'Imediato: Segurança para o cliente.', icon: <CheckCircle className="w-6 h-6" /> },
              { id: 'lembrete_d1', label: 'Lembrete de Véspera (D-1)', sub: 'Automático: Organização 24h antes.', icon: <CalendarClock className="w-6 h-6" /> },
              { id: 'lembrete_h1', label: 'Lembrete de Proximidade (H-1)', sub: 'Cirúrgico: Alerta 1 hora antes.', icon: <Clock className="w-6 h-6" /> },
            ].map((step, idx) => (
              <motion.button 
                key={step.id}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDebugTest('AUDIENCIA', step.id)}
                disabled={loading}
                className="w-full text-left p-8 bg-white hover:bg-[#f8f5f0] border border-[#c5a36b]/10 rounded-[2.5rem] flex items-center justify-between group transition-all shadow-sm shadow-[#c5a36b]/5 disabled:opacity-50"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#c5a36b] group-hover:text-white transition-all shadow-inner">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-[#c5a36b]/10 text-[#c5a36b] text-[10px] font-black flex items-center justify-center rounded-full">0{idx+1}</span>
                      <p className="font-black text-[#1e293b] text-base uppercase tracking-tight">{step.label}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mt-1">{step.sub}</p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-[#c5a36b] group-hover:text-[#c5a36b] transition-all">
                  <Eye className="w-5 h-5" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Ações Estratégicas Group */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <Star className="w-5 h-5 text-[#c5a36b] fill-[#c5a36b]" />
            <h3 className="text-lg font-black text-[#1e293b] uppercase tracking-tighter">Ações Estratégicas</h3>
          </div>

          <div className="space-y-6">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              onClick={() => handleDebugTest('REUNIAO', 'avaliacao')}
              className="w-full p-10 bg-[#1e293b] text-white rounded-[3rem] border-4 border-[#c5a36b]/30 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a36b]/10 rotate-45 translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-150" />
              <div className="flex items-center justify-between relative z-10">
                <div className="text-left">
                  <p className="text-[#c5a36b] font-black text-[10px] uppercase tracking-[0.4em] mb-3">Pós-venda Elite</p>
                  <h4 className="text-2xl font-black tracking-tight leading-none mb-2">Pedido de Avaliação (Google)</h4>
                  <p className="text-indigo-200/50 text-sm font-medium">Visualize como capturar o feedback 5 estrelas.</p>
                </div>
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#c5a36b] flex items-center justify-center shadow-xl shadow-[#c5a36b]/40">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.button>

            <div className="grid grid-cols-2 gap-6">
              <button 
                onClick={() => handleDebugTest('PRAZO', 'confirmacao')} 
                className="p-8 bg-white border border-[#c5a36b]/10 rounded-[2.5rem] hover:border-[#c5a36b]/30 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Scale className="w-6 h-6" />
                </div>
                <p className="font-black text-[#1e293b] text-xs uppercase tracking-widest mb-1">Prazos</p>
                <p className="text-sm font-bold text-slate-400">Preview Protocolo</p>
              </button>

              <button className="p-8 bg-[#c5a36b]/5 border border-[#c5a36b]/10 rounded-[2.5rem] opacity-50 cursor-not-allowed text-left">
                <div className="w-12 h-12 rounded-xl bg-[#c5a36b]/10 text-[#c5a36b] flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="font-black text-[#1e293b] text-xs uppercase tracking-widest mb-1">IA Brain</p>
                <p className="text-sm font-bold text-slate-400">Em Breve</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal Glassmorphism */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[20vh] md:pt-[25vh] bg-[#1e293b]/80 backdrop-blur-xl overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 60 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 60 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 mb-32 max-h-[75vh] flex flex-col"
            >
              {/* WhatsApp Header Mockup */}
              <div className="bg-[#075e54] p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">SJ</div>
                  <div>
                    <p className="font-bold text-sm">SimJuris Bot 🤖</p>
                    <p className="text-[10px] text-white/60">Modo de Prévia Elite</p>
                  </div>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Body */}
              <div className="p-8 bg-[#e5ddd5] flex-1 overflow-y-auto relative min-h-[300px]">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://w7.pngwing.com/pngs/226/473/png-transparent-whatsapp-whatsapp-background-thumbnail.png")' }} />
                
                <div className="relative z-10 flex flex-col gap-4">
                  <motion.div 
                    initial={{ scale: 0, x: -20 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-[85%] bg-white p-4 rounded-2xl rounded-tl-none shadow-md text-sm text-slate-800 leading-relaxed whitespace-pre-wrap relative"
                  >
                    {preview}
                    <p className="text-[9px] text-slate-400 text-right mt-2 uppercase">Prévia Gerada</p>
                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent" />
                  </motion.div>

                  {!wasSent && (
                    <p className="text-[10px] font-black text-amber-600 text-center uppercase tracking-[0.2em] my-4 bg-amber-50 py-2 rounded-xl border border-amber-100">
                      🔍 Esta é apenas uma visualização. Deseja enviar para seu WhatsApp agora?
                    </p>
                  )}
                </div>
              </div>

              {/* Status Bar */}
              <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                {wasSent ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                    <CheckCircle className="w-4 h-4" /> Simulação Disparada com Sucesso!
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <Eye className="w-4 h-4" /> Modo Visualização
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  {!wasSent && (
                    <button 
                      onClick={handleActualSend}
                      disabled={sending}
                      className="px-6 py-3 bg-[#c5a36b] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#1e293b] transition-all flex items-center gap-2 shadow-lg shadow-[#c5a36b]/30"
                    >
                      {sending ? 'Disparando...' : <><Send className="w-4 h-4" /> Disparar Agora</>}
                    </button>
                  )}
                  <button 
                    onClick={() => setShowPreviewModal(false)}
                    className="px-6 py-3 bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-300 transition-colors"
                  >
                    {wasSent ? 'Fechar Lab' : 'Sair do Preview'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Toast */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-10 right-10 z-[110]"
          >
             <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-black uppercase tracking-widest text-xs">
                <CheckCircle className="w-6 h-6" /> {success}
             </div>
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-10 right-10 z-[110]"
          >
             <div className="bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-black uppercase tracking-widest text-xs">
                <AlertCircle className="w-6 h-6" /> {error}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Tests;
