# Estrutura Completa do Banco de Dados - FSL Solution

## Credenciais de Acesso

### Usuário Admin
- **Email:** brasilviptv@gmail.com
- **Senha:** Senha123!
- **Role:** admin

### Usuário de Teste (Cliente)
Para criar um usuário de teste:
1. Acesse `/register`
2. Preencha os dados
3. O usuário será criado automaticamente com role "client"
4. Opcionalmente, aprove o usuário em `/approvals` (se sistema de aprovação estiver ativo)

---

## Tabelas do Banco de Dados

### 1. profiles
**Descrição:** Perfis de usuários vinculados ao sistema de autenticação

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  full_name text NOT NULL,
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id` - UUID (PK, FK para auth.users)
- `role` - Papel do usuário (client/admin)
- `full_name` - Nome completo
- `phone` - Telefone de contato
- `created_at` - Data de criação
- `updated_at` - Data de atualização

**RLS Policies:**
- Usuários podem ver e atualizar apenas seu próprio perfil
- Admins podem ver e atualizar todos os perfis

---

### 2. services
**Descrição:** Serviços oferecidos pela agência

```sql
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  base_price numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id` - UUID (PK)
- `name` - Nome do serviço
- `description` - Descrição detalhada
- `base_price` - Preço base
- `created_at` - Data de criação

**RLS Policies:**
- Qualquer pessoa pode visualizar
- Apenas admins podem gerenciar (criar/atualizar/deletar)

**Dados Iniciais:**
1. Criação de Sites - R$ 2.500,00
2. Criação de Logos - R$ 800,00
3. Gerenciamento de Tráfego - R$ 1.500,00
4. Infoprodutos - R$ 3.000,00

---

### 3. projects
**Descrição:** Projetos dos clientes

```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  project_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id` - UUID (PK)
- `client_id` - FK para profiles
- `service_id` - FK para services
- `project_name` - Nome do projeto
- `status` - Estado (pending/in_progress/completed/cancelled)
- `progress_percentage` - Percentual de conclusão (0-100)
- `start_date` - Data de início
- `end_date` - Data de término
- `notes` - Anotações
- `created_at` - Data de criação
- `updated_at` - Data de atualização

**RLS Policies:**
- Clientes podem ver apenas seus próprios projetos
- Admins podem ver e gerenciar todos os projetos

---

### 4. messages
**Descrição:** Mensagens trocadas nos projetos

```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id` - UUID (PK)
- `project_id` - FK para projects
- `sender_id` - FK para profiles
- `message` - Conteúdo da mensagem
- `is_read` - Status de leitura
- `created_at` - Data de criação

**RLS Policies:**
- Usuários podem ver mensagens dos seus projetos
- Usuários podem enviar mensagens nos seus projetos
- Admins podem ver e atualizar todas as mensagens

---

### 5. infoproducts
**Descrição:** Produtos digitais à venda

```sql
CREATE TABLE infoproducts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  image_url text DEFAULT '',
  purchase_link text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id` - UUID (PK)
- `name` - Nome do produto
- `description` - Descrição
- `price` - Preço
- `image_url` - URL da imagem
- `purchase_link` - Link de compra
- `is_active` - Status ativo/inativo
- `created_at` - Data de criação

**RLS Policies:**
- Qualquer pessoa pode ver produtos ativos
- Apenas admins podem gerenciar produtos

---

### 6. quote_requests
**Descrição:** Solicitações de orçamento via formulário de contato

```sql
CREATE TABLE quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  service_type text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id` - UUID (PK)
- `name` - Nome do solicitante
- `email` - Email de contato
- `phone` - Telefone
- `service_type` - Tipo de serviço solicitado
- `message` - Mensagem
- `status` - Estado (new/contacted/converted/closed)
- `created_at` - Data de criação

**RLS Policies:**
- Qualquer pessoa pode criar solicitações
- Apenas admins podem visualizar e atualizar

---

### 7. portfolio
**Descrição:** Portfólio de trabalhos realizados

```sql
CREATE TABLE portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  project_url text,
  description text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id` - UUID (PK)
- `title` - Título do projeto
- `category` - Categoria
- `image_url` - URL da imagem
- `project_url` - URL do projeto (opcional)
- `description` - Descrição
- `is_active` - Status ativo/inativo
- `created_at` - Data de criação

**RLS Policies:**
- Qualquer pessoa pode ver itens ativos do portfólio
- Admins podem ver e gerenciar todos os itens

**Índices:**
- idx_portfolio_category
- idx_portfolio_is_active
- idx_portfolio_created_at

---

### 8. site_visits
**Descrição:** Contador de visitas do site

```sql
CREATE TABLE site_visits (
  id bigserial PRIMARY KEY,
  page text UNIQUE NOT NULL DEFAULT 'home',
  visit_count integer DEFAULT 0,
  last_visit timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id` - bigserial (PK)
- `page` - Identificador da página (único)
- `visit_count` - Contador de visitas
- `last_visit` - Data da última visita
- `created_at` - Data de criação
- `updated_at` - Data de atualização

**RLS Policies:**
- Qualquer pessoa pode visualizar
- Sistema pode inserir e atualizar

---

### 9. user_approvals
**Descrição:** Sistema de aprovação de novos usuários

```sql
CREATE TABLE user_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id` - UUID (PK)
- `user_id` - FK para auth.users
- `email` - Email do usuário
- `full_name` - Nome completo
- `phone` - Telefone
- `status` - Estado (pending/approved/rejected)
- `approved_by` - FK para profiles (admin que aprovou)
- `approved_at` - Data de aprovação
- `rejection_reason` - Motivo da rejeição
- `created_at` - Data de criação

**RLS Policies:**
- Apenas admins podem visualizar e gerenciar aprovações
- Sistema pode inserir novas solicitações

**Índices:**
- idx_user_approvals_status
- idx_user_approvals_user_id
- idx_user_approvals_created_at

---

### 10. password_reset_tokens
**Descrição:** Tokens para reset de senha

```sql
CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  temp_password text NOT NULL,
  used boolean DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);
