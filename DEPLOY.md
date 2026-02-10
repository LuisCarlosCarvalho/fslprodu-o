# Guia de Deploy - FSL Solution

## Problema: Tela Branca no Deploy

Se o seu projeto está mostrando uma tela branca quando hospedado, o problema mais comum é a falta de configuração das variáveis de ambiente.

## Solução Rápida

### 1. Configure as Variáveis de Ambiente

As variáveis de ambiente são OBRIGATÓRIAS para o projeto funcionar. O arquivo `.env` não é enviado para o repositório (está no .gitignore), então você precisa configurá-las na plataforma de hospedagem.

**Variáveis necessárias:**
```
VITE_SUPABASE_URL=https://naakhmjtaotydpedvguf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hYWtobWp0YW90eWRwZWR2Z3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4NjksImV4cCI6MjA3Nzg5Mzg2OX0.h08YHWbR5kkFl0043xZxDjzv3jy1BM20sXeY2IxkjIo
```

### 2. Instruções por Plataforma

#### Vercel

1. Acesse seu projeto no dashboard da Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione cada variável:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://naakhmjtaotydpedvguf.supabase.co`
   - Clique em **Add**
4. Adicione a segunda variável:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: (copie a chave completa acima)
   - Clique em **Add**
5. Vá em **Deployments** e clique em **Redeploy** no último deployment

#### Netlify

1. Acesse seu site no dashboard da Netlify
2. Vá em **Site settings** > **Environment variables**
3. Clique em **Add a variable**
4. Adicione:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://naakhmjtaotydpedvguf.supabase.co`
5. Clique em **Add a variable** novamente
6. Adicione:
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: (copie a chave completa acima)
7. Vá em **Deploys** e clique em **Trigger deploy** > **Deploy site**

#### Render

1. Acesse seu serviço no dashboard do Render
2. Vá em **Environment**
3. Adicione cada variável clicando em **Add Environment Variable**:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://naakhmjtaotydpedvguf.supabase.co`
4. Adicione a segunda:
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: (copie a chave completa acima)
5. Clique em **Manual Deploy** > **Deploy latest commit**

#### GitHub Pages / Cloudflare Pages

Para estas plataformas, você precisa configurar as variáveis nas configurações do projeto antes do build:

**GitHub Actions:**
```yaml
- name: Build
  run: npm run build
  env:
    VITE_SUPABASE_URL: https://naakhmjtaotydpedvguf.supabase.co
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

**Cloudflare Pages:**
1. Vá em Settings > Environment variables
2. Adicione as variáveis
3. Redeploy o projeto

### 3. Verificando o Deploy

Após configurar as variáveis e fazer o redeploy:

1. Abra o site no navegador
2. Se ainda houver tela branca, abra o Console do DevTools (F12)
3. Verifique se há erros no console
4. Se aparecer uma mensagem sobre variáveis de ambiente faltando, verifique se:
   - As variáveis foram adicionadas corretamente
   - O nome das variáveis está correto (com o prefixo `VITE_`)
   - Você fez o redeploy após adicionar as variáveis

### 4. Testando Localmente

Para testar localmente antes do deploy:

1. Copie o `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Cole as variáveis no arquivo `.env`

3. Execute:
   ```bash
   npm run build
   npm run preview
   ```

4. Acesse `http://localhost:4173` e verifique se funciona

## Banco de Dados Configurado

O banco de dados Supabase já está totalmente configurado com:
- Todas as tabelas criadas
- Políticas RLS configuradas
- Triggers funcionando
- Dados iniciais de serviços

## Primeiro Usuário Admin

Para acessar o dashboard admin pela primeira vez:

1. Registre-se no site através de `/register`
2. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
3. Selecione o projeto `naakhmjtaotydpedvguf`
4. Vá em **Table Editor** > **profiles**
5. Encontre seu registro (pelo email)
6. Altere o campo `role` de `client` para `admin`
7. Faça logout e login novamente
8. Acesse `/admin` para o dashboard administrativo

## Problemas Comuns

### Erro: "Missing Supabase environment variables"
- **Causa:** Variáveis de ambiente não configuradas
- **Solução:** Siga as instruções acima para sua plataforma

### Erro: "Failed to fetch"
- **Causa:** URL do Supabase incorreta ou projeto inativo
- **Solução:** Verifique se a URL está correta e o projeto Supabase está ativo

### Erro de autenticação
- **Causa:** Políticas RLS ou chave incorreta
- **Solução:** Verifique a chave anon no Supabase Dashboard

### Build com sucesso mas tela branca
- **Causa:** Variáveis não aplicadas no deploy
- **Solução:** Faça um novo deploy após adicionar as variáveis

## Suporte Adicional

Se ainda tiver problemas:
1. Verifique os logs da plataforma de hospedagem
2. Abra o console do navegador (F12) para ver erros
3. Confirme que fez o redeploy após adicionar as variáveis
4. Teste localmente com `npm run build && npm run preview`
