import { PaymentMethodsState, GlobalPaymentSettings, Profile } from '../types';

interface PaymentRequirement {
  orderValue: number;
  client: Profile;
  config: PaymentMethodsState;
  global: GlobalPaymentSettings;
}

export interface AvailableMethod {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  reason?: string;
  discount_percentage?: number;
}

/**
 * Payment Engine - Decide quais métodos exibir baseado em regras de negócio fintech.
 */
export const getAvailablePaymentMethods = (params: PaymentRequirement): AvailableMethod[] => {
  const { orderValue, client, config, global } = params;
  const isPortugal = client.country === 'Portugal';
  const score = client.payment_score || 100;
  
  const methods: AvailableMethod[] = [];

  // 1. Regra PIX (Brasil apenas)
  if (!isPortugal && config.pix.enabled) {
    let enabled = true;
    let reason = '';
    
    // Regra de Valor Máximo para PIX (exemplo: R$ 50.000)
    if (orderValue > 50000) {
      enabled = false;
      reason = 'Valor excede o limite operacional do PIX.';
    }

    methods.push({
      id: 'pix',
      name: 'PIX (Instantâneo)',
      enabled,
      priority: 1,
      reason,
      discount_percentage: config.pix.discount_percentage
    });
  }

  // 2. Regra MB WAY (Portugal apenas)
  if (isPortugal && config.mbway.enabled) {
    let enabled = true;
    let reason = '';
    
    // Regra de Valor Máximo MB WAY (limite comum de 750€ por transação)
    if (orderValue > 750) {
      enabled = false;
      reason = 'Limite MB WAY excedido (máx 750€).';
    }

    methods.push({
      id: 'mbway',
      name: 'MB WAY',
      enabled,
      priority: 1,
      reason,
      discount_percentage: config.mbway.discount_percentage
    });
  }

  // 3. Regra Cartão de Crédito (Global)
  if (config.credit_card.enabled) {
    let enabled = true;
    let reason = '';

    // Score de Risco: Bloqueia cartão se score for muito baixo (< 30)
    if (score < 30) {
      enabled = false;
      reason = 'Score de crédito insuficiente para esta modalidade.';
    }

    // Regra de Valor Mínimo de Parcela
    const minInstallment = config.credit_card.min_installment_value;
    if (orderValue < minInstallment) {
      enabled = false;
      reason = `Valor mínimo para cartão é ${minInstallment}.`;
    }

    methods.push({
      id: 'credit_card',
      name: 'Cartão de Crédito',
      enabled,
      priority: 2,
      reason
    });
  }

  // 4. Regras de Fallback e Global Settings
  if (global.manual_approval_enabled) {
    // Adicionar nota ou lógica se necessário
  }
  
  // Ordenar por prioridade
  return methods.sort((a, b) => a.priority - b.priority);
};

/**
 * Calcula o valor final com taxas ou descontos aplicados.
 */
export const calculateFinalValue = (
  methodId: string, 
  baseValue: number, 
  config: PaymentMethodsState
) => {
  if (methodId === 'pix') {
    const discount = config.pix.discount_percentage || 0;
    return baseValue * (1 - discount / 100);
  }
  
  if (methodId === 'credit_card') {
    // Se a taxa for passada ao cliente, adicionar a taxa (ex: 3.5%)
    if (config.credit_card.interest_mode === 'passed_to_client') {
      return baseValue * 1.035; 
    }
  }

  return baseValue;
};