```

**Campos:**
- `id` - UUID (PK)
- `user_id` - FK para auth.users
- `email` - Email do usuário
- `token` - Token único
- `temp_password` - Senha temporária gerada
- `used` - Flag indicando se foi usado
- `expires_at` - Data de expiração (24 horas)
- `created_at` - Data de criação

**RLS Policies:**
- Acesso direto negado (gerenciado por Edge Functions)

**Índices:**
- idx_password_reset_tokens_token
- idx_password_reset_tokens_email

---

## Funções do Banco de Dados

### 1. handle_new_user()
**Descrição:** Cria automaticamente um perfil quando um novo usuário se registra

**Trigger:** Executado após INSERT em auth.users

**Comportamento:**
- Cria registro em `profiles` com dados de `raw_user_meta_data`
- Define role padrão como 'client'
- Captura erros sem bloquear criação do usuário

### 2. update_updated_at_column()
**Descrição:** Atualiza automaticamente o campo `updated_at`

**Triggers:**
- update_profiles_updated_at (profiles)
- update_projects_updated_at (projects)

### 3. increment_visit_count(page_name text)
**Descrição:** Incrementa contador de visitas de uma página

**Uso:**
```sql
SELECT increment_visit_count('home');
```

**Comportamento:**
- Insere novo registro se página não existir
- Incrementa contador se página já existir
- Atualiza last_visit e updated_at

---

## Índices de Performance

```sql
-- Portfolio
idx_portfolio_category
idx_portfolio_is_active
idx_portfolio_created_at

-- Projects
idx_projects_client_id
idx_projects_status

-- Messages
idx_messages_project_id
idx_messages_sender_id

-- User Approvals
idx_user_approvals_status
idx_user_approvals_user_id
idx_user_approvals_created_at

-- Password Reset
idx_password_reset_tokens_token
idx_password_reset_tokens_email
```

---

## Edge Functions

### 1. send-approval-email
**Endpoint:** `/functions/v1/send-approval-email`
**Método:** POST
**Autenticação:** Requerida

**Payload:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "fullName": "Nome do Usuário",
  "phone": "11999999999"
}
```

### 2. send-password-reset
**Endpoint:** `/functions/v1/send-password-reset`
**Método:** POST
**Autenticação:** Não requerida

**Payload:**
```json
{
  "email": "user@example.com"
}
```

### 3. send-contact-email
**Endpoint:** `/functions/v1/send-contact-email`
**Método:** POST
**Autenticação:** Não requerida

**Payload:**
```json
{
  "name": "Nome",
  "email": "email@example.com",
  "phone": "11999999999",
  "service_type": "Tipo de Serviço",
  "message": "Mensagem"
}
```

---

## Segurança (Row Level Security)

Todas as tabelas têm RLS habilitado com políticas específicas:

### Princípios de Segurança:
1. **Acesso Público:** services, portfolio (ativos), infoproducts (ativos)
2. **Acesso Próprio:** Usuários acessam apenas seus próprios dados
3. **Acesso Admin:** Admins têm acesso completo via verificação JWT
4. **Proteção de Dados:** Tokens de reset sem acesso direto

### Verificação de Admin:
```sql
(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
```

---

## Como Aplicar as Migrações

### Opção 1: Via Supabase Dashboard
1. Acesse o Dashboard do Supabase
2. Vá em "SQL Editor"
3. Copie o conteúdo das migrações em `/supabase/migrations/`
4. Execute em ordem cronológica

### Opção 2: Via Supabase CLI
```bash
supabase db reset
supabase db push
```

### Ordem das Migrações:
1. `20251209222653_create_complete_database_schema.sql`
2. `20251209224224_create_user_approvals_table.sql`

---

## Verificação da Estrutura

Execute no SQL Editor do Supabase:

```sql
-- Verificar todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verificar políticas RLS
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Verificar funções
SELECT proname, prosrc
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace;
```

---

## Status Atual

- ✅ Estrutura de tabelas definida
- ✅ Políticas RLS configuradas
- ✅ Triggers e funções criados
- ✅ Índices de performance adicionados
- ✅ Edge Functions implementadas
- ✅ Dados iniciais (serviços) preparados
- ✅ Sistema de aprovação implementado
- ✅ Sistema de recuperação de senha implementado

---

## Próximos Passos

1. Aplicar as migrações no Supabase Dashboard
2. Verificar criação de todas as tabelas
3. Testar usuário admin (brasilviptv@gmail.com)
4. Criar usuário de teste para cliente
5. Configurar serviço de email (Resend/SendGrid) para notificações
