
import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api';

interface Props {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<Props> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const isMasterHardcoded = 
        username.toLowerCase() === 'rodrigo1' && 
        password === '81416845';

      if (isMasterHardcoded) {
        onLoginSuccess();
        return;
      }

      const admins = await api.getAdmins();
      const userFound = admins.find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (userFound) {
        onLoginSuccess();
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro ao validar acesso.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-[#001f3f] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
            <ShieldCheck className="text-[#001f3f] w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">
            Acesso <span className="text-[#D4AF37]">Restrito</span>
          </h2>
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Controle Interno DPS</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <span className="text-xs font-bold uppercase">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#001f3f] transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#001f3f] transition-all text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#001f3f] hover:bg-blue-950 text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Entrar no Sistema'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Voltar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
