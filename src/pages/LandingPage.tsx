import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CheckCircle, MessageSquare, 
  ArrowRight, Activity, CreditCard, ChevronDown, Star, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // features removido para estabilizar o build

  const pricing = [
    {
      name: "Plano Solo",
      price: "97",
      description: "Perfeito para advogados autônomos que buscam escala.",
      features: ["01 Conexão WhatsApp", "Usuários Ilimitados", "Pautas Ilimitadas", "Suporte via Ticket"],
      highlight: true
    },
    {
      name: "Plano Office",
      price: "197",
      description: "Ideal para escritórios em crescimento.",
      features: ["Até 03 Conexões WhatsApp", "Usuários Ilimitados", "Prioridade no Disparo", "Suporte VIP via WhatsApp"],
      highlight: false
    }
  ];

  const faqs = [
    {
      q: "Como o sistema se conecta ao meu WhatsApp?",
      a: "A conexão é feita de forma simples via QR Code, exatamente como no WhatsApp Web. O SimJuris utiliza uma tecnologia de conexão estável que não exige que seu celular fique ligado o tempo todo."
    },
    {
      q: "Posso personalizar as mensagens enviadas?",
      a: "Sim! Você pode definir templates personalizados por tipo de evento (Audiência, Prazo, Perícia, etc), incluindo links dinâmicos do Google Maps e orientações específicas."
    },
    {
      q: "O sistema é seguro perante a LGPD?",
      a: "Totalmente. O SimJuris segue os mais rigorosos padrões de proteção de dados, garantindo privacidade absoluta para as informações do seu escritório e de seus clientes."
    }
  ];

  // workflow removido para estabilizar o build

  return (
    <div className="min-h-screen bg-[#EFEDE8] font-sans selection:bg-[#B69B74] selection:text-white overflow-x-hidden">
      {/* Navbar Geada */}
      <nav className={`fixed top-0 inset-x-0 h-24 flex items-center justify-between px-6 lg:px-20 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2F4858] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Shield className="w-6 h-6 text-[#B69B74]" />
          </div>
          <span className="text-2xl font-black italic text-[#2F4858] tracking-tighter">SimJuris</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <a href="#features" className="hover:text-[#B69B74] transition-colors">Funcionalidades</a>
          <a href="#preview" className="hover:text-[#B69B74] transition-colors">Por Dentro</a>
          <a href="#pricing" className="hover:text-[#B69B74] transition-colors">Planos</a>
          <a href="#faq" className="hover:text-[#B69B74] transition-colors">Dúvidas</a>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-[#2F4858] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:brightness-125 active:scale-95 transition-all shadow-blue-900/20"
        >
          Acessar Sistema
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-6 lg:px-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#B69B74]/5 rounded-full blur-[100px] -z-10" />
        
        <div className="flex-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#B69B74]/20 rounded-full text-[9px] font-black uppercase text-[#B69B74] tracking-widest shadow-sm"
          >
            <Star className="w-3 h-3 fill-current" /> Automação Jurídica de Próxima Geração
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-7xl font-black text-[#2F4858] leading-[1.02] tracking-tight"
          >
            Sua advocacia no <span className="text-[#B69B74]">piloto automático.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl"
          >
            O SimJuris cuida de cada notificação, lembrete e pauta do seu escritório via WhatsApp. Tenha a produtividade de um escritório de elite.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-6 pt-4"
          >
            <a 
              href="https://wa.me/5548998584139?text=Olá! Gostaria de solicitar acesso ao SimJuris."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-10 py-5 bg-[#B69B74] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-amber-900/40 hover:scale-105 active:scale-95 transition-all"
            >
              <MessageSquare className="w-5 h-5" /> Iniciar Agora
            </a>
            <div className="flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Conexão WhatsApp Instante
            </div>
          </motion.div>
        </div>

        {/* Hero Image / Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: 50 }} 
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#B69B74]/20 to-transparent blur-3xl -z-10 group-hover:from-[#B69B74]/40 transition-all duration-500" />
          <img 
            src="/real_dashboard.png" 
            alt="SimJuris Cockpit" 
            onClick={() => setSelectedImage('/real_dashboard.png')}
            className="rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-white transform rotate-1 group-hover:rotate-0 transition-transform duration-1000 w-full cursor-zoom-in"
          />
        </motion.div>
      </section>

      {/* Preview Section */}
      <section id="preview" className="py-32 bg-[#2F4858] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#EFEDE8] to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-20 relative z-10">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-[10px] font-black uppercase text-[#B69B74] tracking-[0.5em]">The Elite Experience</h2>
            <p className="text-5xl lg:text-6xl font-black">Por dentro do sistema</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <img 
                src="/real_crm.png" 
                alt="CRM Timeline" 
                onClick={() => setSelectedImage('/real_crm.png')}
                className="rounded-[2rem] shadow-3xl border-2 border-white/5 cursor-zoom-in hover:brightness-110 transition-all" 
              />
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[#B69B74] font-black text-[10px] uppercase tracking-widest">
                  <Activity className="w-4 h-4" /> Gestão Inteligente
                </div>
                <h3 className="text-3xl font-black">Linha do Tempo Conectada</h3>
                <p className="text-slate-400 font-medium leading-relaxed">Visualize toda a jornada dos seus processos em um único painel, com status em tempo real e disparos automáticos de WhatsApp.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 md:mt-32"
            >
              <img 
                src="/real_dashboard.png" 
                alt="WhatsApp Notification" 
                onClick={() => setSelectedImage('/real_dashboard.png')}
                className="rounded-[2rem] shadow-3xl border-2 border-white/5 cursor-zoom-in hover:brightness-110 transition-all" 
              />
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[#B69B74] font-black text-[10px] uppercase tracking-widest">
                  <MessageSquare className="w-4 h-4" /> Automação de Mensagens
                </div>
                <h3 className="text-3xl font-black">Comunicação que Encanta</h3>
                <p className="text-slate-400 font-medium leading-relaxed">Seus clientes recebem confirmações, localizações e lembretes direto no celular, sem que você precise gerenciar nada manualmente.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 lg:px-20 bg-white relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-20">
          <div className="text-center space-y-4">
             <h2 className="text-[10px] font-black uppercase text-[#B69B74] tracking-[0.4em]">Investment Plan</h2>
             <p className="text-5xl font-black text-[#2F4858]">Invista na sua produtividade.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
             {pricing.map((p, i) => (
                <div key={i} className={`p-10 rounded-[3rem] border-2 transition-all duration-500 hover:scale-105 ${p.highlight ? 'bg-[#2F4858] border-[#2F4858] text-white shadow-2xl shadow-blue-900/20' : 'bg-slate-50 border-slate-100 text-[#2F4858]'}`}>
                   <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="text-2xl font-black">{p.name}</h4>
                        <p className={`text-xs mt-2 font-medium ${p.highlight ? 'text-blue-100/60' : 'text-slate-400'}`}>{p.description}</p>
                      </div>
                      <CreditCard className={p.highlight ? 'text-[#B69B74]' : 'text-slate-300'} />
                   </div>
                   
                   <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-lg font-bold">R$</span>
                      <span className="text-6xl font-black">{p.price}</span>
                      <span className={`text-sm font-bold ${p.highlight ? 'text-blue-100/60' : 'text-slate-400'}`}>/mês</span>
                   </div>

                   <ul className="space-y-4 mb-10">
                      {p.features.map((feat, idx) => (
                         <li key={idx} className="flex items-center gap-3 text-sm font-bold">
                            <CheckCircle className={`w-5 h-5 flex-shrink-0 ${p.highlight ? 'text-[#B69B74]' : 'text-emerald-500'}`} />
                            {feat}
                         </li>
                      ))}
                   </ul>

                   <a 
                      href={`https://wa.me/5548998584139?text=Olá! Gostaria de assinar o ${p.name} do SimJuris.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 group transition-all ${p.highlight ? 'bg-[#B69B74] text-white hover:brightness-110 shadow-xl shadow-amber-900/20' : 'bg-white border-2 border-[#2F4858] text-[#2F4858] hover:bg-[#2F4858] hover:text-white shadow-sm'}`}>
                      Assinar Plano <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </a>
                </div>
             ))}
          </div>
          
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sem fidelidade • Cancele quando quiser</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6 lg:px-20 bg-[#EFEDE8]">
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black uppercase text-[#B69B74] tracking-[0.4em]">Perguntas Frequentes</h2>
            <p className="text-4xl font-black text-[#2F4858]">Tire suas dúvidas</p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm transition-all">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-8 text-left flex justify-between items-center group"
                >
                  <span className="font-bold text-[#2F4858] pr-4">{f.q}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${openFaq === i ? 'bg-[#2F4858] text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-50"
                    >
                      <div className="p-8 pt-0 text-slate-500 font-medium leading-relaxed">
                        {f.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA Final */}
      <footer className="py-32 bg-[#2F4858] text-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 text-center space-y-16">
          <div className="space-y-8">
            <h2 className="text-5xl lg:text-7xl font-black leading-[1.1] max-w-4xl mx-auto">Pronto para elevar o nível do seu escritório?</h2>
            <p className="text-blue-100/60 text-xl font-medium max-w-2xl mx-auto">Junte-se aos advogados que já transformaram suas rotinas com a nossa tecnologia de cockpit jurídico.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href="https://wa.me/5548998584139?text=Quero começar a usar o SimJuris agora!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-12 py-6 bg-[#B69B74] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-amber-900/40 hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              Começar Agora <ArrowRight className="w-4 h-4" />
            </a>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-12 py-6 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
            >
              Já sou Cliente
            </button>
          </div>

          <div className="pt-32 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-blue-100/20">
            <div className="flex items-center gap-3">
               <Shield className="w-4 h-4 text-[#B69B74]" /> SimJuris • Official System
            </div>
            <div>&copy; {new Date().getFullYear()} By SimHal • Todos os direitos reservados</div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Zoom (Lightbox) */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-[#2F4858]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Preview Expandido" 
                className="w-full h-auto rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/10"
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-6 -right-6 w-12 h-12 bg-white text-[#2F4858] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
