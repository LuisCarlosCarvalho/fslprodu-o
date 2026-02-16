import { SEOMetrics, SEOChannelData, SEOCountryData } from '../../types/seo-intelligence';

export interface SEODataProvider {
  name: string;
  
  /**
   * Fetches traffic and ranking data for a domain
   */
  getDomainMetrics(domain: string, country: string): Promise<Partial<SEOMetrics>>;
  
  /**
   * Fetches traffic distribution by channel
   */
  getChannelDistribution(domain: string, country: string): Promise<Partial<SEOChannelData>[]>;
  
  /**
   * Fetches traffic distribution by country
   */
  getTopCountries(domain: string): Promise<Partial<SEOCountryData>[]>;
  
  /**
   * Validates if the API key is active/valid
   */
  validateApiKey(key: string): Promise<boolean>;
}
