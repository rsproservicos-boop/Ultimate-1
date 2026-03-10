
-- SCRIPT DE ATUALIZAÇÃO PARA SUPABASE --

-- Tabela de Administradores
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Agendamentos (Submissions)
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    protocolo TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovado', 'Recusado')),
    "termsAccepted" BOOLEAN DEFAULT FALSE,
    profile TEXT, 
    nome TEXT,
    email TEXT, 
    matricula TEXT,
    "postoGraduacao" TEXT,
    cpf TEXT,
    telefone TEXT,
    "contatoUnidade" TEXT,
    escolaridade TEXT,
    "generoPolicial" TEXT,
    "possuiPlanoSaudePolicial" TEXT,
    "qualPlanoPolicial" TEXT,
    "numeroCarteiraPlanoPolicial" TEXT,
    endereco TEXT,
    "cidadeResidencia" TEXT,
    "pretensaoSalvadorPolicial" TEXT,
    "pretensaoOutroExplicaPolicial" TEXT,
    "situacaoPolicial" TEXT,
    "dataAdmissaoPM" TEXT,
    "unidadeTrabalhoPM" TEXT,
    "contatoUnidadePM" TEXT,
    "necessidadeMobilidadePolicial" TEXT DEFAULT 'Não',
    "detalheMobilidadePolicial" TEXT,
    "problemaSaude" TEXT,
    "medicacaoContinua" TEXT,
    "vagaEstacionamento" TEXT DEFAULT 'Não',
    "veiculoInfo" TEXT,
    "dataEntrada" TEXT,
    "dataSaida" TEXT,
    "horarioChegada" TEXT,
    motivo TEXT,
    -- Dependentes
    "temDependente1" TEXT DEFAULT 'Não',
    "nomeDependente1" TEXT,
    "cpfDependente1" TEXT,
    "permanenciaDependente1" TEXT,
    "emailDependente1" TEXT,
    "dataNascimentoDependente1" TEXT,
    "whatsappDependente1" TEXT,
    "generoDependente1" TEXT,
    "parentescoDependente1" TEXT,
    "parentescoOutroExplica1" TEXT,
    "necessidadeMobilidadeDependente1" TEXT DEFAULT 'Não',
    "detalheMobilidadeDependente1" TEXT,
    "pretensaoSalvadorDependente1" TEXT,
    "possuiPlanoDependente1" TEXT,
    "planoENumeroDependente1" TEXT,
    "temOutroDependente" TEXT DEFAULT 'Não',
    "nomeDependente2" TEXT,
    "cpfDependente2" TEXT,
    "emailDependente2" TEXT,
    "dataNascimentoDependente2" TEXT,
    "generoDependente2" TEXT,
    "parentescoDependente2" TEXT,
    "parentescoOutroExplica2" TEXT,
    "necessidadeMobilidadeDependente2" TEXT DEFAULT 'Não',
    "detalheMobilidadeDependente2" TEXT,
    "pretensaoSalvadorDependente2" TEXT,
    "possuiPlanoDependente2" TEXT,
    "planoENumeroDependente2" TEXT,
    "nomeTitular" TEXT,
    "matriculaTitular" TEXT,
    parentesco TEXT
);

-- Tabela de Movimentações (Portaria e Avaliação)
CREATE TABLE IF NOT EXISTS movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('check-in', 'check-out')),
    nome TEXT NOT NULL,
    matricula_rg TEXT NOT NULL,
    cidade_unidade TEXT NOT NULL,
    plantonista TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now(),
    evaluation JSONB DEFAULT NULL
);

-- Segurança (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (Simplificadas para o protótipo)
-- Em produção, deve-se restringir o acesso apenas a usuários autenticados ou via Service Role
DROP POLICY IF EXISTS "Enable all for anon on submissions" ON submissions;
DROP POLICY IF EXISTS "Enable all for anon on admins" ON admins;
DROP POLICY IF EXISTS "Enable all for anon on movements" ON movements;

CREATE POLICY "Enable all for anon on submissions" ON submissions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon on admins" ON admins FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon on movements" ON movements FOR ALL TO anon USING (true) WITH CHECK (true);

-- SCRIPT DE CORREÇÃO PARA TABELAS EXISTENTES (Execute no SQL Editor do Supabase se houver erros de coluna ausente)
-- Adiciona colunas que podem estar faltando em instalações anteriores
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "detalheMobilidadePolicial" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "temDependente1" TEXT DEFAULT 'Não';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "nomeDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "cpfDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "permanenciaDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "emailDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "dataNascimentoDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "whatsappDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "generoDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "parentescoDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "parentescoOutroExplica1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "necessidadeMobilidadeDependente1" TEXT DEFAULT 'Não';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "detalheMobilidadeDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "pretensaoSalvadorDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "possuiPlanoDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "planoENumeroDependente1" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "temOutroDependente" TEXT DEFAULT 'Não';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "nomeDependente2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "cpfDependente2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "emailDependente2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "dataNascimentoDependente2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "generoDependente2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "parentescoDependente2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "parentescoOutroExplica2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "necessidadeMobilidadeDependente2" TEXT DEFAULT 'Não';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "detalheMobilidadeDependente2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "pretensaoSalvadorDependente2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "possuiPlanoDependente2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "planoENumeroDependente2" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "nomeTitular" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "matriculaTitular" TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS "parentesco" TEXT;
