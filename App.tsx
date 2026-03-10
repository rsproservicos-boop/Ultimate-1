
import React, { useState, useEffect } from 'react';
import { Shield, ChevronRight, ChevronLeft, Building2, CheckCircle2, AlertCircle, LayoutDashboard, FileText, Search, ClipboardList, ArrowRight, Info } from 'lucide-react';
import { UserProfile, FormData } from './types';
import Header from './components/Header';
import StepProgressBar from './components/StepProgressBar';
import TermsStep from './components/TermsStep';
import ProfileStep from './components/ProfileStep';
import DataFormStep from './components/DataFormStep';
import SummaryStep from './components/SummaryStep';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import StatusCheck from './components/StatusCheck';
import PublicEvaluation from './components/PublicEvaluation';

type ViewMode = 'landing' | 'form' | 'status' | 'admin' | 'survey';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    termsAccepted: false,
    profile: null,
    nome: '',
    email: '',
    matricula: '',
    postoGraduacao: '',
    cpf: '',
    telefone: '',
    contatoUnidade: '',
    escolaridade: '',
    generoPolicial: '',
    possuiPlanoSaudePolicial: '',
    qualPlanoPolicial: '',
    numeroCarteiraPlanoPolicial: '',
    endereco: '',
    cidadeResidencia: '',
    pretensaoSalvadorPolicial: '',
    pretensaoOutroExplicaPolicial: '',
    situacaoPolicial: '',
    
    // Novos campos
    dataAdmissaoPM: '',
    unidadeTrabalhoPM: '',
    contatoUnidadePM: '',
    necessidadeMobilidadePolicial: 'Não',
    detalheMobilidadePolicial: '',
    problemaSaude: '',
    medicacaoContinua: '',
    vagaEstacionamento: 'Não',
    veiculoInfo: '',

    dataEntrada: '',
    dataSaida: '',
    horarioChegada: '',
    motivo: '',
    temDependente1: 'Não',
    nomeDependente1: '',
    cpfDependente1: '',
    permanenciaDependente1: '',
    emailDependente1: '',
    dataNascimentoDependente1: '',
    whatsappDependente1: '',
    generoDependente1: '',
    parentescoDependente1: '',
    parentescoOutroExplica1: '',
    necessidadeMobilidadeDependente1: 'Não',
    detalheMobilidadeDependente1: '',
    pretensaoSalvadorDependente1: '',
    possuiPlanoDependente1: '',
    planoENumeroDependente1: '',
    temOutroDependente: 'Não',
    nomeDependente2: '',
    cpfDependente2: '',
    emailDependente2: '',
    dataNascimentoDependente2: '',
    generoDependente2: '',
    parentescoDependente2: '',
    parentescoOutroExplica2: '',
    necessidadeMobilidadeDependente2: 'Não',
    detalheMobilidadeDependente2: '',
    pretensaoSalvadorDependente2: '',
    possuiPlanoDependente2: '',
    planoENumeroDependente2: '',
    nomeTitular: '',
    matriculaTitular: '',
    parentesco: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const id = params.get('id');

    if (view === 'survey' && id) {
      setViewMode('survey');
      setSurveyId(id);
    }
  }, []);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <TermsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
      case 2:
        return <ProfileStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <DataFormStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <SummaryStep formData={formData} onBack={prevStep} />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    setViewMode('landing');
    setIsAdminAuthenticated(false);
  };

  if (viewMode === 'survey' && surveyId) {
    return (
      <PublicEvaluation 
        movementId={surveyId} 
        onFinished={() => {
          setViewMode('landing');
          window.history.replaceState({}, '', window.location.pathname);
        }} 
      />
    );
  }

  if (viewMode === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin 
          onLoginSuccess={() => setIsAdminAuthenticated(true)} 
          onBack={() => setViewMode('landing')} 
        />
      );
    }
    return <AdminDashboard onBack={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl relative">
        <button 
          onClick={() => setViewMode('admin')}
          className="absolute -top-4 right-4 md:right-0 bg-[#001f3f] text-[#D4AF37] p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-50 group"
          title="Acesso Administrativo"
        >
          <LayoutDashboard size={20} />
          <span className="absolute right-full mr-2 bg-[#001f3f] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">Painel Admin</span>
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden mb-12">
          {viewMode === 'landing' && (
            <div className="p-8 md:p-12 flex flex-col items-center animate-in fade-in duration-500">
               <div className="flex items-center gap-6 mb-8">
                 <div className="w-32 h-32 bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center p-3">
                   <img src="https://i.postimg.cc/MpV2JBBM/hcol.png" alt="Logo DPS" className="w-full h-full object-contain saturate-150 contrast-110 brightness-110 drop-shadow-md" />
                 </div>
                 <div className="w-32 h-32 bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center p-3">
                   <img src="https://i.postimg.cc/bwBGWKQw/901f1cb2-5202-438d-87e0-a74e75da7d2b.png" alt="Logo Adicional" className="w-full h-full object-contain saturate-150 contrast-110 brightness-110 drop-shadow-md" />
                 </div>
               </div>
               
               <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-[#001f3f] mb-1 tracking-tight">
                    Departamento de <span className="text-[#D4AF37]">Promoção Social</span>
                  </h2>
                  <h3 className="text-lg font-bold text-[#001f3f] mb-3 uppercase tracking-tight opacity-80">
                    Coordenação de Assistência Social
                  </h3>
                  <div className="h-1 w-16 bg-[#D4AF37] mx-auto rounded-full mb-4"></div>
                  <p className="text-slate-600 font-bold uppercase text-xs tracking-widest">Hotel de Acolhimento (HACOLHE)</p>
               </div>

               <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 md:p-8 mb-10 max-w-2xl relative group overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                   <Building2 size={80} className="text-[#001f3f]" />
                 </div>
                 <div className="flex gap-4 items-start relative z-10">
                   <div className="flex flex-col items-center gap-2">
                     <div className="bg-[#001f3f] p-2 rounded-xl text-[#D4AF37] shrink-0 shadow-lg shadow-blue-900/10">
                       <Info size={24} />
                     </div>
                     <img 
                       src="https://i.postimg.cc/cCm78tF1/policia-militar-da-bahia-pm-ba-removebg-preview.png" 
                       alt="Logo PMBA" 
                       className="w-10 h-10 object-contain brightness-110 saturate-150" 
                     />
                   </div>
                   <div className="space-y-2">
                     <h4 className="font-black text-[#001f3f] text-sm uppercase tracking-tight">Sobre o Serviço</h4>
                     <p className="text-slate-700 text-sm leading-relaxed font-medium">
                       <span className="font-black text-[#001f3f]">Hotel de Acolhimento</span> – O serviço HACOLHE destina-se aos oficiais e praças da Polícia Militar da Bahia (PMBA), bem como aos seus dependentes legais (pais, cônjuges e filhos), oriundos do interior do Estado e da Região Metropolitana de Salvador (RMS), que necessitem de acolhimento temporário durante a realização de consultas médicas, exames ou procedimentos cirúrgicos na capital. PM BA, uma Força a Serviço do Cidadão.
                     </p>
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                  <button 
                    onClick={() => setViewMode('form')}
                    className="group bg-[#001f3f] text-white p-8 rounded-[2rem] flex flex-col items-start gap-4 transition-all hover:scale-[1.02] shadow-xl hover:shadow-[#001f3f]/20"
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#001f3f] transition-colors">
                      <ClipboardList size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-black text-lg uppercase tracking-tight">Novo Agendamento</h3>
                      <p className="text-blue-200 text-xs mt-1">Solicite sua hospedagem no HACOLHE</p>
                    </div>
                    <ArrowRight className="mt-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" size={20} />
                  </button>

                  <button 
                    onClick={() => setViewMode('status')}
                    className="group bg-white border-2 border-slate-200 p-8 rounded-[2rem] flex flex-col items-start gap-4 transition-all hover:border-[#D4AF37] hover:scale-[1.02] shadow-sm hover:shadow-xl"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-[#001f3f] group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-colors">
                      <Search size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-black text-lg text-[#001f3f] uppercase tracking-tight">Consultar Status</h3>
                      <p className="text-slate-500 text-xs mt-1">Acompanhe sua solicitação via protocolo</p>
                    </div>
                    <ArrowRight className="mt-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-[#D4AF37]" size={20} />
                  </button>
               </div>
            </div>
          )}

          {viewMode === 'form' && (
            <>
              <div className="p-8 md:p-12 border-b border-slate-100 bg-gradient-to-br from-[#001f3f]/5 to-white flex flex-col items-center text-center gap-4 relative">
                <button 
                  onClick={() => setViewMode('landing')}
                  className="absolute left-6 top-6 p-2 text-slate-400 hover:text-[#001f3f] transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="w-20 h-20 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center p-2">
                   <img src="https://i.postimg.cc/MpV2JBBM/hcol.png" alt="Logo DPS" className="w-full h-full object-contain saturate-150 contrast-110 brightness-110 drop-shadow-md" />
                </div>
                <h2 className="text-2xl font-black text-[#001f3f] tracking-tight">Solicitação de <span className="text-[#D4AF37]">Acolhimento</span></h2>
              </div>
              <StepProgressBar currentStep={currentStep} totalSteps={4} />
              <div className="p-8 md:p-12">
                {renderStep()}
              </div>
            </>
          )}

          {viewMode === 'status' && (
            <div className="p-8 md:p-12 animate-in slide-in-from-bottom-4 duration-500">
               <button 
                  onClick={() => setViewMode('landing')}
                  className="mb-8 flex items-center gap-2 text-slate-500 hover:text-[#001f3f] font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  <ChevronLeft size={16} /> Voltar ao Início
                </button>
                <StatusCheck />
            </div>
          )}
        </div>
        
        <footer className="mt-auto text-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-px w-32 bg-slate-300"></div>
            <div className="font-black text-[#001f3f]/40 text-[10px] uppercase tracking-[0.3em]">
              Departamento de Promoção Social
            </div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Polícia Militar da Bahia - © {new Date().getFullYear()}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
