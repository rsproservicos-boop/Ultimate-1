
import React from 'react';

interface Props {
  currentStep: number;
  totalSteps: number;
}

const StepProgressBar: React.FC<Props> = ({ currentStep, totalSteps }) => {
  const steps = [
    'Consentimento',
    'Perfil',
    'Dados',
    'Revisão'
  ];

  return (
    <div className="px-8 pt-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 -z-10"></div>
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum <= currentStep;
          return (
            <div key={idx} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isActive ? 'bg-blue-900 text-white scale-110' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {stepNum}
              </div>
              <span className={`text-[10px] mt-2 font-semibold uppercase tracking-wider ${
                isActive ? 'text-blue-900' : 'text-slate-400'
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgressBar;
