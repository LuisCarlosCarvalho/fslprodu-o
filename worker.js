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

      return new Response(htmlResponse, {
        status: 410,
        headers: {
          'Content-Type': 'text/html',
          'X-Robots-Tag': 'noindex, noarchive' // Reforço para desindexação
        }
      });
    }

    // 3. FLUXO NORMAL DE APLICAÇÃO
    // Se não for um redirect prioritário nem um padrão legado, passa a requisição
    // adiante para o seu servidor principal (Hostinger).
    return fetch(request);
  }
};
