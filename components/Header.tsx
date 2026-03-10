
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#001f3f] text-white py-6 shadow-2xl border-b-4 border-[#D4AF37] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-[0_4px_20px_rgba(212,175,55,0.4)] border border-white/20 transform hover:scale-105 transition-transform duration-300">
            <img 
              src="https://i.postimg.cc/MpV2JBBM/hcol.png" 
              alt="Logo DPS - Hotel de Acolhimento" 
              className="w-full h-auto object-contain brightness-110 saturate-150 contrast-110 drop-shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Bras%C3%A3o_da_PMBA.svg/1200px-Bras%C3%A3o_da_PMBA.svg.png";
              }}
            />
          </div>
          
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-tight">
              Hotel de <span className="text-gold-gradient">Acolhimento</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-0.5 w-4 bg-[#D4AF37]"></div>
              <p className="text-[10px] md:text-xs text-blue-200 font-bold uppercase tracking-[0.2em] opacity-90">
                Departamento de Promoção Social - PMBA
              </p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:block">
          <div className="px-5 py-2 rounded-full border border-[#D4AF37]/30 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] backdrop-blur-sm">
            Formulário de pré-agendamento
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
