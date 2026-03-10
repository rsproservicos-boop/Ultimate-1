
import React from 'react';
import { ChevronRight, ChevronLeft, Phone, CreditCard, User, MapPin, Briefcase, PlusCircle, Calendar, Clock, Users, Mail, Car, Activity, HeartPulse } from 'lucide-react';
import { StepProps, UserProfile } from '../types';

const DataFormStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
      <Icon className="text-blue-900 w-5 h-5" />
      <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wide">{title}</h3>
    </div>
  );

  const inputClass = "w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900 transition-all shadow-sm";
  const selectClass = "w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white text-slate-900 focus:ring-2 focus:ring-blue-900 transition-all shadow-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* SEÇÃO 1: DADOS DO POLICIAL */}
      <div className="bg-white rounded-xl space-y-6">
        <SectionTitle icon={User} title="Dados do Policial Titular" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
            <input required type="text" value={formData.nome} onChange={(e) => updateFormData({ nome: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Mail size={12}/> E-mail para Receber Notificações</label>
            <input required type="email" value={formData.email} onChange={(e) => updateFormData({ email: e.target.value })} className={inputClass} placeholder="exemplo@email.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">CPF</label>
            <input required type="text" value={formData.cpf} onChange={(e) => updateFormData({ cpf: e.target.value })} className={inputClass} placeholder="000.000.000-00" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Matrícula</label>
            <input required type="text" value={formData.matricula} onChange={(e) => updateFormData({ matricula: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Posto / Graduação</label>
            <select required value={formData.postoGraduacao} onChange={(e) => updateFormData({ postoGraduacao: e.target.value })} className={selectClass}>
              <option value="">Selecione...</option>
              <option value="Soldado">Soldado</option>
              <option value="Cabo">Cabo</option>
              <option value="Sargento">Sargento</option>
              <option value="Subtenente">Subtenente</option>
              <option value="Tenente">Tenente</option>
              <option value="Capitão">Capitão</option>
              <option value="Major">Major</option>
              <option value="Tenente Coronel">Tenente Coronel</option>
              <option value="Coronel">Coronel</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Data de Admissão na Corporação</label>
            <input required type="date" value={formData.dataAdmissaoPM} onChange={(e) => updateFormData({ dataAdmissaoPM: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Unidade de Trabalho</label>
            <input required type="text" value={formData.unidadeTrabalhoPM} onChange={(e) => updateFormData({ unidadeTrabalhoPM: e.target.value })} className={inputClass} placeholder="Ex: 1º BPM" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Contato (com DDD)</label>
            <input required type="text" value={formData.contatoUnidadePM} onChange={(e) => updateFormData({ contatoUnidadePM: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Escolaridade</label>
            <select required value={formData.escolaridade} onChange={(e) => updateFormData({ escolaridade: e.target.value })} className={selectClass}>
              <option value="">Selecione...</option>
              <option value="Fundamental">Fundamental</option>
              <option value="Médio">Médio</option>
              <option value="Superior">Superior</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Gênero</label>
            <select required value={formData.generoPolicial} onChange={(e) => updateFormData({ generoPolicial: e.target.value })} className={selectClass}>
              <option value="">Selecione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Transgênero">Transgênero</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Situação Funcional</label>
            <select required value={formData.situacaoPolicial} onChange={(e) => updateFormData({ situacaoPolicial: e.target.value })} className={selectClass}>
              <option value="">Selecione...</option>
              <option value="Ativa">Ativa</option>
              <option value="Reserva Remunerada">Reserva Remunerada</option>
              <option value="Reformado">Reformado</option>
              <option value="Pensionista">Pensionista</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Possui Plano de Saúde?</label>
            <select required value={formData.possuiPlanoSaudePolicial} onChange={(e) => updateFormData({ possuiPlanoSaudePolicial: e.target.value })} className={selectClass}>
              <option value="">Selecione...</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        </div>

        {formData.possuiPlanoSaudePolicial === 'Sim' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg animate-in fade-in duration-300">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Qual é o Plano?</label>
              <input required type="text" value={formData.qualPlanoPolicial} onChange={(e) => updateFormData({ qualPlanoPolicial: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Número da Carteira</label>
              <input required type="text" value={formData.numeroCarteiraPlanoPolicial} onChange={(e) => updateFormData({ numeroCarteiraPlanoPolicial: e.target.value })} className={inputClass} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin size={12}/> Endereço Completo</label>
            <input required type="text" value={formData.endereco} onChange={(e) => updateFormData({ endereco: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Cidade de Residência</label>
            <input required type="text" value={formData.cidadeResidencia} onChange={(e) => updateFormData({ cidadeResidencia: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">O que pretende fazer em Salvador?</label>
            <select required value={formData.pretensaoSalvadorPolicial} onChange={(e) => updateFormData({ pretensaoSalvadorPolicial: e.target.value })} className={selectClass}>
              <option value="">Selecione...</option>
              <option value="Realizar algum tratamento de saúde ou coisa equivalente">Tratamento de Saúde</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
        {formData.pretensaoSalvadorPolicial === 'Outro' && (
          <div className="space-y-1 animate-in slide-in-from-top-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Especifique a pretensão</label>
            <input required type="text" value={formData.pretensaoOutroExplicaPolicial} onChange={(e) => updateFormData({ pretensaoOutroExplicaPolicial: e.target.value })} className={inputClass} />
          </div>
        )}
      </div>

      {/* SEÇÃO 2: SAÚDE E BEM ESTAR */}
      <div className="bg-white rounded-xl space-y-6">
        <SectionTitle icon={HeartPulse} title="Informações de Saúde" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#001f3f] rounded-full flex items-center justify-center text-white">
                   <Activity size={20} />
                 </div>
                 <span className="font-bold text-[#001f3f] text-sm">Possui Déficit motor? (Policial)</span>
               </div>
               <select 
                 value={formData.necessidadeMobilidadePolicial} 
                 onChange={(e) => updateFormData({ necessidadeMobilidadePolicial: e.target.value })} 
                 className="p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-bold outline-none min-w-[100px]"
               >
                 <option value="Não">Não</option>
                 <option value="Sim">Sim</option>
               </select>
            </div>
            {formData.necessidadeMobilidadePolicial === 'Sim' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Informe a necessidade</label>
                <textarea rows={2} required value={formData.detalheMobilidadePolicial} onChange={(e) => updateFormData({ detalheMobilidadePolicial: e.target.value })} className={inputClass} placeholder="Descreva a necessidade de mobilidade..." />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Possui algum problema de saúde? Qual?</label>
            <textarea rows={2} value={formData.problemaSaude} onChange={(e) => updateFormData({ problemaSaude: e.target.value })} className={inputClass} placeholder="Descreva se houver..." />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Faz uso de medicação contínua? Qual?</label>
            <textarea rows={2} value={formData.medicacaoContinua} onChange={(e) => updateFormData({ medicacaoContinua: e.target.value })} className={inputClass} placeholder="Nome dos medicamentos..." />
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: LOGÍSTICA (ESTACIONAMENTO) */}
      <div className="bg-white rounded-xl space-y-6">
        <SectionTitle icon={Car} title="Logística e Veículo" />
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[#001f3f] rounded-full flex items-center justify-center text-white">
                 <Car size={20} />
               </div>
               <span className="font-bold text-[#001f3f] text-sm">Necessita de vaga no estacionamento?</span>
             </div>
             <select 
               value={formData.vagaEstacionamento} 
               onChange={(e) => updateFormData({ vagaEstacionamento: e.target.value })} 
               className="p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-bold outline-none min-w-[100px]"
             >
               <option value="Não">Não</option>
               <option value="Sim">Sim</option>
             </select>
          </div>
          {formData.vagaEstacionamento === 'Sim' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Modelo, Cor e Placa do Veículo</label>
              <input required type="text" value={formData.veiculoInfo} onChange={(e) => updateFormData({ veiculoInfo: e.target.value })} className={inputClass} placeholder="Ex: Toyota Corolla, Prata, PLB-1234" />
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO 4: CONTROLE DE DEPENDENTES */}
      <div className="flex items-center justify-between gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 shadow-sm">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-[#001f3f] rounded-full flex items-center justify-center text-white">
             <Users size={20} />
           </div>
           <div className="flex-1">
             <span className="font-bold text-[#001f3f] block text-sm">Haverá dependente(s) nesta hospedagem?</span>
             <span className="text-xs text-blue-600">Marque "Sim" para abrir os dados do dependente.</span>
           </div>
         </div>
         <select 
           value={formData.temDependente1} 
           onChange={(e) => updateFormData({ temDependente1: e.target.value })} 
           className="p-2.5 rounded-lg border border-blue-200 bg-white text-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-900 min-w-[100px] shadow-sm"
         >
           <option value="Não">Não</option>
           <option value="Sim">Sim</option>
         </select>
      </div>

      {/* DADOS DO DEPENDENTE 1 */}
      {formData.temDependente1 === 'Sim' && (
        <div className="bg-slate-50/50 p-6 rounded-xl space-y-6 border border-slate-200 animate-in zoom-in-95 duration-300">
          <SectionTitle icon={Briefcase} title="Dados do Dependente 1" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo do Dependente</label>
              <input required type="text" value={formData.nomeDependente1} onChange={(e) => updateFormData({ nomeDependente1: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">CPF do Dependente</label>
              <input required type="text" value={formData.cpfDependente1} onChange={(e) => updateFormData({ cpfDependente1: e.target.value })} className={inputClass} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Grau de Parentesco</label>
              <select required value={formData.parentescoDependente1} onChange={(e) => updateFormData({ parentescoDependente1: e.target.value })} className={selectClass}>
                <option value="">Selecione...</option>
                <option value="1- Pai">1- Pai</option>
                <option value="2- Mãe">2- Mãe</option>
                <option value="3- Filho(a)">3- Filho(a)</option>
                <option value="4- Cônjuge">4- Cônjuge</option>
                <option value="5- Outros">5- Outros</option>
              </select>
            </div>
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#001f3f] rounded-full flex items-center justify-center text-white">
                     <Activity size={20} />
                   </div>
                   <span className="font-bold text-[#001f3f] text-sm">Possui Déficit motor? (Dependente)</span>
                 </div>
                 <select 
                   value={formData.necessidadeMobilidadeDependente1} 
                   onChange={(e) => updateFormData({ necessidadeMobilidadeDependente1: e.target.value })} 
                   className="p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-bold outline-none min-w-[100px]"
                 >
                   <option value="Não">Não</option>
                   <option value="Sim">Sim</option>
                 </select>
              </div>
              {formData.necessidadeMobilidadeDependente1 === 'Sim' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Informe a necessidade</label>
                  <textarea rows={2} required value={formData.detalheMobilidadeDependente1} onChange={(e) => updateFormData({ detalheMobilidadeDependente1: e.target.value })} className={inputClass} placeholder="Descreva a necessidade de mobilidade..." />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Possui Plano de Saúde?</label>
              <select required value={formData.possuiPlanoDependente1} onChange={(e) => updateFormData({ possuiPlanoDependente1: e.target.value })} className={selectClass}>
                <option value="">Selecione...</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
            {formData.possuiPlanoDependente1 === 'Sim' && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome do Plano e Número da Carteira</label>
                <input required type="text" value={formData.planoENumeroDependente1} onChange={(e) => updateFormData({ planoENumeroDependente1: e.target.value })} className={inputClass} />
              </div>
            )}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">O que pretende fazer em Salvador?</label>
              <select required value={formData.pretensaoSalvadorDependente1} onChange={(e) => updateFormData({ pretensaoSalvadorDependente1: e.target.value })} className={selectClass}>
                <option value="">Selecione...</option>
                <option value="Realizar algum tratamento de saúde ou coisa equivalente">Tratamento de Saúde</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 5: DATAS DA ESTADIA */}
      <div className="bg-[#001f3f]/5 p-6 rounded-xl space-y-6 border border-[#001f3f]/10 shadow-sm">
        <SectionTitle icon={Calendar} title="Datas e Horário da Estadia" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Data de Entrada</label>
            <input required type="date" value={formData.dataEntrada} onChange={(e) => updateFormData({ dataEntrada: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Data de Saída</label>
            <input required type="date" value={formData.dataSaida} onChange={(e) => updateFormData({ dataSaida: e.target.value })} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Previsão Horário Chegada</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input required type="time" value={formData.horarioChegada} onChange={(e) => updateFormData({ horarioChegada: e.target.value })} className={`${inputClass} pl-10`} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button type="button" onClick={onBack} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 rounded-xl transition-all"><ChevronLeft size={20} /> Voltar</button>
        <button type="submit" className="flex-[2] flex items-center justify-center gap-2 bg-[#001f3f] hover:bg-blue-950 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/10">Ver Resumo <ChevronRight size={20} /></button>
      </div>
    </form>
  );
};

export default DataFormStep;
