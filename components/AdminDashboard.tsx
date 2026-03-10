
import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, FileText, LogOut, Database,
  X, User, Settings, CheckCircle, XCircle,
  RefreshCw, Zap, Globe, Shield, UserCheck, 
  Users, MapPin, Calendar, Clock, Briefcase, 
  Info, Check, Ban, AlertTriangle, Terminal, Copy,
  ClipboardList, Save, CheckCircle2, AlertCircle, 
  TrendingUp, Activity, LayoutDashboard, UserPlus,
  Key, ShieldCheck, Lock, UserMinus, Mail, Menu,
  Smartphone, BookOpen, Heart, Home, GraduationCap,
  IdCard, LogIn, Star, MessageSquare, ThumbsUp,
  FileSearch, ClipboardCheck, Car, HeartPulse, CreditCard,
  Edit, Eye, Share2, MessageCircle, Bell
} from 'lucide-react';
import { Submission, UserProfile, AdminUser, NotificationSettings, MovementRecord, MovementEvaluation } from '../types';
import { api } from '../api';

interface Props {
  onBack: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'registros' | 'portaria' | 'admins' | 'settings'>('registros');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [movements, setMovements] = useState<MovementRecord[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    targetEmail: '',
    serviceId: '',
    templateId: '',
    publicKey: '',
    dbConfig: {
      useRemote: true,
      supabaseUrl: '',
      supabaseAnonKey: ''
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<{success?: boolean, message?: string}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);
  const [editForm, setEditForm] = useState<Submission | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<MovementRecord | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [notificationMsg, setNotificationMsg] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingNotifications, setPendingNotifications] = useState<Submission[]>([]);
  
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false);

  // Estados para alteração de senha
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [changePasswordValue, setChangePasswordValue] = useState('');

  // Estados para Portaria
  const [showMovementForm, setShowMovementForm] = useState<'check-in' | 'check-out' | null>(null);
  const [movementForm, setMovementForm] = useState({
    protocolo: '',
    nome: '',
    matriculaRG: '',
    cidadeUnidade: '',
    plantonista: ''
  });

  // Modal de Link Gerado
  const [showShareModal, setShowShareModal] = useState<{ visible: boolean; link: string; name: string }>({
    visible: false,
    link: '',
    name: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subData, adminData, settingsData, moveData] = await Promise.all([
        api.getSubmissions(),
        api.getAdmins(),
        api.getSettings(),
        api.getMovements()
      ]);
      setSubmissions(subData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setAdmins(adminData);
      setMovements(moveData || []);
      if (settingsData) setSettings(settingsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sistema de Polling para Notificações em Tempo Real
  useEffect(() => {
    if (isLoading) return;

    const pollInterval = setInterval(async () => {
      try {
        const subData = await api.getSubmissions();
        const sortedNew = subData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Verifica se há novos registros comparando o ID do mais recente
        const latestStoredId = submissions[0]?.id;
        const latestNewId = sortedNew[0]?.id;

        if (latestNewId && latestNewId !== latestStoredId && submissions.length > 0) {
          const newItems = sortedNew.filter(ns => !submissions.some(os => os.id === ns.id));
          
          if (newItems.length > 0) {
            setPendingNotifications(prev => [...newItems, ...prev]);
            
            // Som de notificação (Mixkit SFX)
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => console.log('Áudio bloqueado pelo navegador'));
            
            setSubmissions(sortedNew);
            if (activeTab !== 'registros') {
              setUnreadCount(prev => prev + newItems.length);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar novos registros:', error);
      }
    }, 15000); // Verifica a cada 15 segundos

    return () => clearInterval(pollInterval);
  }, [submissions, isLoading, activeTab]);

  // Limpa notificações ao entrar na aba de registros
  useEffect(() => {
    if (activeTab === 'registros') {
      setUnreadCount(0);
    }
  }, [activeTab]);

  const generateUUID = () => {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
    } catch(e) {}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Aprovado' | 'Recusado', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setNotificationMsg('Atualizando status...');
      await api.updateSubmissionStatus(id, newStatus);
      const submission = submissions.find(s => s.id === id) || pendingNotifications.find(s => s.id === id);
      if (submission) {
        await api.sendEmailNotification({ ...submission, status: newStatus });
      }
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      setPendingNotifications(prev => prev.filter(s => s.id !== id));
      setNotificationMsg('Status atualizado!');
      setTimeout(() => setNotificationMsg(''), 2000);
    } catch (error) {
      alert('Erro ao atualizar status.');
    }
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showMovementForm) return;

    const typeLabel = showMovementForm === 'check-in' ? 'Check-in' : 'Check-out';
    const movementId = generateUUID();
    const newRecord: MovementRecord = {
      id: movementId,
      type: showMovementForm,
      protocolo: movementForm.protocolo,
      nome: movementForm.nome,
      matriculaRG: movementForm.matriculaRG,
      cidadeUnidade: movementForm.cidadeUnidade,
      plantonista: movementForm.plantonista,
      timestamp: new Date().toISOString()
    };

    try {
      setNotificationMsg(`Sincronizando...`);
      await api.addMovement(newRecord);
      setMovements(prev => [newRecord, ...prev]);
      
      const isCheckout = showMovementForm === 'check-out';
      const guestName = movementForm.nome;

      setShowMovementForm(null);
      resetMovementForms();
      setNotificationMsg(`${typeLabel} concluído!`);
      
      if (isCheckout) {
        const baseUrl = window.location.origin + window.location.pathname;
        const surveyLink = `${baseUrl}?view=survey&id=${movementId}`;
        setShowShareModal({ visible: true, link: surveyLink, name: guestName });
      }

      setTimeout(() => setNotificationMsg(''), 3000);
    } catch (error) {
      console.error('Erro de salvamento:', error);
      alert('Erro ao salvar movimentação.');
    }
  };

  const resetMovementForms = () => {
    setMovementForm({ protocolo: '', nome: '', matriculaRG: '', cidadeUnidade: '', plantonista: '' });
  };

  const handleProtocolLookup = (proto: string) => {
    const upperProto = proto.toUpperCase();
    setMovementForm(prev => ({ ...prev, protocolo: upperProto }));
    
    if (upperProto.length >= 4) {
      // Primeiro tenta buscar nas submissões (agendamentos)
      const foundSub = submissions.find(s => s.protocolo.toUpperCase() === upperProto);
      if (foundSub) {
        setMovementForm(prev => ({
          ...prev,
          nome: foundSub.nome,
          matriculaRG: foundSub.matricula,
          cidadeUnidade: foundSub.unidadeTrabalhoPM || foundSub.cidadeResidencia || ''
        }));
        setNotificationMsg('Dados recuperados do agendamento!');
        setTimeout(() => setNotificationMsg(''), 2000);
        return;
      }

      // Se não achar, tenta buscar em movimentos anteriores (para check-out por exemplo)
      const foundMove = movements.find(m => m.protocolo?.toUpperCase() === upperProto || m.id.toUpperCase().includes(upperProto));
      if (foundMove) {
        setMovementForm(prev => ({
          ...prev,
          nome: foundMove.nome,
          matriculaRG: foundMove.matriculaRG,
          cidadeUnidade: foundMove.cidadeUnidade
        }));
        setNotificationMsg('Dados recuperados do histórico!');
        setTimeout(() => setNotificationMsg(''), 2000);
      }
    }
  };

  const statsSubmissions = {
    total: submissions.length,
    aprovados: submissions.filter(s => s.status === 'Aprovado').length,
    pendentes: submissions.filter(s => s.status === 'Pendente').length,
    titulares: submissions.filter(s => s.profile === UserProfile.POLICIAL).length,
    dependentes: submissions.filter(s => s.temDependente1 === 'Sim').length
  };

  const statsMovements = {
    total: movements.length,
    checkins: movements.filter(m => m.type === 'check-in').length,
    checkouts: movements.filter(m => m.type === 'check-out').length
  };

  const filteredSubmissions = submissions.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigationItems = [
    { id: 'registros', label: 'Registros', icon: ClipboardList, description: 'Fichas recebidas' },
    { id: 'portaria', label: 'Portaria', icon: LogIn, description: 'Controle de Entrada/Saída' },
    { id: 'admins', label: 'Acessos', icon: UserCheck, description: 'Gestão de usuários' },
    { id: 'settings', label: 'Ajustes', icon: Settings, description: 'Configurações' }
  ];

  const InfoRow = ({ label, value, icon: Icon }: { label: string, value: string | undefined | number, icon?: any }) => (
    <div className="flex flex-col py-2 border-b border-slate-50 last:border-0">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </span>
      <span className="text-sm font-bold text-slate-700 break-words">{value || 'N/A'}</span>
    </div>
  );

  const EditableRow = ({ label, value, onChange, type = 'text', icon: Icon }: { label: string, value: any, onChange: (val: string) => void, type?: string, icon?: any }) => {
    if (!isEditingSubmission) {
      return <InfoRow label={label} value={value} icon={Icon} />;
    }
    return (
      <div className="flex flex-col py-2 border-b border-slate-50 last:border-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
          {Icon && <Icon size={10} />} {label}
        </span>
        <input 
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D4AF37]"
        />
      </div>
    );
  };

  const handleTestConnection = async () => {
    setIsTestingDb(true);
    const result = await api.testConnection();
    setDbStatus(result);
    setIsTestingDb(false);
    setTimeout(() => setDbStatus({}), 5000);
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    try {
      await api.saveSettings(settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.password) return;
    setIsAdminActionLoading(true);
    try {
      const adminToCreate: AdminUser = {
        id: generateUUID(),
        username: newAdmin.username,
        password: newAdmin.password,
        createdAt: new Date().toISOString()
      };
      await api.addAdmin(adminToCreate);
      setAdmins(prev => [...prev, adminToCreate]);
      setNewAdmin({ username: '', password: '' });
      setShowAddAdmin(false);
    } catch (error) {
      alert('Erro ao adicionar administrador.');
    } finally {
      setIsAdminActionLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdminId || !changePasswordValue) return;
    setIsAdminActionLoading(true);
    try {
      await api.updateAdminPassword(editingAdminId, changePasswordValue);
      setAdmins(prev => prev.map(a => a.id === editingAdminId ? { ...a, password: changePasswordValue } : a));
      setEditingAdminId(null);
      setChangePasswordValue('');
      setNotificationMsg('Senha alterada com sucesso!');
      setTimeout(() => setNotificationMsg(''), 3000);
    } catch (error) {
      console.error(error);
      alert('Erro ao alterar senha.');
    } finally {
      setIsAdminActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    const adminToDelete = admins.find(a => a.id === id);
    const usernameLower = adminToDelete?.username.toLowerCase();
    if (usernameLower === 'admin' || usernameLower === 'rodrigo1') {
      alert('Este administrador é protegido e não pode ser removido.');
      return;
    }
    if (confirm('Deseja remover o acesso deste administrador?')) {
      setIsAdminActionLoading(true);
      try {
        await api.deleteAdmin(id);
        setAdmins(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        alert('Erro ao remover administrador.');
      } finally {
        setIsAdminActionLoading(false);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const calculateDays = (entrada: string, saida: string) => {
    if (!entrada || !saida) return '-';
    try {
      const d1 = new Date(entrada);
      const d2 = new Date(saida);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    } catch (e) {
      return '-';
    }
  };

  const handleStartEditSubmission = () => {
    if (selectedSubmission) {
      setEditForm({ ...selectedSubmission });
      setIsEditingSubmission(true);
    }
  };

  const handleCancelEditSubmission = () => {
    setIsEditingSubmission(false);
    setEditForm(null);
  };

  const handleSaveSubmissionEdit = async () => {
    if (!editForm) return;
    try {
      setNotificationMsg('Sincronizando alterações...');
      await api.updateSubmission(editForm);
      setSubmissions(prev => prev.map(s => s.id === editForm.id ? editForm : s));
      setSelectedSubmission(editForm);
      setIsEditingSubmission(false);
      setEditForm(null);
      setNotificationMsg('Dados atualizados!');
      setTimeout(() => setNotificationMsg(''), 2000);
    } catch (error) {
      alert('Erro ao salvar alterações.');
    }
  };

  const copyToClipboard = (text: string, message: string = 'Copiado!') => {
    navigator.clipboard.writeText(text);
    setNotificationMsg(message);
    setTimeout(() => setNotificationMsg(''), 2000);
  };

  const shareViaWhatsApp = (link: string, name: string) => {
    const message = encodeURIComponent(`Olá ${name}, agradecemos sua estadia no Hotel de Acolhimento PMBA. Sua opinião é muito importante para nós! Por favor, preencha nossa pesquisa de satisfação rápida: ${link}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaSMS = (link: string) => {
    const message = encodeURIComponent(`Pesquisa de Satisfação Hotel de Acolhimento PMBA: ${link}`);
    window.open(`sms:?body=${message}`, '_blank');
  };

  const shareViaEmail = (link: string, name: string) => {
    const subject = encodeURIComponent(`Pesquisa de Satisfação - Hotel de Acolhimento PMBA`);
    const body = encodeURIComponent(`Olá ${name},\n\nAgradecemos por escolher o Hotel de Acolhimento do DPS PMBA.\nPara continuarmos melhorando nossos serviços, gostaríamos de ouvir sua opinião sobre sua estadia.\n\nAcesse o link abaixo para responder à pesquisa:\n${link}\n\nAtenciosamente,\nEquipe DPS PMBA`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      {/* Sistema de Notificações Interativas */}
      <div className="fixed top-4 right-4 z-[250] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {pendingNotifications.map((notif) => (
          <div 
            key={notif.id} 
            className="pointer-events-auto bg-white border-2 border-[#D4AF37] rounded-2xl shadow-2xl p-4 animate-in slide-in-from-right-8 duration-300 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#001f3f] rounded-xl flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Bell size={20} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Novo Agendamento</p>
                  <p className="text-sm font-black text-[#001f3f] line-clamp-1">{notif.nome}</p>
                </div>
              </div>
              <button 
                onClick={() => setPendingNotifications(prev => prev.filter(p => p.id !== notif.id))}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded-lg">
              <span className="bg-[#001f3f] text-white px-1.5 py-0.5 rounded uppercase">{notif.protocolo}</span>
              <span>Entrada: {formatDate(notif.dataEntrada)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleUpdateStatus(notif.id, 'Aprovado')}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Check size={14} /> Aprovar
              </button>
              <button 
                onClick={() => handleUpdateStatus(notif.id, 'Recusado')}
                className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                <Ban size={14} /> Recusar
              </button>
            </div>
          </div>
        ))}
      </div>

      {notificationMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-[#001f3f] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-[#D4AF37]">
          <RefreshCw className="animate-spin text-[#D4AF37]" size={16} />
          <span className="text-xs font-black uppercase tracking-widest">{notificationMsg}</span>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-[#001f3f] text-white p-6 sticky top-0 h-screen shadow-2xl z-20">
        <div className="mb-10 px-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg">
                 <img src="https://i.postimg.cc/MpV2JBBM/hcol.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-black leading-none uppercase text-white">DPS PMBA</h1>
                <p className="text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase">Gestor HACOLHE</p>
              </div>
           </div>
        </div>

        <nav className="flex-1 space-y-2">
           {navigationItems.map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id as any)}
               className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-[#D4AF37] text-[#001f3f] shadow-xl' : 'text-blue-100/60 hover:text-white hover:bg-white/5'}`}
             >
               <item.icon size={20} className={activeTab === item.id ? 'text-[#001f3f]' : 'text-[#D4AF37]'} />
               <div className="text-left flex-1">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-black uppercase tracking-wider">{item.label}</span>
                    {item.id === 'registros' && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce shadow-lg">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={`block text-[9px] font-medium opacity-60 ${activeTab === item.id ? 'text-[#001f3f]' : 'text-white'}`}>{item.description}</span>
               </div>
             </button>
           ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
           <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-widest">
              <LogOut size={16} /> Encerrar Sessão
           </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#001f3f] border-t border-white/10 flex items-center justify-around p-2 z-[90] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${activeTab === item.id ? 'text-[#D4AF37]' : 'text-blue-100/40'}`}
          >
            <item.icon size={24} />
            {item.id === 'registros' && unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse shadow-lg">
                {unreadCount}
              </span>
            )}
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onBack}
          className="flex flex-col items-center gap-1 p-2 text-red-400 opacity-60"
        >
          <LogOut size={24} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Sair</span>
        </button>
      </nav>

      <main className="flex-1 p-4 md:p-10 pb-28 md:pb-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black text-[#001f3f] uppercase tracking-tighter">
                {navigationItems.find(i => i.id === activeTab)?.label}
              </h2>
              {submissions.some(s => s.status === 'Pendente') && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-left-4">
                  <Bell size={14} className="text-amber-500 animate-bounce" />
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                    {submissions.filter(s => s.status === 'Pendente').length} Pendentes
                  </span>
                </div>
              )}
           </div>
           {activeTab !== 'portaria' && (
             <button onClick={fetchData} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm text-[10px] font-black uppercase tracking-widest transition-all">
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Atualizar Dados
             </button>
           )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw size={40} className="text-[#D4AF37] animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando banco...</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'registros' && (
              <div className="space-y-8">
                {submissions.some(s => s.status === 'Pendente') && (
                  <div className="bg-amber-50/50 border-2 border-amber-100 rounded-[2.5rem] p-6 mb-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Bell size={20} className="animate-bounce" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#001f3f] uppercase tracking-widest">Ações Pendentes</h3>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Agendamentos aguardando sua revisão</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      {submissions.filter(s => s.status === 'Pendente').slice(0, 3).map(notif => (
                        <div key={notif.id} className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex items-center gap-4 flex-1 min-w-[300px]">
                          <div className="flex-1">
                            <p className="text-xs font-black text-[#001f3f] uppercase line-clamp-1">{notif.nome}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{notif.protocolo} • {formatDate(notif.dataEntrada)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => handleUpdateStatus(notif.id, 'Aprovado', e)}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              title="Aprovar"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={(e) => handleUpdateStatus(notif.id, 'Recusado', e)}
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="Recusar"
                            >
                              <Ban size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {submissions.filter(s => s.status === 'Pendente').length > 3 && (
                        <div className="flex items-center justify-center px-4 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                          + {submissions.filter(s => s.status === 'Pendente').length - 3} outros
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Total Registros', value: statsSubmissions.total, icon: ClipboardList, color: 'blue' },
                    { label: 'Pendentes', value: statsSubmissions.pendentes, icon: Clock, color: 'amber' },
                    { label: 'Aprovados', value: statsSubmissions.aprovados, icon: CheckCircle2, color: 'emerald' },
                    { label: 'Titulares', value: statsSubmissions.titulares, icon: UserCheck, color: 'indigo' },
                    { label: 'Dependentes', value: statsSubmissions.dependentes, icon: Users, color: 'rose' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
                         <stat.icon size={20} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Pesquisar registros..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                        />
                      </div>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               <th className="px-6 py-4">Protocolo</th>
                               <th className="px-6 py-4">Hóspede</th>
                               <th className="px-6 py-4">Entrada</th>
                               <th className="px-6 py-4">Saída</th>
                               <th className="px-6 py-4">Período</th>
                               <th className="px-6 py-4 text-center">Status</th>
                               <th className="px-6 py-4 text-right">Gerenciar</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {filteredSubmissions.map((s) => (
                               <tr key={s.id} onClick={() => setSelectedSubmission(s)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                  <td className="px-6 py-4 font-mono font-bold text-blue-900 text-sm">{s.protocolo}</td>
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                        {s.status === 'Pendente' && (
                                          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 animate-pulse shrink-0 border border-amber-100">
                                            <Bell size={14} />
                                          </div>
                                        )}
                                        <div className="flex flex-col">
                                           <span className="font-bold text-slate-800 text-sm group-hover:text-[#001f3f] transition-colors">{s.nome}</span>
                                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{s.matricula}</span>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-slate-600">{formatDate(s.dataEntrada)}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-slate-600">{formatDate(s.dataSaida)}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-[#001f3f] uppercase tracking-tighter border border-slate-200">
                                      {calculateDays(s.dataEntrada, s.dataSaida)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : s.status === 'Recusado' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                      {s.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <div className="flex items-center justify-end gap-1.5">
                                        <button onClick={(e) => handleUpdateStatus(s.id, 'Aprovado', e)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Check size={16} /></button>
                                        <button onClick={(e) => handleUpdateStatus(s.id, 'Recusado', e)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm"><Ban size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); if(confirm('Excluir?')) api.deleteSubmission(s.id).then(fetchData); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'portaria' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-white rounded-[3rem] border border-slate-200 p-8 md:p-12 shadow-sm space-y-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black text-[#001f3f] uppercase tracking-tighter">PORTARIA</h2>
                      <div className="h-1.5 w-24 bg-[#D4AF37] rounded-full"></div>
                    </div>
                    <button 
                      onClick={fetchData} 
                      className="group flex items-center gap-3 bg-slate-100 border border-slate-200 px-8 py-3.5 rounded-[1.25rem] text-[#001f3f] hover:bg-slate-200 shadow-sm text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                    >
                      <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-700 ${isLoading ? 'animate-spin' : ''}`} /> ATUALIZAR DADOS
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[#F8F9FA] p-10 rounded-[3rem] border border-slate-100 shadow-sm group hover:scale-[1.03] hover:shadow-xl transition-all relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">TOTAL PORTARIA</p>
                        <div className="flex items-center justify-between">
                          <p className="text-5xl font-black text-[#001f3f] tracking-tighter">{statsMovements.total}</p>
                          <Activity className="text-[#001f3f]/10 group-hover:text-[#001f3f]/20 group-hover:scale-110 transition-all" size={64} />
                        </div>
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#001f3f]/5 rounded-full blur-2xl"></div>
                    </div>
                    
                    <div className="bg-[#F8F9FA] p-10 rounded-[3rem] border border-slate-100 shadow-sm group hover:scale-[1.03] hover:shadow-xl transition-all relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">CHECK-INS</p>
                        <div className="flex items-center justify-between">
                          <p className="text-5xl font-black text-emerald-600 tracking-tighter">{statsMovements.checkins}</p>
                          <LogIn className="text-emerald-600/10 group-hover:text-emerald-600/20 group-hover:scale-110 transition-all" size={64} />
                        </div>
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl"></div>
                    </div>

                    <div className="bg-[#F8F9FA] p-10 rounded-[3rem] border border-slate-100 shadow-sm group hover:scale-[1.03] hover:shadow-xl transition-all relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">CHECK-OUTS</p>
                        <div className="flex items-center justify-between">
                          <p className="text-5xl font-black text-amber-600 tracking-tighter">{statsMovements.checkouts}</p>
                          <LogOut className="text-amber-600/10 group-hover:text-amber-600/20 group-hover:scale-110 transition-all" size={64} />
                        </div>
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl"></div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <button 
                      onClick={() => setShowMovementForm('check-in')} 
                      className="group w-full sm:w-auto flex items-center justify-center gap-5 bg-[#001f3f] text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-[#002f5f] hover:scale-[1.05] active:scale-95 transition-all relative overflow-hidden"
                    >
                      <LogIn size={24} className="group-hover:translate-x-1.5 transition-transform" /> 
                      REGISTRAR CHECK-IN
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                    <button 
                      onClick={() => setShowMovementForm('check-out')} 
                      className="group w-full sm:w-auto flex items-center justify-center gap-5 bg-white border-[3px] border-[#001f3f] text-[#001f3f] px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-lg hover:bg-[#001f3f] hover:text-white hover:scale-[1.05] active:scale-95 transition-all"
                    >
                      <LogOut size={24} className="group-hover:-translate-x-1.5 transition-transform" /> 
                      REGISTRAR CHECK-OUT
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">HISTÓRICO DE ACESSO</h3>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-75"></div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-10 py-6">TIPO</th>
                          <th className="px-10 py-6">HÓSPEDE</th>
                          <th className="px-10 py-6">HORÁRIO</th>
                          <th className="px-10 py-6 text-right text-slate-400">AÇÃO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(movements || []).map((m) => (
                          <tr key={m.id} onClick={() => setSelectedMovement(m)} className="hover:bg-slate-50 transition-all cursor-pointer group">
                            <td className="px-10 py-7">
                              <span className={`px-5 py-2 rounded-[1rem] text-[10px] font-black uppercase tracking-widest border transition-all ${m.type === 'check-in' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white'}`}>
                                {m.type}
                              </span>
                            </td>
                            <td className="px-10 py-7">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-base group-hover:text-[#001f3f] transition-colors">{m.nome}</span>
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">{m.matriculaRG}</span>
                              </div>
                            </td>
                            <td className="px-10 py-7 text-sm font-medium text-slate-500">
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-slate-300" />
                                {new Date(m.timestamp).toLocaleString('pt-BR')}
                              </div>
                            </td>
                            <td className="px-10 py-7 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  {m.type === 'check-out' && (
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const link = `${window.location.origin}${window.location.pathname}?view=survey&id=${m.id}`;
                                        setShowShareModal({ visible: true, link, name: m.nome });
                                      }}
                                      className="p-3 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all"
                                      title="Compartilhar Pesquisa"
                                    >
                                      <Share2 size={20} />
                                    </button>
                                  )}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedMovement(m); }}
                                    className="p-3 text-slate-300 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-2xl transition-all"
                                  >
                                      <FileSearch size={24} />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admins' && (
              <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Gerenciamento de Administradores</h3>
                   <button onClick={() => setShowAddAdmin(!showAddAdmin)} className="bg-[#001f3f] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                     {showAddAdmin ? 'Fechar' : 'Novo Acesso'}
                   </button>
                </div>

                {showAddAdmin && (
                  <div className="bg-white rounded-[2rem] border-2 border-[#D4AF37]/30 p-8 shadow-xl animate-in slide-in-from-top-4">
                    <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
                        <input required type="text" value={newAdmin.username} onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                        <input required type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                      </div>
                      <button type="submit" disabled={isAdminActionLoading} className="bg-[#001f3f] text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest">Salvar Novo Admin</button>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#001f3f] border border-slate-100"><UserCheck size={20} /></div>
                         <div>
                            <h4 className="font-black text-slate-800 uppercase text-sm">{admin.username}</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Desde {new Date(admin.createdAt).toLocaleDateString()}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-1">
                         <button 
                           onClick={() => { setEditingAdminId(admin.id); setChangePasswordValue(''); }}
                           className="p-2.5 text-slate-300 hover:text-blue-600 transition-colors"
                           title="Alterar Senha"
                         >
                            <Key size={18} />
                         </button>
                         <button 
                           onClick={() => handleDeleteAdmin(admin.id)} 
                           className="p-2.5 text-slate-300 hover:text-red-600 transition-colors disabled:opacity-30 disabled:hover:text-slate-300" 
                           disabled={admin.username.toLowerCase() === 'rodrigo1' || admin.username.toLowerCase() === 'admin'}
                           title="Remover Acesso"
                         >
                            <UserMinus size={18} />
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <Mail className="text-[#001f3f]" size={24} />
                    <h3 className="font-black text-[#001f3f] uppercase tracking-tight">Notificações por E-mail</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-sm font-bold text-slate-700">Ativar Notificações</span>
                      <button 
                        onClick={() => setSettings({...settings, enabled: !settings.enabled})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enabled ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Destino</label>
                      <input type="text" value={settings.targetEmail} onChange={(e) => setSettings({...settings, targetEmail: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EmailJS Service ID</label>
                      <input type="text" value={settings.serviceId} onChange={(e) => setSettings({...settings, serviceId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EmailJS Template ID</label>
                      <input type="text" value={settings.templateId} onChange={(e) => setSettings({...settings, templateId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <Database className="text-[#001f3f]" size={24} />
                    <h3 className="font-black text-[#001f3f] uppercase tracking-tight">Banco de Dados Remoto</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supabase URL</label>
                      <input type="text" value={settings.dbConfig?.supabaseUrl} onChange={(e) => setSettings({...settings, dbConfig: {...settings.dbConfig!, supabaseUrl: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supabase Anon Key</label>
                      <input type="password" value={settings.dbConfig?.supabaseAnonKey} onChange={(e) => setSettings({...settings, dbConfig: {...settings.dbConfig!, supabaseAnonKey: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button onClick={handleTestConnection} disabled={isTestingDb} className="flex-1 flex items-center justify-center gap-3 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">
                      {isTestingDb ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />} 
                      Testar Conexão {dbStatus.message && `- ${dbStatus.message}`}
                    </button>
                    <button onClick={handleSaveSettings} disabled={saveStatus === 'saving'} className="flex-1 flex items-center justify-center gap-3 bg-[#001f3f] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform">
                      {saveStatus === 'saving' ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} 
                      {saveStatus === 'success' ? 'Salvo com Sucesso!' : 'Salvar Alterações'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Alterar Senha */}
        {editingAdminId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-md" onClick={() => setEditingAdminId(null)}></div>
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
               <div className="bg-[#001f3f] text-white p-6 border-b-4 border-[#D4AF37]">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Alterar <span className="text-[#D4AF37]">Senha</span></h3>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">
                    Usuário: {admins.find(a => a.id === editingAdminId)?.username}
                  </p>
               </div>
               <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required 
                        type="password" 
                        value={changePasswordValue} 
                        onChange={(e) => setChangePasswordValue(e.target.value)} 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#001f3f]"
                        placeholder="Digite a nova senha"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setEditingAdminId(null)} 
                      className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isAdminActionLoading} 
                      className="flex-[2] py-3.5 bg-[#001f3f] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                    >
                      {isAdminActionLoading ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Salvar Nova Senha
                    </button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* Modal Portaria (Check-in / Check-out Simplificado) */}
        {showMovementForm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#001f3f]/90 backdrop-blur-xl" onClick={() => setShowMovementForm(null)}></div>
            <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
              <div className="bg-[#001f3f] text-white p-8 flex items-center justify-between border-b-4 border-[#D4AF37]">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><ClipboardCheck className="text-[#D4AF37]" size={24} /></div>
                   <h2 className="text-xl font-black uppercase tracking-tighter">Registrar <span className="text-[#D4AF37]">{showMovementForm}</span></h2>
                </div>
                <button onClick={() => setShowMovementForm(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSaveMovement} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                      Protocolo de Agendamento
                      <span className="text-[9px] text-[#D4AF37] lowercase font-bold italic">Auto-preenche ao digitar</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={movementForm.protocolo} 
                        onChange={(e) => handleProtocolLookup(e.target.value)} 
                        placeholder="Ex: HA-XXXX"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-[#D4AF37] font-mono font-bold text-[#001f3f]" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Hóspede</label>
                    <input required type="text" value={movementForm.nome} onChange={(e) => setMovementForm({...movementForm, nome: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrícula ou RG</label>
                      <input required type="text" value={movementForm.matriculaRG} onChange={(e) => setMovementForm({...movementForm, matriculaRG: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidade / Unidade</label>
                      <input required type="text" value={movementForm.cidadeUnidade} onChange={(e) => setMovementForm({...movementForm, cidadeUnidade: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Policial Plantonista</label>
                    <input required type="text" value={movementForm.plantonista} onChange={(e) => setMovementForm({...movementForm, plantonista: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:scale-[1.01] transition-all">
                  Concluir Registro de {showMovementForm}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Compartilhamento do Link de Pesquisa */}
        {showShareModal.visible && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md" onClick={() => setShowShareModal({ ...showShareModal, visible: false })}></div>
            <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
               <div className="bg-emerald-600 text-white p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><ThumbsUp size={100} /></div>
                  <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl">
                    <CheckCircle2 className="text-emerald-600" size={32} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Check-out Realizado!</h3>
                  <p className="text-emerald-50 text-xs font-bold uppercase mt-1 tracking-widest">Hóspede: {showShareModal.name}</p>
               </div>
               <div className="p-8 space-y-6 text-center">
                  <div className="space-y-4">
                    <p className="text-slate-500 text-sm font-medium">Compartilhar pesquisa com o hóspede:</p>
                    
                    {/* Ações de Compartilhamento Direto */}
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => shareViaWhatsApp(showShareModal.link, showShareModal.name)}
                        className="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl border border-emerald-100 transition-all group"
                      >
                        <MessageCircle className="text-emerald-600 group-hover:scale-110 transition-transform" size={28} />
                        <span className="text-[10px] font-black text-emerald-700 uppercase">WhatsApp</span>
                      </button>
                      <button 
                        onClick={() => shareViaSMS(showShareModal.link)}
                        className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-100 transition-all group"
                      >
                        <Smartphone className="text-blue-600 group-hover:scale-110 transition-transform" size={28} />
                        <span className="text-[10px] font-black text-blue-700 uppercase">SMS</span>
                      </button>
                      <button 
                        onClick={() => shareViaEmail(showShareModal.link, showShareModal.name)}
                        className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group"
                      >
                        <Mail className="text-slate-600 group-hover:scale-110 transition-transform" size={28} />
                        <span className="text-[10px] font-black text-slate-700 uppercase">E-mail</span>
                      </button>
                    </div>

                    <div className="relative py-2">
                       <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                       <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300 bg-white px-2">ou copie o link</div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 border-dashed relative group">
                      <p className="text-[10px] font-mono text-slate-400 break-all select-all">{showShareModal.link}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button 
                      onClick={() => copyToClipboard(showShareModal.link)}
                      className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                    >
                      <Copy size={18} /> Copiar Link
                    </button>
                    <button 
                      onClick={() => setShowShareModal({ ...showShareModal, visible: false })}
                      className="w-full py-4 text-slate-400 hover:text-slate-600 font-black uppercase text-[10px] tracking-widest transition-colors"
                    >
                      Fechar Janela
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Modal Detalhes Movimentação (Histórico) */}
        {selectedMovement && (
           <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-md" onClick={() => setSelectedMovement(null)}></div>
             <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
               <div className="bg-[#001f3f] text-white p-7 border-b-4 border-[#D4AF37] flex justify-between items-center shrink-0">
                 <div>
                   <h3 className="text-xl font-black uppercase">Ficha de <span className="text-[#D4AF37]">Portaria</span></h3>
                   <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">ID: {selectedMovement.id}</p>
                 </div>
                 <button onClick={() => setSelectedMovement(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={28} /></button>
               </div>
               <div className="p-8 overflow-y-auto custom-scrollbar space-y-10 bg-slate-50">
                 <section className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                   <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                     <User size={16} className="text-[#001f3f]" />
                     <h4 className="text-xs font-black text-[#001f3f] uppercase tracking-widest">Informações do Registro</h4>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                     <InfoRow label="Hóspede" value={selectedMovement.nome} />
                     <InfoRow label="Matrícula/RG" value={selectedMovement.matriculaRG} />
                     <InfoRow label="Operação" value={selectedMovement.type.toUpperCase()} />
                     <InfoRow label="Data/Hora" value={new Date(selectedMovement.timestamp).toLocaleString('pt-BR')} />
                     <InfoRow label="Cidade/Unidade" value={selectedMovement.cidadeUnidade} />
                     <InfoRow label="Policial Plantonista" value={selectedMovement.plantonista} />
                   </div>
                 </section>

                 {selectedMovement.evaluation ? (
                   <section className="space-y-6">
                     <div className="flex items-center gap-3">
                       <div className="h-0.5 flex-1 bg-[#D4AF37]/20"></div>
                       <div className="flex items-center gap-2 bg-[#D4AF37]/10 px-4 py-1.5 rounded-full border border-[#D4AF37]/20">
                         <ThumbsUp size={14} className="text-[#D4AF37]" />
                         <span className="text-[10px] font-black text-[#001f3f] uppercase tracking-widest">Pesquisa de Satisfação</span>
                       </div>
                       <div className="h-0.5 flex-1 bg-[#D4AF37]/20"></div>
                     </div>

                     <div className="bg-white p-8 rounded-[2.5rem] border border-[#D4AF37]/20 shadow-lg space-y-8">
                       <div className="flex items-center justify-between">
                         <div className="flex gap-1 text-amber-500">
                           {Array.from({length: 5}).map((_, i) => (
                             <Star key={i} size={20} fill={i < selectedMovement.evaluation!.estrelas ? "currentColor" : "none"} className={i < selectedMovement.evaluation!.estrelas ? "" : "text-slate-100"} />
                           ))}
                         </div>
                         <div className="px-4 py-1.5 bg-[#001f3f] text-[#D4AF37] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#D4AF37]">
                           Avaliação Final: {selectedMovement.evaluation.notaGeral}/10
                         </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Sentiu-se Seguro?</p>
                           <p className="text-sm font-bold text-[#001f3f]">{selectedMovement.evaluation.sentiuSeguro}</p>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Infraestrutura Atendeu?</p>
                           <p className="text-sm font-bold text-[#001f3f]">{selectedMovement.evaluation.infraestruturaAtendeu}</p>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Informações Claras?</p>
                           <p className="text-sm font-bold text-[#001f3f]">{selectedMovement.evaluation.informacoesClaras}</p>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Contribuição p/ Saúde</p>
                           <p className="text-sm font-bold text-[#001f3f]">{selectedMovement.evaluation.contribuicaoSaude}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Contribuição Social</p>
                            <p className="text-sm font-bold text-[#001f3f]">{selectedMovement.evaluation.contribuicaoSocial}</p>
                          </div>
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Custo Benefício</p>
                           <p className="text-sm font-bold text-[#001f3f]">{selectedMovement.evaluation.custoBeneficio}</p>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Serviços Adequados?</p>
                           <p className="text-sm font-bold text-[#001f3f]">{selectedMovement.evaluation.servicosAdequados}</p>
                         </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex flex-col items-center justify-center text-center">
                           <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-3">Recomendaria (0-10):</p>
                           <div className="text-4xl font-black text-[#001f3f]">{selectedMovement.evaluation.recomendaria}</div>
                         </div>
                         <div className="space-y-4">
                            <InfoRow label="Limpeza Geral" value={selectedMovement.evaluation.limpezaGeral} />
                            <InfoRow label="Higiene Banheiro" value={selectedMovement.evaluation.limpezaBanheiro} />
                            <InfoRow label="Conforto Quarto" value={selectedMovement.evaluation.confortoQuarto} />
                         </div>
                       </div>

                       <div className="space-y-4 pt-6 border-t border-slate-50">
                         <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                           <p className="text-[9px] font-black text-blue-600 uppercase mb-2 tracking-widest">O que mais contribuiu para a boa experiência:</p>
                           <p className="text-sm text-slate-700 italic leading-relaxed">"{selectedMovement.evaluation.sugestaoBoaExperiencia || 'Nenhum comentário.'}"</p>
                         </div>
                         <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                           <p className="text-[9px] font-black text-blue-600 uppercase mb-2 tracking-widest">Sugestão de Melhoria:</p>
                           <p className="text-sm text-slate-700 italic leading-relaxed">"{selectedMovement.evaluation.sugestaoAtendimento || 'Nenhuma sugestão.'}"</p>
                         </div>
                       </div>
                      </div>
                   </section>
                 ) : (
                   <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 opacity-30">
                     <ClipboardCheck size={64} className="text-slate-300" />
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aguardando preenchimento da pesquisa pelo hóspede</p>
                   </div>
                 )}
               </div>
               <div className="p-6 bg-white border-t border-slate-100 flex justify-center shrink-0">
                  <button onClick={() => setSelectedMovement(null)} className="bg-[#001f3f] text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all">FECHAR DETALHES</button>
               </div>
             </div>
           </div>
        )}

        {/* Modal Detalhes do Registro de Agendamento (EDITÁVEL) */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-md" onClick={() => setSelectedSubmission(null)}></div>
            <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
               <div className="bg-[#001f3f] text-white p-6 md:p-8 flex items-center justify-between border-b-4 border-[#D4AF37]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                    {selectedSubmission.status === 'Pendente' ? (
                      <Bell className="text-[#D4AF37] animate-bounce" size={28} />
                    ) : (
                      <FileText className="text-[#D4AF37]" size={28} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Detalhes do <span className="text-[#D4AF37]">Pedido</span></h2>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-blue-200 font-bold">{selectedSubmission.protocolo}</p>
                      <button 
                        onClick={() => copyToClipboard(selectedSubmission.protocolo, 'Protocolo copiado!')}
                        className="p-1 hover:bg-white/10 rounded text-blue-200 transition-colors"
                        title="Copiar Protocolo"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditingSubmission ? (
                    <button 
                      onClick={handleStartEditSubmission}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors text-[#D4AF37] flex items-center gap-2"
                      title="Editar Ficha"
                    >
                      <Edit size={20} /> <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Editar Dados</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleCancelEditSubmission}
                      className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-colors text-red-400 flex items-center gap-2"
                    >
                      <X size={20} /> <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Cancelar Edição</span>
                    </button>
                  )}
                  <button onClick={() => setSelectedSubmission(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors"><X size={28} /></button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar space-y-10">
                <section className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xs font-black text-[#001f3f] uppercase tracking-[0.2em] pb-2 border-b-2 border-slate-100">
                    <Shield size={14} className="text-[#D4AF37]" /> Dados Profissionais do Policial
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <EditableRow 
                      label="Nome Completo" 
                      value={isEditingSubmission ? editForm?.nome : selectedSubmission.nome} 
                      onChange={(val) => setEditForm(prev => ({...prev!, nome: val}))}
                    />
                    <EditableRow 
                      label="Matrícula" 
                      value={isEditingSubmission ? editForm?.matricula : selectedSubmission.matricula} 
                      onChange={(val) => setEditForm(prev => ({...prev!, matricula: val}))}
                      icon={IdCard} 
                    />
                    <EditableRow 
                      label="Posto / Graduação" 
                      value={isEditingSubmission ? editForm?.postoGraduacao : selectedSubmission.postoGraduacao} 
                      onChange={(val) => setEditForm(prev => ({...prev!, postoGraduacao: val}))}
                      icon={Shield} 
                    />
                    <EditableRow 
                      label="Data Admissão" 
                      type="date"
                      value={isEditingSubmission ? editForm?.dataAdmissaoPM : selectedSubmission.dataAdmissaoPM} 
                      onChange={(val) => setEditForm(prev => ({...prev!, dataAdmissaoPM: val}))}
                      icon={Calendar} 
                    />
                    <EditableRow 
                      label="Unidade Trabalho" 
                      value={isEditingSubmission ? editForm?.unidadeTrabalhoPM : selectedSubmission.unidadeTrabalhoPM} 
                      onChange={(val) => setEditForm(prev => ({...prev!, unidadeTrabalhoPM: val}))}
                      icon={Briefcase} 
                    />
                    <EditableRow 
                      label="Contato" 
                      value={isEditingSubmission ? editForm?.contatoUnidadePM : selectedSubmission.contatoUnidadePM} 
                      onChange={(val) => setEditForm(prev => ({...prev!, contatoUnidadePM: val}))}
                      icon={Smartphone} 
                    />
                    <EditableRow 
                      label="CPF" 
                      value={isEditingSubmission ? editForm?.cpf : selectedSubmission.cpf} 
                      onChange={(val) => setEditForm(prev => ({...prev!, cpf: val}))}
                      icon={UserCheck} 
                    />
                    <EditableRow 
                      label="E-mail" 
                      value={isEditingSubmission ? editForm?.email : selectedSubmission.email} 
                      onChange={(val) => setEditForm(prev => ({...prev!, email: val}))}
                      icon={Mail} 
                    />
                    <EditableRow 
                      label="Plano Saúde Card" 
                      value={isEditingSubmission ? editForm?.numeroCarteiraPlanoPolicial : selectedSubmission.numeroCarteiraPlanoPolicial} 
                      onChange={(val) => setEditForm(prev => ({...prev!, numeroCarteiraPlanoPolicial: val}))}
                      icon={CreditCard} 
                    />
                    <EditableRow 
                      label="Déficit Motor Policial" 
                      value={isEditingSubmission ? editForm?.necessidadeMobilidadePolicial : selectedSubmission.necessidadeMobilidadePolicial} 
                      onChange={(val) => setEditForm(prev => ({...prev!, necessidadeMobilidadePolicial: val}))}
                      icon={Activity} 
                    />
                    { (isEditingSubmission ? editForm?.necessidadeMobilidadePolicial === 'Sim' : selectedSubmission.necessidadeMobilidadePolicial === 'Sim') && (
                      <EditableRow 
                        label="Detalhe Déficit Motor" 
                        value={isEditingSubmission ? editForm?.detalheMobilidadePolicial : selectedSubmission.detalheMobilidadePolicial} 
                        onChange={(val) => setEditForm(prev => ({...prev!, detalheMobilidadePolicial: val}))}
                        icon={Info} 
                      />
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xs font-black text-[#001f3f] uppercase tracking-[0.2em] pb-2 border-b-2 border-slate-100">
                    <HeartPulse size={14} className="text-[#D4AF37]" /> Informações de Saúde
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <EditableRow 
                      label="Problemas de Saúde" 
                      value={isEditingSubmission ? editForm?.problemaSaude : selectedSubmission.problemaSaude} 
                      onChange={(val) => setEditForm(prev => ({...prev!, problemaSaude: val}))}
                    />
                    <EditableRow 
                      label="Medicação Contínua" 
                      value={isEditingSubmission ? editForm?.medicacaoContinua : selectedSubmission.medicacaoContinua} 
                      onChange={(val) => setEditForm(prev => ({...prev!, medicacaoContinua: val}))}
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xs font-black text-[#001f3f] uppercase tracking-[0.2em] pb-2 border-b-2 border-slate-100">
                    <Car size={14} className="text-[#D4AF37]" /> Logística e Estacionamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <EditableRow 
                      label="Vaga no Estacionamento" 
                      value={isEditingSubmission ? editForm?.vagaEstacionamento : selectedSubmission.vagaEstacionamento} 
                      onChange={(val) => setEditForm(prev => ({...prev!, vagaEstacionamento: val}))}
                    />
                    <EditableRow 
                      label="Dados do Veículo" 
                      value={isEditingSubmission ? editForm?.veiculoInfo : selectedSubmission.veiculoInfo} 
                      onChange={(val) => setEditForm(prev => ({...prev!, veiculoInfo: val}))}
                      icon={Car} 
                    />
                  </div>
                </section>

                {(selectedSubmission.temDependente1 === 'Sim' || (isEditingSubmission && editForm?.temDependente1 === 'Sim')) && (
                  <section className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-black text-[#001f3f] uppercase tracking-[0.2em] pb-2 border-b-2 border-slate-100">
                      <Users size={14} className="text-[#D4AF37]" /> Dados do Dependente
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      <EditableRow 
                        label="Nome Dependente" 
                        value={isEditingSubmission ? editForm?.nomeDependente1 : selectedSubmission.nomeDependente1} 
                        onChange={(val) => setEditForm(prev => ({...prev!, nomeDependente1: val}))}
                      />
                    <EditableRow 
                      label="CPF Dependente" 
                      value={isEditingSubmission ? editForm?.cpfDependente1 : selectedSubmission.cpfDependente1} 
                      onChange={(val) => setEditForm(prev => ({...prev!, cpfDependente1: val}))}
                    />
                    <EditableRow 
                      label="Parentesco" 
                      value={isEditingSubmission ? editForm?.parentescoDependente1 : selectedSubmission.parentescoDependente1} 
                      onChange={(val) => setEditForm(prev => ({...prev!, parentescoDependente1: val}))}
                    />
                    <EditableRow 
                      label="Déficit Motor Dependente" 
                      value={isEditingSubmission ? editForm?.necessidadeMobilidadeDependente1 : selectedSubmission.necessidadeMobilidadeDependente1} 
                      onChange={(val) => setEditForm(prev => ({...prev!, necessidadeMobilidadeDependente1: val}))}
                    />
                    { (isEditingSubmission ? editForm?.necessidadeMobilidadeDependente1 === 'Sim' : selectedSubmission.necessidadeMobilidadeDependente1 === 'Sim') && (
                      <EditableRow 
                        label="Detalhe Déficit Motor Dep." 
                        value={isEditingSubmission ? editForm?.detalheMobilidadeDependente1 : selectedSubmission.detalheMobilidadeDependente1} 
                        onChange={(val) => setEditForm(prev => ({...prev!, detalheMobilidadeDependente1: val}))}
                      />
                    )}
                      <EditableRow 
                        label="Plano Dependente" 
                        value={isEditingSubmission ? editForm?.possuiPlanoDependente1 : selectedSubmission.possuiPlanoDependente1} 
                        onChange={(val) => setEditForm(prev => ({...prev!, possuiPlanoDependente1: val}))}
                      />
                      <EditableRow 
                        label="Dados Plano Dependente" 
                        value={isEditingSubmission ? editForm?.planoENumeroDependente1 : selectedSubmission.planoENumeroDependente1} 
                        onChange={(val) => setEditForm(prev => ({...prev!, planoENumeroDependente1: val}))}
                      />
                    </div>
                  </section>
                )}

                <section className="bg-blue-900/5 p-8 rounded-[3rem] border border-blue-900/10 space-y-6">
                  <h3 className="flex items-center gap-2 text-xs font-black text-[#001f3f] uppercase tracking-[0.2em] pb-2 border-b border-blue-900/10 text-center justify-center">
                    <Calendar size={14} className="text-[#D4AF37]" /> Período de Estadia
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] text-center shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Entrada</span>
                      {isEditingSubmission ? (
                        <input type="date" value={editForm?.dataEntrada || ''} onChange={e => setEditForm(prev => ({...prev!, dataEntrada: e.target.value}))} className="text-sm font-bold w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 mt-2" />
                      ) : (
                        <span className="text-xl font-black text-blue-950">{selectedSubmission.dataEntrada}</span>
                      )}
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] text-center shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Saída</span>
                      {isEditingSubmission ? (
                        <input type="date" value={editForm?.dataSaida || ''} onChange={e => setEditForm(prev => ({...prev!, dataSaida: e.target.value}))} className="text-sm font-bold w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 mt-2" />
                      ) : (
                        <span className="text-xl font-black text-blue-950">{selectedSubmission.dataSaida}</span>
                      )}
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] text-center shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Previsão Chegada</span>
                      {isEditingSubmission ? (
                        <input type="time" value={editForm?.horarioChegada || ''} onChange={e => setEditForm(prev => ({...prev!, horarioChegada: e.target.value}))} className="text-sm font-bold w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 mt-2" />
                      ) : (
                        <span className="text-xl font-black text-blue-950">{selectedSubmission.horarioChegada}</span>
                      )}
                    </div>
                  </div>
                </section>
              </div>
              <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-3">
                 {isEditingSubmission ? (
                   <>
                     <button onClick={handleCancelEditSubmission} className="w-full sm:w-auto bg-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancelar Alterações</button>
                     <button onClick={handleSaveSubmissionEdit} className="w-full sm:w-auto bg-[#001f3f] text-[#D4AF37] px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                       <Save size={16} /> Salvar Modificações
                     </button>
                   </>
                 ) : (
                   <>
                     <button onClick={(e) => { handleUpdateStatus(selectedSubmission.id, 'Aprovado', e); setSelectedSubmission(null); }} className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg text-xs">APROVAR SOLICITAÇÃO</button>
                     <button onClick={(e) => { handleUpdateStatus(selectedSubmission.id, 'Recusado', e); setSelectedSubmission(null); }} className="w-full sm:w-auto bg-amber-500 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg text-xs">RECUSAR SOLICITAÇÃO</button>
                   </>
                 )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
