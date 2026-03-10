
import React, { useState } from 'react';
import { Shield, Info, ChevronRight } from 'lucide-react';
import { StepProps } from '../types';

const TermsStep: React.FC<StepProps> = ({ formData, updateFormData, onNext }) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-blue-900" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Termo de Consentimento</h3>
          <p className="text-slate-500 text-sm">
            Para sua segurança, precisamos do seu aceite conforme a LGPD.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative group">
        <label className="flex items-start gap-4 cursor-pointer">
          <input 
            type="checkbox" 
            checked={formData.termsAccepted}
            onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
            className="mt-1.5 w-5 h-5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
          />
          <div className="flex-1">
            <span className="text-slate-700 font-medium block">
              Eu aceito os termos de uso e privacidade
            </span>
            <button 
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-blue-600 underline mt-1 flex items-center gap-1 hover:text-blue-800 transition-colors"
            >
              <Info size={12} /> Clique aqui para ler os detalhes da LGPD
            </button>
          </div>
        </label>

        {showHint && (
          <div className="mt-4 p-4 bg-white border-l-4 border-blue-500 rounded-r shadow-sm text-sm text-slate-600 animate-in fade-in slide-in-from-top-2">
            O Hotel de Acolhimento se preocupa com a sua segurança e segue a Lei Geral de Proteção de dados Pessoais - LGPD (nº 13.709/2018). Buscando cooperar com a proteção dos seus dados e informações, precisamos do seu consentimento para prosseguir o seu agendamento.
          </div>
        )}
      </div>

      <button
        disabled={!formData.termsAccepted}
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/10"
      >
        Continuar <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default TermsStep;
