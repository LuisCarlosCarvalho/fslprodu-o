# FSL Solution Digital Agency

Sistema de gerenciamento para agência digital com funcionalidades de portfólio, serviços, projetos e autenticação.

## Configuração

### 1. Variáveis de Ambiente

Este projeto requer variáveis de ambiente do Supabase. Siga os passos abaixo:

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis no arquivo `.env`:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

3. Para obter essas credenciais:
   - Acesse [Supabase Dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto
   - Vá em Settings > API
   - Copie a URL e a chave anon/public

### 2. Instalação

```bash
npm install
```

### 3. Desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

### 4. Build para Produção

```bash
npm run build
```

Os arquivos de produção estarão na pasta `dist/`

## Deploy

### Configuração na Plataforma de Hospedagem

Quando fazer deploy do projeto, certifique-se de configurar as variáveis de ambiente na sua plataforma de hospedagem:

**Vercel:**
1. Vá em Settings > Environment Variables
2. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

**Netlify:**
1. Vá em Site settings > Environment variables
2. Adicione as variáveis de ambiente

**Outras plataformas:**
- Configure as variáveis de ambiente conforme a documentação da plataforma

### Banco de Dados

O banco de dados Supabase já está configurado com:
- Tabelas: profiles, services, projects, messages, infoproducts, quote_requests, portfolio
- RLS (Row Level Security) habilitado
- Políticas de segurança configuradas
- Trigger automático para criação de perfis

### Primeiro Acesso Admin

Para criar um usuário admin:
1. Registre-se normalmente pela interface
2. Acesse o Supabase Dashboard
3. Vá em Authentication > Users
4. Encontre seu usuário
5. Vá em Table Editor > profiles
6. Altere o campo `role` de 'client' para 'admin'

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── contexts/       # Contextos React (Auth)
├── lib/           # Configurações (Supabase)
├── pages/         # Páginas da aplicação
└── data/          # Dados estáticos (templates)
```

## Funcionalidades

- Autenticação de usuários (clientes e admin)
- Gestão de projetos
- Portfólio de trabalhos
- Gerenciamento de serviços
- Solicitações de orçamento
- Infoprodutos
- Dashboard admin completo
- Dashboard do cliente

## Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase (Backend/Auth/Database)
- Lucide React (Ícones)

## Solução de Problemas

### Tela Branca no Deploy

Se você ver uma tela branca após o deploy, verifique:

1. **Variáveis de ambiente configuradas:** Certifique-se de que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas na plataforma de hospedagem

2. **Console do navegador:** Abra o DevTools (F12) e verifique se há erros no console

3. **Build local:** Execute `npm run build` localmente para verificar se há erros

### Erros de Autenticação

- Verifique se as credenciais do Supabase estão corretas
- Confirme que o projeto Supabase está ativo
- Verifique as políticas RLS no Supabase

## Suporte

Para problemas ou dúvidas, verifique:
- Logs do console do navegador
- Logs do Supabase Dashboard
- Variáveis de ambiente configuradas corretamente
