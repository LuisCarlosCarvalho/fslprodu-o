import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ApprovalRequest {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, email, fullName, phone }: ApprovalRequest = await req.json();

    // Criar registro de aprovação
    const { data: approval, error: approvalError } = await supabase
      .from('user_approvals')
      .insert({
        user_id: userId,
        email,
        full_name: fullName,
        phone: phone || '',
        status: 'pending',
      })
      .select()
      .single();

    if (approvalError) {
      throw approvalError;
    }

    // TODO: Integrar com serviço de email real (SendGrid, Resend, etc.)
    // Por enquanto, apenas registramos no console
    console.log('Email de aprovação seria enviado para: brasilviptv@gmail.com');
    console.log('Novo usuário aguardando aprovação:', {
      name: fullName,
      email,
      phone,
    });

    // Simular envio de email
    const emailContent = `
Novo usuário aguardando aprovação:

Nome: ${fullName}
Email: ${email}
Telefone: ${phone || 'Não informado'}

Acesse o painel administrativo para aprovar ou rejeitar este cadastro.
    `;

    console.log('Conteúdo do email:', emailContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Aprovação registrada. Email de notificação seria enviado.',
        approvalId: approval.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao processar aprovação:', error);
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