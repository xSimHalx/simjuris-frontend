import React, { useState } from 'react';
import { Shield, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Login: React.FC = () => {
  const [email, setEmail] = useState('simhal2016@gmail.com');
  const [password, setPassword] = useState('123456');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'login' | 'forgot' | 'code' | 'reset'>('login');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      login(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setSuccess(res.data.message);
      setRecoveryStep('code');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao solicitar recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, code, newPassword });
      setSuccess('Senha alterada com sucesso! Faça login.');
      setRecoveryStep('login');
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código inválido ou erro no sistema.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEDE8] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:row w-full max-w-5xl animate-slide-up border-8 border-white">
        <div className="flex flex-col md:flex-row w-full">
          {/* Lado Esquerdo: Branding */}
          <div className="bg-[#2F4858] text-white p-16 flex flex-col justify-center md:w-5/12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#B69B74]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#B69B74] to-[#D4B991] rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/20">
                <Shield className="w-7 h-7 text-[#2F4858]" />
              </div>
              <h1 className="text-4xl font-black font-display tracking-tight text-white italic">SimJuris</h1>
            </div>
            
            <h2 className="text-3xl font-bold mb-6 text-[#B69B74] font-display leading-tight relative z-10">A nova era da advocacia inteligente.</h2>
            <p className="text-blue-100/70 leading-relaxed mb-10 text-lg relative z-10 font-medium">
              Gestão de prazos e automação de WhatsApp integrada ao ecossistema <span className="text-[#B69B74] font-bold">SimHal</span>.
            </p>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4 text-sm font-bold text-blue-100/90 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="w-8 h-8 bg-[#B69B74]/20 rounded-xl flex items-center justify-center text-[#B69B74]"><CheckCircle className="w-5 h-5" /></div> Aviso automático via WhatsApp
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-blue-100/90 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="w-8 h-8 bg-[#B69B74]/20 rounded-xl flex items-center justify-center text-[#B69B74]"><CheckCircle className="w-5 h-5" /></div> Pautas e Prazos organizados
              </div>
            </div>
          </div>
          
          {/* Lado Direito: Formulário Dinâmico */}
          <div className="p-16 md:w-7/12 flex flex-col justify-center bg-white">
            
            <AnimatePresence mode="wait">
              {recoveryStep === 'login' && (
                <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-3xl font-black text-[#2F4858] mb-2 font-display">Acesse sua Área</h3>
                  <p className="text-slate-400 mb-10 text-sm font-bold uppercase tracking-widest">Controle sua advocacia agora</p>
                  
                  {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-xs font-black rounded-2xl border border-red-100 flex items-center gap-3"><Shield className="w-5 h-5" /> {error}</div>}
                  {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 text-xs font-black rounded-2xl border border-emerald-100 flex items-center gap-3"><CheckCircle className="w-5 h-5" /> {success}</div>}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail Corporativo</label>
                       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: contato@simjuris.com" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-[#B69B74]/50 outline-none transition-all font-bold text-slate-700" required autoComplete="username" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha de Acesso</label>
                       <div className="relative">
                         <input 
                           type={showPassword ? 'text' : 'password'} 
                           value={password} 
                           onChange={(e) => setPassword(e.target.value)} 
                           placeholder="••••••••" 
                           className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-[#B69B74]/50 outline-none transition-all font-bold text-slate-700 pr-14" 
                           required 
                           autoComplete="current-password" 
                         />
                         <button 
                           type="button" 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-[#B69B74] transition-colors"
                         >
                           {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                         </button>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between px-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-[#2F4858] focus:ring-[#B69B74]" />
                        <span className="text-sm font-bold text-slate-500 group-hover:text-[#2F4858] transition-colors">Manter logado</span>
                      </label>
                      <button type="button" onClick={() => setRecoveryStep('forgot')} className="text-sm text-[#B69B74] font-black uppercase tracking-tight hover:text-amber-700 transition-colors">Esqueci a senha</button>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-[#2F4858] text-white font-black py-5 rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] uppercase tracking-widest text-sm flex justify-center items-center gap-3">
                      {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Entrar no SimJuris'}
                    </button>
                  </form>
                </motion.div>
              )}

              {recoveryStep === 'forgot' && (
                <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-3xl font-black text-[#2F4858] mb-2 font-display">Recuperar Senha</h3>
                  <p className="text-slate-400 mb-10 text-sm font-bold uppercase tracking-widest leading-relaxed">Enviaremos um código por WhatsApp ou E-mail</p>
                  
                  {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-xs font-black rounded-2xl border border-red-100">{error}</div>}

                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail Cadastrado</label>
                       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail de acesso" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-white focus:border-[#B69B74]/50 outline-none transition-all font-bold text-slate-700" required />
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-[#B69B74] text-white font-black py-5 rounded-2xl hover:brightness-110 transition-all shadow-xl active:scale-[0.98] uppercase tracking-widest text-sm">
                      {loading ? 'Enviando...' : 'Solicitar Código'}
                    </button>
                    <button type="button" onClick={() => setRecoveryStep('login')} className="w-full text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">Voltar para Login</button>
                  </form>
                </motion.div>
              )}

              {(recoveryStep === 'code' || recoveryStep === 'reset') && (
                <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-3xl font-black text-[#2F4858] mb-2 font-display">Validar & Alterar</h3>
                  <p className="text-slate-400 mb-10 text-sm font-bold uppercase tracking-widest">{success || 'Insira o código enviado'}</p>
                  
                  {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-xs font-black rounded-2xl border border-red-100">{error}</div>}

                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Código de 6 dígitos</label>
                       <input type="text" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-white focus:border-[#B69B74]/50 outline-none transition-all font-black text-center text-2xl tracking-[0.5em] text-slate-700" required autoComplete="one-time-code" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nova Senha</label>
                       <div className="relative">
                         <input 
                           type={showPassword ? 'text' : 'password'} 
                           value={newPassword} 
                           onChange={(e) => setNewPassword(e.target.value)} 
                           placeholder="Mínimo 6 caracteres" 
                           className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-white focus:border-[#B69B74]/50 outline-none transition-all font-bold text-slate-700 pr-14" 
                           required 
                           autoComplete="new-password" 
                         />
                         <button 
                           type="button" 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-[#B69B74] transition-colors"
                         >
                           {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                         </button>
                       </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-[#2F4858] text-white font-black py-5 rounded-2xl hover:brightness-110 transition-all shadow-xl active:scale-[0.98] uppercase tracking-widest text-sm">
                      {loading ? 'Redefinindo...' : 'Confirmar Nova Senha'}
                    </button>
                    <button type="button" onClick={() => setRecoveryStep('login')} className="w-full text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">Cancelar</button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
