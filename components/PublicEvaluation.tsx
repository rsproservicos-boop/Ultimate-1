
import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, RefreshCw, Send, ShieldCheck, Heart, User, Shield, Home, Activity, ThumbsUp, Info } from 'lucide-react';
import { MovementEvaluation, MovementRecord } from '../types';
import { api } from '../api';

interface Props {
  movementId: string;
  onFinished: () => void;
}

const PublicEvaluation: React.FC<Props> = ({ movementId, onFinished }) => {
  const [movement, setMovement] = useState<MovementRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [finished, setFinished] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);

  const [form, setForm] = useState<MovementEvaluation>({
    perfil: '',
    estrelas: 0,
    motivoHospedagem: '',
    avaliacaoRecepcao: '',
    equipeRespeitosa: '',
    informacoesClaras: '',
    tempoCheckin: '',
    tempoCheckout: '',
    confortoQuarto: '',
    limpezaBanheiro: '',
    limpezaGeral: '',
    sentiuSeguro: '',
    infraestruturaAtendeu: '',
    contribuicaoSaude: '',
    contribuicaoSocial: '',
    custoBeneficio: '',
    servicosAdequados: '',
    sugestaoBoaExperiencia: '',
    sugestaoAtendimento: '',
    recomendaria: 10,
    notaGeral: 10
  });

  useEffect(() => {
    const loadMovement = async () => {
      try {
        const data = await api.getMovementById(movementId);
        if (data) {
          if (data.evaluation) {
            setFinished(true);
          }
          setMovement(data);
        } else {
          setError('Registro não encontrado.');
        }
      } catch (e) {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    loadMovement();
  }, [movementId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdAccepted) {
      alert('Por favor, aceite os termos da LGPD.');
      return;
    }
    if (form.estrelas === 0) {
      alert('Por favor, selecione uma avaliação em estrelas.');
      return;
    }

    setSubmitting(true);
    try {
      await api.updateMovementEvaluation(movementId, form);
      setFinished(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      alert('Erro ao salvar avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <RefreshCw className="animate-spin text-[#001f3f] mb-4" size={40} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando formulário...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <ShieldCheck size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-black text-slate-800 uppercase mb-2">Ops! Link Inválido</h2>
        <p className="text-slate-500 text-sm max-w-xs">{error}</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-[#001f3f] uppercase mb-4 tracking-tighter">Muito Obrigado!</h2>
        <p className="text-slate-600 text-sm max-w-sm mb-8 leading-relaxed">
          Sua avaliação foi registrada com sucesso. Agradecemos por nos ajudar a melhorar o acolhimento do DPS PMBA.
        </p>
        <button 
          onClick={onFinished}
          className="bg-[#001f3f] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  const QuestionGroup = ({ title, description }: { title: string, description?: string }) => (
    <div className="mb-4">
      <h3 className="text-sm font-black text-[#001f3f] uppercase tracking-wide">{title}</h3>
      {description && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{description}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* HEADER DO FORMULÁRIO */}
        <div className="bg-[#001f3f] p-10 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Heart size={100} className="text-[#D4AF37]" /></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
          
          <img src="https://i.postimg.cc/MpV2JBBM/hcol.png" alt="Logo" className="w-20 h-20 mx-auto mb-6 object-contain bg-white rounded-2xl p-2 shadow-xl" />
          
          <h1 className="text-white text-3xl font-black uppercase tracking-tighter mb-2">Pesquisa de <span className="text-[#D4AF37]">Satisfação</span></h1>
          <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Hotel de Acolhimento - DPS PMBA</p>
          
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
            <User size={14} className="text-[#D4AF37]" />
            <span className="text-white text-[11px] font-black uppercase tracking-widest">{movement?.nome}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
          {/* SEÇÃO 1: AVALIAÇÃO GERAL E SEGURANÇA */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-200 space-y-10">
            <div className="flex flex-col items-center text-center space-y-6">
              <QuestionGroup title="Como você avalia sua estadia geral?" description="Sua nota ajuda a medir a qualidade do nosso serviço" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setForm({ ...form, estrelas: star })} className={`p-2 transition-all transform active:scale-90 ${form.estrelas >= star ? 'text-amber-500 scale-110' : 'text-slate-100 hover:text-slate-200'}`}>
                    <Star size={48} fill={form.estrelas >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={18} className="text-[#D4AF37]" />
                    <QuestionGroup title="Sentiu-se Seguro?" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {['Sim', 'Parcialmente', 'Não'].map(opt => (
                      <button key={opt} type="button" onClick={() => setForm({...form, sentiuSeguro: opt})} className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${form.sentiuSeguro === opt ? 'bg-[#001f3f] border-[#001f3f] text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}>{opt}</button>
                    ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={18} className="text-[#D4AF37]" />
                    <QuestionGroup title="Informações Claras?" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {['Sim, totalmente', 'Parcialmente', 'Não'].map(opt => (
                      <button key={opt} type="button" onClick={() => setForm({...form, informacoesClaras: opt})} className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${form.informacoesClaras === opt ? 'bg-[#001f3f] border-[#001f3f] text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}>{opt}</button>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* SEÇÃO 2: INFRAESTRUTURA E CONFORTO */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-200 space-y-10">
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-inner">
                  <Home size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#001f3f] uppercase tracking-tight">Infraestrutura e Conforto</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Qualidade física e serviços básicos</p>
                </div>
              </div>

              <div className="space-y-4">
                <QuestionGroup title="A Infraestrutura atendeu suas necessidades?" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                   {['Sim, totalmente', 'Em parte', 'Não atendeu'].map(opt => (
                     <button key={opt} type="button" onClick={() => setForm({...form, infraestruturaAtendeu: opt})} className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${form.infraestruturaAtendeu === opt ? 'bg-[#001f3f] border-[#001f3f] text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{opt}</button>
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                {[
                  { label: 'Limpeza Geral', key: 'limpezaGeral' },
                  { label: 'Higiene do Banheiro', key: 'limpezaBanheiro' },
                  { label: 'Conforto do Quarto', key: 'confortoQuarto' }
                ].map(item => (
                  <div key={item.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">{item.label}</label>
                    <select required value={(form as any)[item.key]} onChange={(e) => setForm({ ...form, [item.key]: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all">
                       <option value="">Selecione...</option>
                       <option value="Excelente">Excelente</option>
                       <option value="Bom">Bom</option>
                       <option value="Regular">Regular</option>
                       <option value="Ruim">Ruim</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-50">
                <QuestionGroup title="Os serviços oferecidos foram adequados?" description="Ex: Roupa de cama, wifi, acolhimento" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                   {['Sim, plenamente', 'Parcialmente', 'Não'].map(opt => (
                     <button key={opt} type="button" onClick={() => setForm({...form, servicosAdequados: opt})} className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${form.servicosAdequados === opt ? 'bg-[#001f3f] border-[#001f3f] text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{opt}</button>
                   ))}
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: IMPACTO E CUSTO-BENEFÍCIO */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-200 space-y-10">
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#001f3f] uppercase tracking-tight">Impacto Social e Saúde</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">O valor da hospedagem para você</p>
                </div>
              </div>

              <div className="space-y-4">
                <QuestionGroup title="Contribuição p/ Saúde" description="Quanto o Hotel facilitou seu acesso ao tratamento?" />
                <select required value={form.contribuicaoSaude} onChange={(e) => setForm({...form, contribuicaoSaude: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-xs font-bold outline-none focus:border-[#D4AF37] transition-all">
                  <option value="">Selecione uma opção...</option>
                  <option value="Muito">Muito</option>
                  <option value="Pouco">Pouco</option>
                  <option value="Irrelevante">Irrelevante</option>
                  <option value="Não realizei tratamento de saúde">Não realizei tratamento de saúde</option>
                </select>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-50">
                <QuestionGroup title="Contribuição Social" description="Quanto o hotel facilitou para realização do seu TAF, missão administrativa, outros?" />
                <select required value={form.contribuicaoSocial} onChange={(e) => setForm({...form, contribuicaoSocial: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-xs font-bold outline-none focus:border-[#D4AF37] transition-all">
                  <option value="">Selecione uma opção...</option>
                  <option value="Muito">Muito</option>
                  <option value="Pouco">Pouco</option>
                  <option value="Irrelevante">Irrelevante</option>
                  <option value="Não realizei nenhuma das alternativas">Não realizei nenhuma das alternativas</option>
                </select>
              </div>

              <div className="space-y-4 pt-6">
                <QuestionGroup title="Custo Benefício" description="Avaliação entre o custo e o benefício recebido" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Excelente', 'Bom', 'Regular', 'Ruim'].map(opt => (
                    <button key={opt} type="button" onClick={() => setForm({...form, custoBeneficio: opt})} className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${form.custoBeneficio === opt ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: RECOMENDAÇÃO (0-10) */}
          <div className="bg-[#001f3f] p-8 md:p-12 rounded-[3.5rem] shadow-2xl space-y-12 relative overflow-hidden border-b-8 border-[#D4AF37]">
            <div className="absolute top-0 right-0 p-8 opacity-5"><ThumbsUp size={150} className="text-white" /></div>
            
            <div className="text-center space-y-3 relative z-10">
              <ThumbsUp className="text-[#D4AF37] mx-auto mb-4" size={40} />
              <h2 className="text-white text-xl font-black uppercase tracking-tight">Recomendaria o Hotel?</h2>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">De 0 a 10, qual a chance de você recomendar o HACOLHE?</p>
            </div>
            
            <div className="space-y-10 relative z-10">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-4xl font-black text-[#001f3f] shadow-2xl border-4 border-[#D4AF37] transform hover:scale-110 transition-transform">
                  {form.recomendaria}
                </div>
                <input 
                  type="range" min="0" max="10" step="1" 
                  value={form.recomendaria} 
                  onChange={(e) => setForm({...form, recomendaria: parseInt(e.target.value)})} 
                  className="w-full h-4 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#D4AF37] border border-white/10" 
                />
                <div className="w-full flex justify-between px-2 text-[10px] font-black text-blue-300 uppercase tracking-widest">
                  <span>0 - Nunca</span>
                  <span>10 - Com Certeza</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 5: COMENTÁRIOS FINAIS */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-200 space-y-8">
            <QuestionGroup title="Para finalizar, fale com a gente" description="Sugestões e elogios são bem-vindos" />
            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">O que mais contribuiu para sua boa experiência?</label>
                 <textarea rows={3} value={form.sugestaoBoaExperiencia} onChange={(e) => setForm({...form, sugestaoBoaExperiencia: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-sm outline-none focus:border-[#001f3f] transition-all resize-none" placeholder="Conte-nos os pontos positivos..." />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">O que pode ser melhorado no atendimento / acolhimento?</label>
                 <textarea rows={3} value={form.sugestaoAtendimento} onChange={(e) => setForm({...form, sugestaoAtendimento: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-sm outline-none focus:border-[#001f3f] transition-all resize-none" placeholder="Sua sugestão é muito importante..." />
               </div>
            </div>
          </div>

          {/* CONSENTIMENTO E ENVIO */}
          <div className="space-y-6">
            <div className="bg-emerald-50 p-6 rounded-[2rem] border-2 border-emerald-100 flex items-start gap-4 shadow-sm">
              <input type="checkbox" required checked={lgpdAccepted} onChange={(e) => setLgpdAccepted(e.target.checked)} className="mt-1 w-6 h-6 rounded-lg border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
              <p className="text-[10px] text-emerald-700 font-bold uppercase leading-relaxed">
                Autorizo o DPS PMBA a utilizar estas informações de forma anônima para fins estatísticos e de melhoria contínua dos serviços prestados, em conformidade com a LGPD.
              </p>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-[#001f3f] text-white py-7 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.4em] shadow-2xl hover:bg-[#002f5f] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 border-b-4 border-[#D4AF37]"
            >
              {submitting ? <RefreshCw className="animate-spin" size={24} /> : <><Send size={20} /> ENVIAR MINHA AVALIAÇÃO</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicEvaluation;
