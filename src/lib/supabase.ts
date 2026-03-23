import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzjzlpilmptoojuguqas.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anpscGlsbXB0b29qdWd1cWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNDQ2NjIsImV4cCI6MjA4MjkyMDY2Mn0.z2Mv4Nzvyel0xEZrcCxmoqBwpYHmoTPTRLlJ6Ja_ujI';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables! Using hardcoded fallback connection.');
}

const fetchWithRetry = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 30000; // 30 segundos de limite absoluto por tentativa

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      // Se for um erro 5xx (erro de servidor do Supabase) ou 429 (Rate Limit), tentar de novo
      if (!response.ok && response.status >= 500 && attempt < MAX_RETRIES) {
        console.warn(`[Supabase Fetch] Falha na tentativa ${attempt + 1}. Status API: ${response.status}. Tentando novamente...`);
        await new Promise(res => setTimeout(res, 1000 * (attempt + 1))); // Backoff exponencial simples
        continue;
      }
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (attempt < MAX_RETRIES) {
        console.warn(`[Supabase Fetch] Falha na tentativa ${attempt + 1}. Erro de Rede: ${error?.message || 'Timeout/Abort'}. Tentando novamente em background...`);
        await new Promise(res => setTimeout(res, 1000 * (attempt + 1)));
        continue;
      }
      console.error(`[Supabase Fetch] Falha definitiva após ${MAX_RETRIES} retentativas.`);
      throw error;
    }
  }
  throw new Error('Limite de tentativas excedido');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: fetchWithRetry // Injeta nossa armadura de conexão
  }
});

export * from '../types';
