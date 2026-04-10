import React from 'react';

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: 'phone' | 'document' | 'none';
  icon?: React.ReactNode;
  label?: string;
}

const MaskedInput: React.FC<MaskedInputProps> = ({ mask, icon, label, value, onChange, className, ...props }) => {
  
  const applyMask = (val: string) => {
    const clean = val.replace(/\D/g, '');
    
    if (mask === 'phone') {
      // (99) 99999-9999
      if (clean.length <= 11) {
        return clean
          .replace(/^(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2')
          .substring(0, 15);
      }
    } else if (mask === 'document') {
      // CPF: 999.999.999-99 ou CNPJ: 99.999.999/9999-99
      if (clean.length <= 11) {
        return clean
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})/, '$1-$2')
          .substring(0, 14);
      } else {
        return clean
          .replace(/^(\d{2})(\d)/, '$1.$2')
          .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/\.(\d{3})(\d)/, '.$1/$2')
          .replace(/(\d{4})(\d)/, '$1-$2')
          .substring(0, 18);
      }
    }
    return val;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mask === 'none') {
      onChange?.(e);
      return;
    }

    const maskedValue = applyMask(e.target.value);
    const event = {
      ...e,
      target: {
        ...e.target,
        value: maskedValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange?.(event);
  };

  const inputCls = "w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent bg-white focus:border-[#B69B74]/50 focus:ring-4 focus:ring-[#B69B74]/10 transition-all outline-none font-semibold text-slate-700 placeholder:text-slate-300";

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-widest whitespace-nowrap">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B69B74] transition-colors">
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
          </div>
        )}
        <input
          {...props}
          value={value}
          onChange={handleChange}
          className={`${inputCls} ${className || ''}`}
        />
      </div>
    </div>
  );
};

export default MaskedInput;
