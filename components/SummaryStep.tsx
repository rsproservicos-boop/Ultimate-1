
import React, { useState } from 'react';
import { CheckCircle2, ChevronLeft, Send, User, Calendar, Mail, RefreshCw, Copy, Check } from 'lucide-react';
import { FormData, Submission, NotificationSettings } from '../types';
import { api } from '../api';

interface Props {
  formData: FormData;
  onBack: () => void;
}

const DataGroup = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
      <Icon className="text-blue-900 w-4 h-4" />
      <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">{title}</span>
    </div>
    <div className="p-4 space-y-1">{children}</div>
  </div>
);

const DataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start py-1.5 border-b border-slate-50 last:border-0">
    <span className="text-xs text-slate-500 font-medium">{label}:</span>
    <span className="text-xs text-slate-800 font-bold text-right max-w-[60%]">{value || 'N/A'}</span>
  </div>
);

const SummaryStep: React.FC<Props> = ({ formData, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Gerador de UUID v4 real
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleFinish = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const generatedProtocol = `#PMBA-${Math.floor(1000 + Math.random() * 9000)}`;
    setProtocol(generatedProtocol);

    const submission: Submission = {
      ...formData,
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      protocolo: generatedProtocol,
      status: 'Pendente'
    };

    try {
      await api.addSubmission(submission);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Falha ao finalizar agendamento:', error);
      alert('Houve um erro técnico ao registrar seu agendamento. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-12 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800">Protocolo Registrado!</h3>
          <p className="text-slate-500 max-w-sm">Seu agendamento foi salvo com sucesso. Confira através do protocolo o andamento da sua solicitação</p>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full max-w-sm shadow-inner relative group">
          <p className="text-xs text-slate-400 font-bold uppercase mb-2">Seu Protocolo</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl font-mono font-bold text-blue-900 tracking-wider">{protocol}</p>
            <button 
              onClick={() => copyToClipboard(protocol)}
              className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-white text-blue-900 border border-slate-200 hover:bg-slate-50 shadow-sm'}`}
              title="Copiar Protocolo"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 max-w-xs">
          <p className="text-[10px] text-blue-600 font-bold leading-tight">
            IMPORTANTE: Anote ou tire um print deste protocolo. Ele será sua referência para consultas futuras.
          </p>
        </div>

        <button onClick={() => window.location.reload()} className="bg-blue-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-950 shadow-lg transition-all active:scale-95">Novo Agendamento</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Revisar e Finalizar</h3>
        <p className="text-sm text-slate-500">Confira os dados antes de registrar no sistema.</p>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        <DataGroup title="Dados do Titular" icon={User}>
          <DataRow label="Nome" value={formData.nome} />
          <DataRow label="CPF" value={formData.cpf} />
          <DataRow label="E-mail" value={formData.email} />
          <DataRow label="Matrícula" value={formData.matricula} />
          <DataRow label="Posto / Graduação" value={formData.postoGraduacao} />
          <DataRow label="Situação" value={formData.situacaoPolicial} />
          <DataRow label="Déficit Motor" value={formData.necessidadeMobilidadePolicial === 'Sim' ? `Sim - ${formData.detalheMobilidadePolicial}` : 'Não'} />
        </DataGroup>

        <DataGroup title="Hospedagem" icon={Calendar}>
          <DataRow label="Perfil" value={formData.profile || 'Não definido'} />
          <DataRow label="Data de Entrada" value={formData.dataEntrada} />
          <DataRow label="Data de Saída" value={formData.dataSaida} />
          <DataRow label="Horário Chegada" value={formData.horarioChegada} />
        </DataGroup>

        {formData.temDependente1 === 'Sim' && (
          <DataGroup title="Dependentes" icon={Mail}>
            <DataRow label="Dependente 1" value={formData.nomeDependente1} />
            <DataRow label="CPF Dependente 1" value={formData.cpfDependente1} />
            <DataRow label="Déficit Motor Dep. 1" value={formData.necessidadeMobilidadeDependente1 === 'Sim' ? `Sim - ${formData.detalheMobilidadeDependente1}` : 'Não'} />
            {formData.temOutroDependente === 'Sim' && (
              <>
                <DataRow label="Dependente 2" value={formData.nomeDependente2} />
                <DataRow label="CPF Dependente 2" value={formData.cpfDependente2} />
                <DataRow label="Déficit Motor Dep. 2" value={formData.necessidadeMobilidadeDependente2 === 'Sim' ? `Sim - ${formData.detalheMobilidadeDependente2}` : 'Não'} />
              </>
            )}
          </DataGroup>
        )}
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <button disabled={isSubmitting} onClick={onBack} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-4 rounded-xl transition-all">Voltar</button>
        <button 
          disabled={isSubmitting} 
          onClick={handleFinish} 
          className="flex-[2] flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <><Send size={20} /> Finalizar Agendamento</>}
        </button>
      </div>
    </div>
  );
};

export default SummaryStep;
