import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, RefreshCw, Power, 
  CheckCircle, AlertTriangle, ShieldCheck, QrCode, Zap, Send
} from 'lucide-react';
import api from '../api/api';

const Instances: React.FC = () => {
  const [status, setStatus] = useState<'online' | 'offline' | 'connecting'>('offline');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  // Busca o status atual da instância
  const fetchStatus = async () => {
    try {
      const response = await api.get('/api/instances/');
      const { status, instanceName } = response.data;
      void instanceName; // usado futuramente para exibição
      
      if (status === 'open') {
        setStatus('online');
        setQrCode(null);
      } else {
        setStatus('offline');
      }
    } catch (err) {
      setStatus('offline');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Polling automático apenas enquanto estiver tentando conectar (QR Code Visível)
  useEffect(() => {
    let interval: any;

    if (status === 'connecting') {
      interval = setInterval(() => {
        fetchStatus();
      }, 3000); // Checa a cada 3 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    setQrCode(null);

    try {
      const response = await api.post('/api/instances/connect');
      const { qrcode, message, state } = response.data;
      
      if (qrcode) {
        setQrCode(qrcode);
        setStatus('connecting');
      } else if (state === 'open' || message?.includes('pareado')) {
        await fetchStatus();
      }
    } catch (err: any) {
      setError('Falha ao gerar QR Code. Verifique se o serviço Evolution API está ativo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Deseja realmente desconectar o WhatsApp do escritório?')) return;
    
    setLoading(true);
    try {
      await api.post('/api/instances/logout');
      await fetchStatus();
    } catch (err) {
      setError('Erro ao desconectar.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2F4858] font-display">Gestão de WhatsApp</h2>
          <p className="text-gray-400 font-medium text-sm mt-1 uppercase tracking-widest">Motor de Notificações Evolut</p>
        </div>
        <button 
          onClick={fetchStatus}
          className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#2F4858] hover:shadow-sm transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Card de Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${
              status === 'online' ? 'bg-emerald-50 text-emerald-500 shadow-lg shadow-emerald-200' :
              status === 'connecting' ? 'bg-[#EFEDE8] text-amber-500 animate-pulse' :
              'bg-gray-50 text-gray-300'
            }`}>
              <MessageSquare className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl font-bold text-[#2F4858] mb-1 capitalize">{status}</h3>
            <p className="text-sm text-gray-400 font-medium mb-8">
              {status === 'online' ? 'Seu escritório está apto a enviar lembretes.' : 'A conexão precisa ser estabelecida.'}
            </p>

            <div className="w-full pt-6 border-t border-gray-50 space-y-4">
              {status === 'online' ? (
                <button 
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#6E3E3E]/10 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all border border-red-100"
                >
                  <Power className="w-4 h-4" /> Desconectar
                </button>
              ) : (
                <button 
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#2F4858] text-white rounded-2xl font-bold text-sm hover:bg-[#2F4858]-900 transition-all shadow-lg shadow-blue-900/20"
                >
                  <QrCode className="w-4 h-4" /> Gerar QR Code
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#2F4858] p-8 rounded-[2rem] text-white space-y-4">
            <div className="flex items-center gap-2 text-[#B69B74] font-bold">
              <ShieldCheck className="w-5 h-5" /> Segurança Anti-Ban
            </div>
            <p className="text-xs text-blue-100/70 leading-relaxed font-medium">
              O SimJuris utiliza um sistema de filas inteligente com atrasos aleatórios para evitar o bloqueio da sua conta de WhatsApp corporativo.
            </p>
          </div>
        </div>

        {/* Área do QR Code / Detalhes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col h-full min-h-[500px]">
            <div className="p-8 border-b border-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#B69B74]">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#2F4858]">Conexão da Instância</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Procedimento de Escaneamento</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              {qrCode ? (
                <div className="space-y-8 animate-slide-up">
                  <div className="p-6 bg-white border-8 border-gray-100 rounded-[2.5rem] shadow-inner inline-block">
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                  </div>
                  <div className="space-y-3 max-w-sm mx-auto">
                    <p className="text-gray-900 font-bold">Aponte a câmera do seu WhatsApp</p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Vá em <strong>Aparelhos Conectados</strong> {">"} <strong>Conectar um aparelho</strong> no seu celular.
                    </p>
                  </div>
                </div>
              ) : status === 'online' ? (
                <div className="space-y-6 animate-slide-up">
                  <div className="w-24 h-24 bg-emerald-50 flex items-center justify-center rounded-full mx-auto text-emerald-500">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-xl font-bold text-[#2F4858]">Conexão Estabelecida!</h5>
                    <p className="text-gray-400 font-medium">Sua instância <span className="text-[#B69B74] font-bold">instancia_teste_01</span> está operando normalmente.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-gray-300">
                  <QrCode className="w-24 h-24 mx-auto opacity-20" />
                  <p className="max-w-xs mx-auto font-medium text-gray-400">Clique em "Gerar QR Code" para iniciar a conexão com o WhatsApp do escritório.</p>
                </div>
              )}

              {error && (
                <div className="mt-8 flex items-center gap-2 p-4 bg-[#6E3E3E]/10 text-red-600 rounded-2xl border border-red-100 text-xs font-bold animate-pulse">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Instances;
