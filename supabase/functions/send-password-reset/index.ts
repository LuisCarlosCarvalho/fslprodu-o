import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PasswordResetRequest {
  email: string;
}


// Função para gerar token único
function generateToken(): string {
  return crypto.randomUUID();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email é obrigatório',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verificar se usuário existe
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw userError;
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      // Por segurança, retornar sucesso mesmo se usuário não existir
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Se o email existir, uma senha temporária será enviada.',
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Gerar token único para rastreamento (opcional, pode ser o ID da solicitação)
    const token = generateToken();

    // Salvar token e solicitação no banco (sem senha temporária)
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        email,
        token
      });

    if (tokenError) {
      throw tokenError;
    }

    // TODO: Integrar com serviço de email real (SendGrid, Resend, etc.)
    console.log('Solicitação de reset de senha para:', email);
    console.log('Administrador será notificado em: brasilviptv@gmail.com');

    // Simular envio de email para o admin
    const emailContent = `
Solicitação de recuperação de senha:

Email do usuário: ${email}
ID da Solicitação: ${token}

Acesse o painel administrativo para aprovar o reset de senha deste usuário.
    `;

    console.log('Conteúdo do email:', emailContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Solicitação enviada. O administrador analisará seu pedido para liberar o acesso.',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});