import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Shield } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (inputValue?: string) => void;
  title: string;
  message?: string;
  type?: 'confirm' | 'input' | 'alert';
  confirmLabel?: string;
  cancelLabel?: string;
  defaultValue?: string;
  placeholder?: string;
}

const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'confirm',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  defaultValue = '',
  placeholder = 'Digite aqui...'
}) => {
  const [inputValue, setInputValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (isOpen) setInputValue(defaultValue);
  }, [isOpen, defaultValue]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2F4858]/40 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden flex flex-col"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#2F4858] rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-[#B69B74]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#2F4858] tracking-tight">{title}</h3>
                    <p className="text-[10px] text-[#B69B74] font-black uppercase tracking-[0.2em] opacity-80">SimJuris Elite System</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {message && (
                <p className="text-slate-500 font-medium text-sm leading-relaxed pb-2 border-b border-slate-50">
                  {message}
                </p>
              )}

              {type === 'input' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor de Entrada</label>
                  <input 
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                    placeholder={placeholder}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all outline-none font-bold text-slate-700"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onConfirm(inputValue);
                    }}
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 px-6 bg-slate-50 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                >
                  {cancelLabel}
                </button>
                <button 
                  onClick={() => onConfirm(type === 'input' ? inputValue : undefined)}
                  className="flex-1 py-4 px-6 bg-[#2F4858] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                   {type === 'alert' ? <CheckCircle className="w-4 h-4 text-[#B69B74]" /> : <CheckCircle className="w-4 h-4 text-[#B69B74]" />}
                   {confirmLabel}
                </button>
              </div>
            </div>
            
            {/* Footer decoration */}
            <div className="h-2 bg-gradient-to-r from-[#2F4858] to-[#B69B74] opacity-80" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PremiumModal;
