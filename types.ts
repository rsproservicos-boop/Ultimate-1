
export enum UserProfile {
  POLICIAL = 'Policial',
  DEPENDENTE = 'Dependente'
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface DatabaseConfig {
  useRemote: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface NotificationSettings {
  enabled: boolean;
  targetEmail: string;
  serviceId: string;
  templateId: string;
  publicKey: string;
  dbConfig?: DatabaseConfig;
}

export interface MovementEvaluation {
  perfil: string; 
  estrelas: number;
  motivoHospedagem: string; 
  avaliacaoRecepcao: string; 
  equipeRespeitosa: string; 
  informacoesClaras: string; // "Informações Claras?"
  tempoCheckin: string; 
  tempoCheckout: string; 
  confortoQuarto: string; 
  limpezaBanheiro: string; 
  limpezaGeral: string; 
  sentiuSeguro: string; // "Sentiu-se Seguro?"
  infraestruturaAtendeu: string; // "Infraestrutura Atendeu?"
  contribuicaoSaude: string; // "Contribuição p/ Saúde"
  contribuicaoSocial: string; // "Contribuição Social"
  custoBeneficio: string; // "Custo Benefício"
  servicosAdequados: string; // "Serviços Adequados?"
  sugestaoBoaExperiencia: string;
  sugestaoAtendimento: string;
  recomendaria: number; // "Recomendaria o Hotel? (0 a 10)"
  notaGeral: number;
}

export interface MovementRecord {
  id: string;
  type: 'check-in' | 'check-out';
  nome: string;
  matriculaRG: string;
  cidadeUnidade: string;
  plantonista: string;
  timestamp: string;
  protocolo?: string;
  evaluation?: MovementEvaluation;
}

export interface FormData {
  termsAccepted: boolean;
  profile: UserProfile | null;
  nome: string;
  email: string;
  matricula: string;
  postoGraduacao: string;
  cpf: string;
  telefone: string;
  contatoUnidade: string;
  escolaridade: string;
  generoPolicial: string;
  possuiPlanoSaudePolicial: string;
  qualPlanoPolicial: string;
  numeroCarteiraPlanoPolicial: string;
  endereco: string;
  cidadeResidencia: string;
  pretensaoSalvadorPolicial: string;
  pretensaoOutroExplicaPolicial: string;
  situacaoPolicial: string;
  dataAdmissaoPM: string;
  unidadeTrabalhoPM: string;
  contatoUnidadePM: string;
  necessidadeMobilidadePolicial: string;
  detalheMobilidadePolicial: string;
  problemaSaude: string;
  medicacaoContinua: string;
  vagaEstacionamento: string;
  veiculoInfo: string;
  dataEntrada: string;
  dataSaida: string;
  horarioChegada: string;
  motivo: string;
  temDependente1: string; 
  nomeDependente1: string;
  cpfDependente1: string;
  permanenciaDependente1: string;
  emailDependente1: string;
  dataNascimentoDependente1: string;
  whatsappDependente1: string;
  generoDependente1: string;
  parentescoDependente1: string;
  parentescoOutroExplica1: string;
  necessidadeMobilidadeDependente1: string;
  detalheMobilidadeDependente1: string;
  pretensaoSalvadorDependente1: string;
  possuiPlanoDependente1: string;
  planoENumeroDependente1: string;
  temOutroDependente: string;
  nomeDependente2: string;
  cpfDependente2: string;
  emailDependente2: string;
  dataNascimentoDependente2: string;
  generoDependente2: string;
  parentescoDependente2: string;
  parentescoOutroExplica2: string;
  necessidadeMobilidadeDependente2: string;
  detalheMobilidadeDependente2: string;
  pretensaoSalvadorDependente2: string;
  possuiPlanoDependente2: string;
  planoENumeroDependente2: string;
  nomeTitular: string;
  matriculaTitular: string;
  parentesco: string;
}

export interface Submission extends FormData {
  id: string;
  timestamp: string;
  protocolo: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
}

export interface StepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack?: () => void;
}
