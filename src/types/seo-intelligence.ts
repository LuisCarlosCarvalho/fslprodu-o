export interface SEODomain {
  id: string;
  domain: string;
  project_name?: string;
  is_competitor: boolean;
  main_competitor_of?: string;
  sector?: string;
  target_countries: string[];
  created_at: string;
}

export interface SEOMetrics {
  id: string;
  domain_id: string;
  date: string;
  estimated_monthly_traffic: number;
  traffic_growth_percentage: number;
  global_rank: number;
  country_rank: number;
  industry_rank: number;
  avg_visit_duration: number;
  bounce_rate: number;
  pages_per_visit: number;
  domain_authority: number;
  backlinks_count: number;
  source_provider: string;
}

export interface SEOChannelData {
  id: string;
  metric_id: string;
  channel_name: string;
  traffic_share: number;
  traffic_volume: number;
}

export interface SEOCountryData {
  id: string;
  metric_id: string;
  country_code: string;
  traffic_share: number;
  traffic_volume: number;
}

export interface SEOProviderStats {
  cost: number;
  requests: number;
  errors: number;
}
