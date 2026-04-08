import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import api from '../api/api';

const History: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/api/notifications/logs');
        setLogs(response.data);
      } catch (err) {
        console.error('Erro ao buscar histórico de envios');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold text-[#2F4858] font-display">Histórico de Envios</h2>
        <p className="text-gray-400 font-medium text-sm mt-1 uppercase tracking-widest">Auditoria de Notificações</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input type="text" placeholder="Filtrar por nome ou processo..." className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#B69B74]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                <th className="px-8 py-4">Data/Hora</th>
                <th className="px-8 py-4">Evento</th>
                <th className="px-8 py-4">Cliente</th>
                <th className="px-8 py-4">Canal</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium italic">
                    Nenhum registro de envio encontrado ainda.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-gray-500">
                      {new Date(log.data_envio).toLocaleDateString('pt-BR')} <span className="text-gray-300 ml-1">{new Date(log.data_envio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-[#2F4858]">{log.event?.titulo || 'Evento Excluído'}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{log.numero_destino}</td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-400 uppercase">WhatsApp</td>
                    <td className="px-8 py-5">
                      <StatusBadge 
                        status={
                          log.status_envio === 'ENVIADO' ? 'enviado' : 
                          log.status_envio === 'ERRO' ? 'erro' : 'pendente'
                        } 
                        text={log.status_envio} 
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
