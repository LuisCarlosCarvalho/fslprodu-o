# Troubleshooting - Erro de Login

## Problema
Erro "Database error querying schema" ao tentar fazer login

## Credenciais Admin
- **Email:** brasilviptv@gmail.com
- **Senha:** Senha123!
- **Role:** admin

## Estado Atual (09/12/2025)

### ✅ Configurações Corretas
- Tabela `profiles` existe e está funcional
- RLS está habilitado
- Políticas RLS estão ativas
- Trigger de criação automática de perfil funciona
- Usuário admin existe e tem perfil criado
- Build do projeto está funcionando

### 🔍 Políticas RLS Ativas
1. **Enable read for authenticated users** - Permite usuários lerem próprio perfil ou admin ler todos
2. **Enable update for users and admins** - Permite atualização do próprio perfil ou admin atualizar todos
3. **Enable delete for admins only** - Apenas admins podem deletar

## Soluções para Testar Amanhã

### Solução 1: Adicionar Tratamento de Erro no Frontend
Modificar `AuthContext.tsx` para capturar e exibir erro detalhado:

```typescript
const loadProfile = async (userId: string) => {
  try {
    console.log('Loading profile for user:', userId);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      // Não bloquear o login, apenas logar o erro
      setProfile(null);
      return;
    }

    if (data) {
      console.log('Profile loaded:', data);
      setProfile(data);
    }
  } catch (error) {
    console.error('Profile load error:', error);
    setProfile(null);
  } finally {
    setLoading(false);
  }
};
```

### Solução 2: Criar Política RLS Temporária Mais Permissiva
Se o erro persistir, aplicar esta migration:

```sql
-- Temporariamente permitir SELECT sem restrições para debug
DROP POLICY IF EXISTS "Enable read for authenticated users" ON profiles;

CREATE POLICY "Allow authenticated users to read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
```

### Solução 3: Verificar Logs do Supabase
1. Acessar Dashboard do Supabase
2. Ir em "Logs" > "Postgres Logs"
3. Procurar por erros relacionados a RLS durante tentativa de login
4. Verificar se há erro de permissão ou syntax error nas políticas

### Solução 4: Testar Query Diretamente
Executar no SQL Editor do Supabase:

```sql
-- Teste 1: Verificar se perfil existe
SELECT * FROM profiles WHERE id = 'bb5ebfb7-98b0-4600-93ad-12a1750175c2';

-- Teste 2: Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Teste 3: Usar view de debug (sem RLS)
SELECT * FROM profiles_debug WHERE email = 'brasilviptv@gmail.com';
```

## Próximos Passos
1. Abrir console do navegador e verificar logs detalhados do erro
2. Verificar se o erro ocorre antes ou depois da autenticação
3. Testar com a Solução 1 primeiro (menos invasiva)
4. Se persistir, usar Solução 2 para isolar se é problema de RLS
5. Verificar logs do Supabase para detalhes específicos

## Arquivos Relevantes
- `/src/contexts/AuthContext.tsx` - Contexto de autenticação
- `/src/lib/supabase.ts` - Cliente Supabase
- `/supabase/migrations/*` - Migrações do banco
