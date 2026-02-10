

export type Profile = {
  id: string;
  role: 'client' | 'admin';
  full_name: string;
  email: string | null;
  surname: string | null;
  nickname: string | null;
  phone: string | null;
  nationality: 'BR' | 'PT' | null;
  country: 'Brasil' | 'Portugal' | null;
  cpf_cnpj: string | null;
  nif: string | null;
  address: string | null;
  zip_code: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  state_distrito: string | null;
  os_number: string | null;
  avatar_url: string | null;
  payment_score: number;
  payment_settings: {
    unlocked_methods: string[];
    card_fee_enabled: boolean;
    custom_card_fee: number | null;
    default_currency: 'BRL' | 'EUR';
  };
  manual_payment_override: boolean;
  force_password_reset: boolean;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  pricing_config?: any;
  created_at: string;
};

export type Project = {
  id: string;
  client_id: string;
  service_id: string;
  project_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress_percentage: number;
  start_date: string;
  end_date: string | null;
  notes: string;
  total_value: number | null;
  payment_status: 'pending' | 'partially_paid' | 'paid' | 'cancelled';
  payment_method: 'pix' | 'cash' | 'transfer' | 'credit_card' | 'boleto' | 'installments' | 'mbway' | null;
  card_fee_included: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectStep = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  file_url: string | null;
  order_index: number;
  created_at: string;
};

export type Message = {
  id: string;
  project_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  payload?: any;
  created_at: string;
};

export type MarketingProduct = {
  id: string;
  public_code: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  status: 'active' | 'suspended' | 'draft';
  cta_label: string | null;
  cta_url: string | null;
  category: string;
  created_at: string;
  updated_at?: string;
  seo_metadata?: {
    primary_keyword?: string;
    secondary_keywords?: string[];
    target_audience?: string;
    search_intent?: string;
  };
  copy_metadata?: {
    headline?: string;
    benefits?: string[];
    pain_points?: string[];
    faq?: { question: string; answer: string }[];
  };
  technical_attributes?: Record<string, any>;
  quality_score?: number;
  market_intel?: {
    niche?: string;
    competitor_urls?: string[];
    root_keyword?: string;
  };
};

export type QuoteRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service_type: string;
  message: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  service_details: any;
  attachments: string[];
  os_number?: string;
  company_name?: string;
  region?: string;
  contact_method?: string;
  created_at: string;
};

export type Portfolio = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  project_url: string | null;
  description: string;
  is_active: boolean;
  created_at: string;
};

export type SiteVisit = {
  id: number;
  page: string;
  visit_count: number;
  last_visit: string;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  status: 'draft' | 'published';
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type ClientLogo = {
  id: string;
  name: string;
  image_url: string;
  website_url: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
};

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  enabled: boolean;
  regions: ('BR' | 'PT')[];
  status: 'active' | 'inactive' | 'error';
  config: any;
  updated_at: string;
}

export interface GlobalPaymentSettings {
  default_currency_br: 'BRL';
  default_currency_pt: 'EUR';
  payment_timeout_minutes: number;
  manual_approval_enabled: boolean;
  mode: 'test' | 'production';
  webhook_status: 'online' | 'offline';
}

export interface PaymentMethodsState {
  pix: {
    enabled: boolean;
    key_type: 'cpf' | 'cnpj' | 'email' | 'random';
    key_value: string;
    auto_qr_code: boolean;
    expiration_minutes: number;
    discount_percentage: number;
    instructions: string;
  };
  mbway: {
    enabled: boolean;
    merchant_id: string;
    api_key: string;
    api_secret: string;
    timeout_minutes: number;
    discount_percentage: number;
    webhook_url: string;
  };
  credit_card: {
    enabled: boolean;
    regions: ('BR' | 'PT')[];
    gateway: 'pagseguro' | 'stripe';
    brands: string[];
    max_installments: number;
    min_installment_value: number;
    fee_mode: 'with_fee' | 'without_fee';
    interest_mode: 'absorbed' | 'passed_to_client';
    three_d_secure: boolean;
    anti_fraud: boolean;
  };
  pagseguro: {
    enabled: boolean;
    environment: 'sandbox' | 'production';
    email: string;
    public_key: string;
    token: string;
    allowed_types: ('credit_card' | 'pix' | 'boleto')[];
  };
  picpay: {
    enabled: boolean;
    merchant_id: string;
    api_token: string;
    qr_code_support: boolean;
    cashback_info?: string;
    timeout_minutes: number;
    webhook_url: string;
  };
}

export type PlanType = 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
export type DataTrustLevel = 'High' | 'Medium' | 'Estimated';

export interface UserPlan {
  id: string;
  user_id: string;
  plan_type: PlanType;
  analyses_limit: number;
  analyses_used: number;
  features_unlocked: string[];
  next_reset_date: string;
}

export interface ApiUsageLog {
  id: string;
  user_id?: string;
  service_name: string;
  endpoint: string;
  cost_estimated: number;
  status_code: number;
  created_at: string;
}

export interface TrafficMetrics {
  visits: number;
  growth: number;
  bounce_rate: number;
  avg_duration: number;
  channels: {
    organic: number;
    paid: number;
    direct: number;
    social: number;
    referral: number;
  };
  top_countries: { country: string; percentage: number }[];
  history: { date: string; visits: number }[];
}

export interface CompetitiveInsight {
  competitor_id: string;
  domain: string;
  advantage: string;
  gap: string;
  opportunity: string;
  alert?: string;
}

export interface TrafficAnalysisReport {
  id: string;
  user_id: string;
  main_domain: string;
  competitors: string[];
  country: string;
  time_range: '7d' | '30d' | '90d' | 'custom';
  report_data: {
    main: TrafficMetrics;
    competitors: Record<string, TrafficMetrics>;
  };
  insights: {
    intelligence: CompetitiveInsight[];
    recommendations: string[];
  };
  opportunity_score: number;
  data_trust_level: DataTrustLevel;
  is_public: boolean;
  share_token?: string;
  created_at: string;
}
