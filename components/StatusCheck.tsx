
import React, { useState } from 'react';
import { Search, Loader2, FileText, CheckCircle2, Clock, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { Submission } from '../types';

const StatusCheck: React.FC = () => {
  const [protocol, setProtocol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Submission | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocol.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const submissions = await api.getSubmissions();
      const found = submissions.find(s => 
        s.protocolo.toLowerCase().trim() === protocol.toLowerCase().trim()
      );

      if (found) {
        setResult(found);
      } else {
        setError('Nenhuma solicitação encontrada com este número de protocolo. Verifique se digitou corretamente (incluindo o prefixo #PMBA-).');
      }
    } catch (err) {
      setError('Ocorreu um erro ao buscar os dados. Tente novamente em alguns instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Aprovado':
        return (
          <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-3xl flex items-center gap-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Status da Solicitação</p>
              <h4 className="text-xl font-black text-emerald-900 uppercase">APROVADO</h4>
              <p className="text-xs text-emerald-700 mt-1 font-medium">Sua hospedagem foi autorizada pelo DPS. Compareça na data prevista.</p>
            </div>
          </div>
        );
      case 'Recusado':
        return (
          <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex items-center gap-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Status da Solicitação</p>
              <h4 className="text-xl font-black text-red-900 uppercase">RECUSADO</h4>
              <p className="text-xs text-red-700 mt-1 font-medium">Sua solicitação não pôde ser atendida no momento. Entre em contato com o DPS.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex items-center gap-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Status da Solicitação</p>
              <h4 className="text-xl font-black text-amber-900 uppercase">PENDENTE</h4>
              <p className="text-xs text-amber-700 mt-1 font-medium">Sua ficha está em análise pela equipe técnica. Aguarde o prazo regulamentar.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-10 max-w-xl mx-auto">
      <div className="text-center">
        <h3 className="text-2xl font-black text-[#001f3f] uppercase tracking-tighter">Acompanhar <span className="text-[#D4AF37]">Solicitação</span></h3>
        <p className="text-slate-500 text-sm mt-1">Insira seu número de protocolo para verificar o andamento.</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#D4AF37] transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Ex: #PMBA-1234"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all text-lg font-mono font-bold uppercase placeholder:text-slate-300"
            required
          />
        </div>
        <button 
          type="submit"
          disabled={isLoading || !protocol}
          className="w-full bg-[#001f3f] hover:bg-blue-950 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin" size={20} /> Buscando no Sistema...
            </>
          ) : (
            'Consultar Agora'
          )}
        </button>
      </form>

      {error && (
        <div className="p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p className="text-xs font-bold leading-relaxed uppercase">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <StatusBadge status={result.status} />
          
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumo do Cadastro</span>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                 <span className="text-xs text-slate-500 font-bold uppercase">Titular</span>
                 <span className="text-sm text-slate-800 font-black">{result.nome}</span>
               </div>
               <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                 <span className="text-xs text-slate-500 font-bold uppercase">Entrada</span>
                 <span className="text-sm text-slate-800 font-black">{result.dataEntrada}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-500 font-bold uppercase">Saída</span>
                 <span className="text-sm text-slate-800 font-black">{result.dataSaida}</span>
               </div>
            </div>
          </div>
          
          <button 
            onClick={() => {setResult(null); setProtocol('');}} 
            className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest transition-colors"
          >
            Limpar Busca
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusCheck;
