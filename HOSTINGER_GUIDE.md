# Guia de Configuração - Hostinger + GitHub Automation

Para que seu site funcione corretamente na Hostinger com atualização automática, siga estes passos:

## 1. Configurar Segredos no GitHub (IMPORTANTE)

Como as chaves do banco de dados são secretas, você precisa adicioná-las ao seu repositório no GitHub:

1. No seu repositório no GitHub, vá em **Settings** > **Secrets and variables** > **Actions**.
2. Clique em **New repository secret**.
3. Adicione estes dois segredos:
   - **Nome:** `VITE_SUPABASE_URL` | **Valor:** `https://qzjzlpilmptoojuguqas.supabase.co`
   - **Nome:** `VITE_SUPABASE_ANON_KEY` | **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (a chave completa do seu arquivo .env)

## 2. Configurar a Branch no GitHub Actions

O script que criei vai gerar automaticamente uma branch chamada **`deploy`** no seu GitHub toda vez que você fizer um push na `main`.

## 3. Configurar a Hostinger

Agora, no painel da Hostinger (seção de Git):

1. **Repositório:** Cole o link do seu GitHub.
2. **Branch:** Altere de `main` para **`deploy`**.
3. **Diretório de Instalação:** Deixe como `/` (ou a pasta onde o site deve ficar).
4. Clique em **Criar** ou **Conectar**.

---

### Por que isso resolve?

A Hostinger não consegue "buildar" o código React puro. Com essa automação, o GitHub Action faz o trabalho pesado, gera os arquivos prontos e os coloca na branch `deploy`. A Hostinger então apenas exibe esses arquivos já prontos para o seu cliente final.
