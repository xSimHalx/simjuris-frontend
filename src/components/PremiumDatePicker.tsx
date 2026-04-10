import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface PremiumDatePickerProps {
  value: string; // ISO string or datetime-local string
  onChange: (value: string) => void;
  label?: string;
}

const PremiumDatePicker: React.FC<PremiumDatePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(viewDate.getFullYear());
    newDate.setMonth(viewDate.getMonth());
    newDate.setDate(day);
    setSelectedDate(newDate);
    // Não fecha ainda, espera a hora
  };

  const handleTimeChange = (type: 'hour' | 'minute', val: number) => {
    const newDate = new Date(selectedDate);
    if (type === 'hour') newDate.setHours(val);
    else newDate.setMinutes(val);
    setSelectedDate(newDate);
  };

  const confirmSelection = () => {
    // Formata para o formato que o input datetime-local esperava (ou ISO)
    // Mantendo a compatibilidade com o backend que usa ISO
    onChange(selectedDate.toISOString());
    setIsOpen(false);
  };

  const formatDateLabel = (date: Date) => {
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && (
        <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest">
          {label}
        </label>
      )}
      
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent bg-white hover:border-[#B69B74]/30 transition-all text-left group"
      >
        <CalendarIcon className="absolute left-4 w-5 h-5 text-slate-300 group-hover:text-[#B69B74] transition-colors" />
        <span className={`font-semibold ${value ? 'text-slate-700' : 'text-slate-300'}`}>
          {value ? formatDateLabel(new Date(value)) : 'Selecione data e hora'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center md:pr-[400px]">
            {/* Overlay de fundo */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              className="relative bg-[#2F4858] rounded-[2.5rem] p-8 shadow-2xl border border-white/10 w-full max-w-2xl mx-4"
            >
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-white/20 hover:text-white/60 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col md:flex-row gap-10">
              {/* Calendário */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center text-white">
                  <h4 className="font-black uppercase tracking-widest text-xs text-[#B69B74]">
                    {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronLeft size={16} /></button>
                    <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronRight size={16} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map(d => (
                    <div key={d} className="text-[9px] font-black text-slate-400 uppercase text-center py-2">{d}</div>
                  ))}
                  {Array.from({ length: firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === viewDate.getMonth() && selectedDate.getFullYear() === viewDate.getFullYear();
                    const isToday = new Date().getDate() === day && new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear();
                    
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        className={`
                          aspect-square rounded-xl text-xs font-bold transition-all flex items-center justify-center
                          ${isSelected ? 'bg-[#B69B74] text-white shadow-lg shadow-[#B69B74]/20' : 'text-slate-100 hover:bg-white/10'}
                          ${isToday && !isSelected ? 'border border-[#B69B74]/50' : ''}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seletor de Hora */}
              <div className="w-full md:w-32 flex flex-col gap-4">
                <h4 className="font-black uppercase tracking-widest text-xs text-[#B69B74] flex items-center gap-2">
                  <Clock size={14} /> Horário
                </h4>
                
                <div className="flex gap-2 h-44 overflow-hidden relative">
                  {/* Horas */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleTimeChange('hour', h)}
                        className={`w-full py-2 text-xs font-bold rounded-lg mb-1 transition-all ${selectedDate.getHours() === h ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        {h.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                  {/* Minutos */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {[0, 15, 30, 45].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleTimeChange('minute', m)}
                        className={`w-full py-2 text-xs font-bold rounded-lg mb-1 transition-all ${selectedDate.getMinutes() === m ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        {m.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={confirmSelection}
                    className="w-full py-4 bg-[#B69B74] text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Check size={18} /> Confirmar Data e Hora
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumDatePicker;
