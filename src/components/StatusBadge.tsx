import React from 'react';

interface StatusBadgeProps {
  status: 'enviado' | 'pendente' | 'urgente' | 'online' | 'conectando' | 'offline' | 'erro';
  text: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const styles = {
    enviado: "bg-green-50 text-green-700 border-green-200",
    pendente: "bg-[#EFEDE8] text-[#6E3E3E] border-[#B69B74]/50",
    urgente: "bg-[#6E3E3E]/10 text-[#6E3E3E] border-[#6E3E3E]/30",
    online: "bg-green-50 text-green-700 border-green-200",
    conectando: "bg-amber-50 text-amber-700 border-amber-200",
    offline: "bg-red-50 text-red-700 border-red-200",
    erro: "bg-red-50 text-red-700 border-red-200"
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-gray-50 text-gray-700'}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
