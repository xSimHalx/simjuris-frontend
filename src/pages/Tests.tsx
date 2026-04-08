import React, { useState, useEffect } from 'react';
import { 
  Send, TestTube, MapPin, Scale, CalendarClock, 
  CheckCircle, AlertCircle, Shield, Building2, Star, X
} from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const Tests: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [tenant, setTenant] = useState<any>(null);

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
    if (!testNumber) {
      setError('Por favor, informe seu número de WhatsApp para o teste.');
      return;
    }

    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const res = await api.post('/api/notifications/debug-trigger', {
        tipo,
        contexto,
        telefone: testNumber
      });
      setSuccess(res.data.message);
      setPreview(res.data.preview);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao disparar simulação.');
    } finally {
      setLoading(false);
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
      setSuccess('Mensagem de conexão enviada!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar teste simples.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#B69B74] to-[#D4B991] rounded-2xl flex items-center justify-center shadow-xl shadow-[#B69B74]/20 animate-pulse">
              <TestTube className="w-7 h-7 text-[#2F4858]" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#2F4858] font-display italic leading-none">Laboratório</h1>
              <p className="text-[#B69B74] font-black text-[10px] uppercase tracking-[0.3em] mt-2">Ambiente de Simulação SimHal</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/50 shadow-sm flex flex-col md:flex-row items-center gap-4 border-b-4 border-b-[#B69B74]">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-2">WhatsApp para Teste</label>
            <input 
              type="text" 
              value={testNumber} 
              onChange={(e) => setTestNumber(e.target.value)}
              placeholder="(00) 00000-0000"
              className="px-6 py-3 rounded-2xl bg-white border-2 border-slate-50 focus:border-[#B69B74]/50 outline-none font-bold text-slate-700 w-64 shadow-inner"
            />
          </div>
          <button 
            onClick={handleSimpleTest}
            disabled={loading}
            className="h-[52px] mt-auto px-8 bg-[#2F4858] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-lg"
          >
            {loading ? '...' : <><Send className="w-4 h-4" /> Validar Conexão</>}
          </button>
        </div>
      </header>

      {/* Audit Data Display */}
      <section className="bg-[#2F4858] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <Building2 className="w-8 h-8 text-[#B69B74]" />
             </div>
             <div>
                <h2 className="text-xl font-bold">{tenant?.nome_fantasia || 'Nome do Escritório'}</h2>
                <p className="text-blue-100/60 text-sm font-medium">Dados mestres que serão usados nas automações de elite.</p>
             </div>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
             <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-2xl border border-white/10">
                <MapPin className="w-4 h-4 text-[#B69B74]" />
                <span className="text-xs font-bold truncate max-w-[200px]">{tenant?.google_maps_link ? 'Link do Google Maps Configurado ✅' : 'Link de Localização Pendente ❌'}</span>
             </div>
             <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-2xl border border-white/10">
                <Shield className="w-4 h-4 text-[#B69B74]" />
                <span className="text-xs font-bold uppercase tracking-widest">Motor Evolution Rodando: 82.112.245.75</span>
             </div>
          </div>
        </div>
      </section>

      {/* Main Test Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card: Audiências */}
        <div className="glass-card rounded-[2.5rem] p-8 flex flex-col h-full border-t-4 border-t-[#B69B74]">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-[#B69B74] shadow-inner">
                 <Scale className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-slate-800 tracking-tight">Módulo de Audiências</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Testar Tonality & Emojis 🏛️</p>
              </div>
           </div>

           <div className="space-y-4 flex-1">
              <button onClick={() => handleDebugTest('AUDIENCIA', 'confirmacao')} className="w-full p-6 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-[#B69B74]/20 rounded-3xl flex items-center justify-between group transition-all">
                 <div className="text-left">
                    <p className="font-black text-[#2F4858] text-sm uppercase tracking-wider">Confirmação Imediata</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Simula o envio após o cadastro inicial.</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-[#B69B74] shadow-sm"><Send className="w-5 h-5" /></div>
              </button>

              <button onClick={() => handleDebugTest('AUDIENCIA', 'lembrete_d2')} className="w-full p-6 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-[#B69B74]/20 rounded-3xl flex items-center justify-between group transition-all">
                 <div className="text-left">
                    <p className="font-black text-[#2F4858] text-sm uppercase tracking-wider">Lembrete de 48 horas</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Simula o alerta de reforço D-2.</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-[#B69B74] shadow-sm"><CalendarClock className="w-5 h-5" /></div>
              </button>

              <button onClick={() => handleDebugTest('AUDIENCIA', 'lembrete_d0')} className="w-full p-6 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-[#B69B74]/20 rounded-3xl flex items-center justify-between group transition-all">
                 <div className="text-left">
                    <p className="font-black text-[#2F4858] text-sm uppercase tracking-wider">Lembrete do Dia (HOJE)</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Simula o foco total no compromisso.</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-[#B69B74] shadow-sm"><Shield className="w-5 h-5" /></div>
              </button>
           </div>
        </div>

        {/* Card: Prazos e Outros */}
        <div className="space-y-8">
          <div className="glass-card rounded-[2.5rem] p-8 border-t-4 border-t-[#2F4858]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2F4858]">
                 <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Prazos Judiciais</h3>
            </div>
            <button onClick={() => handleDebugTest('PRAZO', 'confirmacao')} className="w-full p-6 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-blue-200 rounded-3xl flex items-center justify-between group transition-all">
               <div className="text-left">
                  <p className="font-black text-[#2F4858] text-sm uppercase tracking-wider">Protocolo Realizado ⚖️</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">Simula a confirmação de segurança para o cliente.</p>
               </div>
               <CheckCircle className="w-6 h-6 text-slate-200 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 border-t-4 border-t-[#2F4858]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2F4858]">
                 <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Geolocalização (Google Maps)</h3>
            </div>
            <button 
              onClick={() => handleDebugTest('REUNIAO', 'avaliacao')} 
              className="w-full p-6 bg-[#B69B74]/10 hover:bg-[#B69B74]/20 border-2 border-[#B69B74]/20 rounded-3xl flex items-center justify-between group transition-all"
            >
               <div className="text-left">
                  <p className="font-black text-[#2F4858] text-sm uppercase tracking-wider">Avaliação Final de Caso 📍</p>
                  <p className="text-xs font-bold text-[#B69B74] mt-1">Gera o pedido de review no Google Maps para o cliente.</p>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-[#B69B74] flex items-center justify-center text-white shadow-lg"><Star className="w-6 h-6" /></div>
            </button>
          </div>
        </div>

      </div>

      {/* Preview and Stats */}
      <AnimatePresence>
        {(success || error || preview) && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
            <div className="bg-[#1F3645] rounded-[2.5rem] shadow-2xl p-8 border border-white/10 relative overflow-hidden">
               <div className="flex items-start gap-6">
                  <div className="flex-1 space-y-4">
                     {success && (
                       <div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-widest text-sm">
                          <CheckCircle className="w-6 h-6" /> {success}
                       </div>
                     )}
                     {error && (
                       <div className="flex items-center gap-3 text-red-400 font-black uppercase tracking-widest text-sm">
                          <AlertCircle className="w-6 h-6" /> {error}
                       </div>
                     )}
                     {preview && (
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-blue-100/30 uppercase tracking-[0.3em]">Payload Bruto Enviado</p>
                          <div className="p-6 bg-black/30 rounded-3xl border border-white/50 font-mono text-xs text-blue-100/80 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                             {preview}
                          </div>
                       </div>
                     )}
                  </div>
                  <button onClick={() => { setPreview(null); setSuccess(''); setError(''); }} className="p-4 bg-white/5 hover:bg-red-500/20 rounded-2xl text-white/50 hover:text-red-400 transition-all">
                     <X className="w-6 h-6" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Tests;
