export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    // 1. PRIORIDADE ABSOLUTA: Redirecionamentos de Ponte Semântica (301)
    // Usado para URLs antigas com MUITOS backlinks.
    // O destino MANTÉM conexão com o tema original, mas voltado para a nova especialidade.
    const priorityRedirects = {
      // URL Antiga de Alta Autoridade -> Nova URL de Data Analytics (Pivô Semântico)
      '/folha-de-pagamento-lucro-real': '/hub/analytics/analise-dados-departamento-pessoal-payroll',
      '/calculo-hora-extra': '/hub/analytics/dashboards-eficiencia-operacional-rh',
      '/imposto-de-renda-pj': '/hub/analytics/business-intelligence-planejamento-tributario'
    };

    // a. Verifica se a rota exata bate com alguma regra de redirecionamento 301
    // (O trailing slash / final afeta o path, então comparamos sem ele ou verificamos ambas as formas)
    const cleanPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    const supabaseUrl = env.SUPABASE_URL || "https://qzjzlpilmptoojuguqas.supabase.co";
    const supabaseKey = env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anpscGlsbXB0b29qdWd1cWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNDQ2NjIsImV4cCI6MjA4MjkyMDY2Mn0.z2Mv4Nzvyel0xEZrcCxmoqBwpYHmoTPTRLlJ6Ja_ujI";

    const logToSupabase = (loggedPath, statusCode) => {
      ctx.waitUntil(fetch(`${supabaseUrl}/rest/v1/seo_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          path: loggedPath,
          status_code: statusCode,
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
      }).catch(err => console.error("Falha na telemetria:", err)));
    };

    if (priorityRedirects[cleanPath]) {
      const destinationUrl = new URL(priorityRedirects[cleanPath], url.origin).toString();
      return Response.redirect(destinationUrl, 301); 
      // Status 301: Permanent Redirect (Transfere o "Link Juice" do Google)
    }

    // 2. EXPURGO GERAL: Acesso a Padrões Legados (410)
    // Tudo que sobrou e não tem backlink forte deve ser obliterado do índice.
    const legacyPatterns = [
      '/contabilidade',
      '/financeiro',
      '/tax-compliance',
      '/payroll',
      '/bpo-financeiro',
      '/impostos'
    ];

    // b. Verifica se a URL acessada começa com algum dos padrões legados (Expurgo)
    const isLegacy = legacyPatterns.some(pattern => path.startsWith(pattern));

    if (isLegacy) {
      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Conteúdo Removido | FSL Solution</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: white; }
            h1 { color: #3b82f6; }
            a { color: #6366f1; text-decoration: none; }
          </style>
        </head>
        <body>
          <h1>410 - Conteúdo Removido Permanentemente</h1>
          <p>Esta página não faz mais parte do nosso escopo de atuação técnica (Data Analytics & Growth).</p>
          <p>Conheça nossas novas <a href="https://fslsolution.com/solucoes">Soluções de Inteligência Analítica</a>.</p>
        </body>
        </html>
      `;

      logToSupabase(cleanPath, 410); // Loga no Supabase em background
      return new Response(htmlResponse, {
        status: 410,
        headers: {
          'Content-Type': 'text/html',
          'X-Robots-Tag': 'noindex, noarchive' // Reforço para desindexação
        }
      });
    }

    // 2.5 TELEMETRIA DE SUCESSO DO HUB (200)
    // Se for um acesso ao novo Hub, loga as visualizações (status 200)
    if (cleanPath.startsWith('/hub')) {
      logToSupabase(cleanPath, 200);
    }

    // 3. FLUXO NORMAL DE APLICAÇÃO
    // Se não for um redirect prioritário nem um padrão legado, passa a requisição
    // adiante para o seu servidor principal (Hostinger).
    return fetch(request);
  }
};
