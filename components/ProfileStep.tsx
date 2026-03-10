
import React from 'react';
import { User, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { StepProps, UserProfile } from '../types';

const ProfileStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
  const profiles = [
    {
      id: UserProfile.POLICIAL,
      label: 'Policial',
      description: 'Oficiais e Praças da PMBA',
      icon: <User className="w-6 h-6" />
    },
    {
      id: UserProfile.DEPENDENTE,
      label: 'Dependente',
      description: 'Pais, cônjuges e filhos de policiais',
      icon: <Users className="w-6 h-6" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">A hospedagem será para:</h3>
        <p className="text-slate-500 text-sm">Selecione o perfil de quem será hospedado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => updateFormData({ profile: profile.id })}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              formData.profile === profile.id
                ? 'border-blue-900 bg-blue-50/50 shadow-md ring-2 ring-blue-900/10'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              formData.profile === profile.id ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {profile.icon}
            </div>
            <h4 className={`font-bold ${formData.profile === profile.id ? 'text-blue-900' : 'text-slate-800'}`}>
              {profile.label}
            </h4>
            <p className="text-sm text-slate-500 mt-1">{profile.description}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 rounded-xl transition-all"
        >
          <ChevronLeft size={20} /> Voltar
        </button>
        <button
          disabled={!formData.profile}
          onClick={onNext}
          className="flex-[2] flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/10"
        >
          Próximo Passo <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProfileStep;
