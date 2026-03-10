
import { Submission, AdminUser, NotificationSettings, MovementRecord, MovementEvaluation } from './types';

const KEYS = {
  SUBMISSIONS: 'dps_submissions',
  ADMINS: 'dps_admins',
  SETTINGS: 'dps_settings',
  MOVEMENTS: 'dps_movements'
};

const DEFAULT_SUPABASE_URL = 'https://regkhooerrzhxixpstvw.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_sODSG2gEKFQtlYfl8vBrNA_TqhEDLag';

export const api = {
  async getEffectiveSettings(): Promise<NotificationSettings> {
    const data = localStorage.getItem(KEYS.SETTINGS);
    const defaultSettings: NotificationSettings = {
      enabled: false,
      targetEmail: '',
      serviceId: '',
      templateId: '',
      publicKey: '',
      dbConfig: {
        useRemote: true,
        supabaseUrl: DEFAULT_SUPABASE_URL,
        supabaseAnonKey: DEFAULT_SUPABASE_KEY
      }
    };
    
    if (!data) return defaultSettings;
    
    try {
      const stored = JSON.parse(data);
      const mergedDbConfig = {
        useRemote: stored.dbConfig?.useRemote ?? defaultSettings.dbConfig!.useRemote,
        supabaseUrl: (stored.dbConfig?.supabaseUrl && stored.dbConfig.supabaseUrl.trim() !== '') 
          ? stored.dbConfig.supabaseUrl 
          : defaultSettings.dbConfig!.supabaseUrl,
        supabaseAnonKey: (stored.dbConfig?.supabaseAnonKey && stored.dbConfig.supabaseAnonKey.trim() !== '') 
          ? stored.dbConfig.supabaseAnonKey 
          : defaultSettings.dbConfig!.supabaseAnonKey,
      };

      return {
        ...defaultSettings,
        ...stored,
        dbConfig: mergedDbConfig
      };
    } catch (e) {
      return defaultSettings;
    }
  },

  async getHeaders() {
    const settings = await this.getEffectiveSettings();
    const key = settings.dbConfig?.supabaseAnonKey || DEFAULT_SUPABASE_KEY;
    return {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=representation'
    };
  },

  async sendEmailNotification(submission: Submission): Promise<boolean> {
    const settings = await this.getEffectiveSettings();
    if (!settings.enabled || !settings.serviceId || !settings.templateId || !settings.publicKey) return false;

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: settings.serviceId,
          template_id: settings.templateId,
          user_id: settings.publicKey,
          template_params: {
            to_name: submission.nome,
            to_email: submission.email,
            protocolo: submission.protocolo,
            status: submission.status,
            data_entrada: submission.dataEntrada,
            message: submission.status === 'Aprovado' 
              ? 'Sua ficha de pré-agendamento foi APROVADA.' 
              : 'Sua solicitação de pré-agendamento foi RECUSADA.'
          }
        })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const settings = await this.getEffectiveSettings();
    try {
      const response = await fetch(`${settings.dbConfig!.supabaseUrl}/rest/v1/submissions?select=count`, {
        headers: await this.getHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      return response.ok ? { success: true, message: 'Conexão OK!' } : { success: false, message: `Status: ${response.status}` };
    } catch (e) {
      return { success: false, message: 'Erro de conexão.' };
    }
  },

  async getSubmissions(): Promise<Submission[]> {
    const settings = await this.getEffectiveSettings();
    if (settings.dbConfig?.useRemote) {
      try {
        const response = await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/submissions?select=*&order=timestamp.desc`, {
          headers: await this.getHeaders()
        });
        if (response.ok) return await response.json();
      } catch (e) {}
    }
    const data = localStorage.getItem(KEYS.SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  },

  async addSubmission(data: Submission): Promise<void> {
    const settings = await this.getEffectiveSettings();
    
    // Se estiver usando remoto, tenta salvar lá primeiro para garantir consistência
    if (settings.dbConfig?.useRemote) {
      try {
        const response = await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/submissions`, {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Erro Supabase: ${response.status} - ${JSON.stringify(errorData)}`);
        }
      } catch (e) {
        console.error('Falha na sincronização remota:', e);
        throw e; // Lança para o componente tratar
      }
    }

    // Salva localmente (como cache ou fallback)
    try {
      const local = localStorage.getItem(KEYS.SUBMISSIONS);
      let submissions = [];
      try {
        submissions = local ? JSON.parse(local) : [];
        if (!Array.isArray(submissions)) submissions = [];
      } catch (parseError) {
        submissions = [];
      }
      
      // Evita duplicatas se já foi salvo (por exemplo, em uma tentativa anterior que falhou no remoto mas salvou local)
      if (!submissions.some((s: any) => s.id === data.id)) {
        submissions.unshift(data);
        localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(submissions));
      }
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  },

  async updateSubmission(data: Submission): Promise<void> {
    const settings = await this.getEffectiveSettings();
    
    try {
      const local = localStorage.getItem(KEYS.SUBMISSIONS);
      if (local) {
        const submissions = JSON.parse(local);
        if (Array.isArray(submissions)) {
          const index = submissions.findIndex((s: any) => s.id === data.id);
          if (index !== -1) {
            submissions[index] = data;
            localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(submissions));
          }
        }
      }
    } catch (e) {
      console.error('Erro ao atualizar localStorage:', e);
    }

    if (settings.dbConfig?.useRemote) {
      try {
        const response = await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/submissions?id=eq.${data.id}`, {
          method: 'PATCH',
          headers: await this.getHeaders(),
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao atualizar remotamente: ${response.status}`);
        }
      } catch (e) {
        console.error('Erro ao atualizar remotamente:', e);
        throw e;
      }
    }
  },

  async getMovements(): Promise<MovementRecord[]> {
    const settings = await this.getEffectiveSettings();
    if (settings.dbConfig?.useRemote) {
      try {
        const response = await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/movements?select=*&order=timestamp.desc`, {
          headers: await this.getHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          return data.map((m: any) => ({
            id: m.id,
            type: m.type,
            nome: m.nome,
            matriculaRG: m.matricula_rg,
            cidadeUnidade: m.cidade_unidade,
            plantonista: m.plantonista,
            timestamp: m.timestamp,
            evaluation: m.evaluation ? (typeof m.evaluation === 'string' ? JSON.parse(m.evaluation) : m.evaluation) : undefined
          }));
        }
      } catch (e) {}
    }
    const data = localStorage.getItem(KEYS.MOVEMENTS);
    return data ? JSON.parse(data) : [];
  },

  async getMovementById(id: string): Promise<MovementRecord | null> {
    const settings = await this.getEffectiveSettings();
    if (settings.dbConfig?.useRemote) {
      try {
        const response = await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/movements?id=eq.${id}&select=*`, {
          headers: await this.getHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const m = data[0];
            return {
              id: m.id,
              type: m.type,
              nome: m.nome,
              matriculaRG: m.matricula_rg,
              cidadeUnidade: m.cidade_unidade,
              plantonista: m.plantonista,
              timestamp: m.timestamp,
              evaluation: m.evaluation ? (typeof m.evaluation === 'string' ? JSON.parse(m.evaluation) : m.evaluation) : undefined
            };
          }
        }
      } catch (e) {}
    }
    const data = localStorage.getItem(KEYS.MOVEMENTS);
    if (data) {
      const movements = JSON.parse(data);
      return movements.find((m: any) => m.id === id) || null;
    }
    return null;
  },

  async addMovement(movement: MovementRecord): Promise<void> {
    const local = localStorage.getItem(KEYS.MOVEMENTS);
    const movements = local ? JSON.parse(local) : [];
    movements.unshift(movement);
    localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(movements));

    const settings = await this.getEffectiveSettings();
    if (!settings.dbConfig?.useRemote) return;

    const payload: any = {
      id: movement.id,
      type: movement.type,
      nome: movement.nome,
      matricula_rg: movement.matriculaRG,
      cidade_unidade: movement.cidadeUnidade,
      plantonista: movement.plantonista,
      timestamp: movement.timestamp,
      evaluation: movement.evaluation || null
    };

    try {
      const headers = await this.getHeaders();
      let response = await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/movements`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro Supabase: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    } catch (e) {
      console.error('Erro na sincronização de portaria:', e);
    }
  },

  async updateMovementEvaluation(id: string, evaluation: MovementEvaluation): Promise<void> {
    const settings = await this.getEffectiveSettings();
    const local = localStorage.getItem(KEYS.MOVEMENTS);
    if (local) {
      const movements = JSON.parse(local);
      const index = movements.findIndex((m: any) => m.id === id);
      if (index !== -1) {
        movements[index].evaluation = evaluation;
        localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(movements));
      }
    }

    if (settings.dbConfig?.useRemote) {
      try {
        await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/movements?id=eq.${id}`, {
          method: 'PATCH',
          headers: await this.getHeaders(),
          body: JSON.stringify({ evaluation })
        });
      } catch (e) {
        console.error('Erro ao atualizar avaliação remotamente:', e);
      }
    }
  },

  async updateSubmissionStatus(id: string, status: string): Promise<void> {
    const settings = await this.getEffectiveSettings();
    if (settings.dbConfig?.useRemote) {
      try {
        const response = await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/submissions?id=eq.${id}`, {
          method: 'PATCH',
          headers: await this.getHeaders(),
          body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error(`Erro status: ${response.status}`);
      } catch (e) {
        console.error('Erro ao atualizar status remotamente:', e);
        throw e;
      }
    }
    
    try {
      const local = localStorage.getItem(KEYS.SUBMISSIONS);
      if (local) {
        const submissions = JSON.parse(local);
        if (Array.isArray(submissions)) {
          const index = submissions.findIndex((s: any) => s.id === id);
          if (index !== -1) {
            submissions[index].status = status;
            localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(submissions));
          }
        }
      }
    } catch (e) {}
  },

  async deleteSubmission(id: string): Promise<void> {
    const settings = await this.getEffectiveSettings();
    if (settings.dbConfig?.useRemote) {
      try {
        const response = await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/submissions?id=eq.${id}`, {
          method: 'DELETE',
          headers: await this.getHeaders()
        });
        if (!response.ok) throw new Error(`Erro ao deletar remotamente: ${response.status}`);
      } catch (e) {
        console.error('Erro ao deletar remotamente:', e);
        throw e;
      }
    }
    
    try {
      const local = localStorage.getItem(KEYS.SUBMISSIONS);
      if (local) {
        const submissions = JSON.parse(local);
        if (Array.isArray(submissions)) {
          localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(submissions.filter((s: any) => s.id !== id)));
        }
      }
    } catch (e) {}
  },

  async getAdmins(): Promise<AdminUser[]> {
    const settings = await this.getEffectiveSettings();
    if (settings.dbConfig?.useRemote) {
      try {
        const response = await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/admins?select=*`, {
          headers: await this.getHeaders()
        });
        if (response.ok) return await response.json();
      } catch (e) {}
    }
    const data = localStorage.getItem(KEYS.ADMINS);
    return data ? JSON.parse(data) : [];
  },

  async addAdmin(admin: AdminUser): Promise<void> {
    const settings = await this.getEffectiveSettings();
    const local = localStorage.getItem(KEYS.ADMINS);
    const admins = local ? JSON.parse(local) : [];
    admins.push(admin);
    localStorage.setItem(KEYS.ADMINS, JSON.stringify(admins));

    if (settings.dbConfig?.useRemote) {
      try {
        await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/admins`, {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify(admin)
        });
      } catch (e) {}
    }
  },

  async updateAdminPassword(id: string, newPassword: string): Promise<void> {
    const settings = await this.getEffectiveSettings();
    if (settings.dbConfig?.useRemote) {
      try {
        await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/admins?id=eq.${id}`, {
          method: 'PATCH',
          headers: await this.getHeaders(),
          body: JSON.stringify({ password: newPassword })
        });
      } catch (e) {}
    }
    const local = localStorage.getItem(KEYS.ADMINS);
    if (local) {
      const admins = JSON.parse(local);
      const index = admins.findIndex((a: any) => a.id === id);
      if (index !== -1) {
        admins[index].password = newPassword;
        localStorage.setItem(KEYS.ADMINS, JSON.stringify(admins));
      }
    }
  },

  async deleteAdmin(id: string): Promise<void> {
    const settings = await this.getEffectiveSettings();
    if (settings.dbConfig?.useRemote) {
      try {
        const response = await fetch(`${settings.dbConfig.supabaseUrl}/rest/v1/admins?id=eq.${id}`, {
          method: 'DELETE',
          headers: await this.getHeaders()
        });
        if (!response.ok) throw new Error(`Erro delete admin: ${response.status}`);
      } catch (e) {
        console.error('Erro ao deletar admin remotamente:', e);
        throw e;
      }
    }
    const local = localStorage.getItem(KEYS.ADMINS);
    if (local) {
      const admins = JSON.parse(local);
      localStorage.setItem(KEYS.ADMINS, JSON.stringify(admins.filter((a: any) => a.id !== id)));
    }
  },

  async getSettings(): Promise<NotificationSettings> {
    return await this.getEffectiveSettings();
  },

  async saveSettings(settings: NotificationSettings): Promise<void> {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};
