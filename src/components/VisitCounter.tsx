import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function VisitCounter() {
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const { error } = await supabase.rpc('increment_visit_count', {
          page_name: 'home'
        });

        if (error) {
          // Silent log for public noise reduction
          return; 
        }

        const { data, error: fetchError } = await supabase
          .from('site_visits')
          .select('visit_count')
          .eq('page', 'home')
          .maybeSingle();

        if (fetchError) return; // Silent
        else if (data) {
          setVisitCount(data.visit_count);
        }
        if (error) return; // Silent for noise reduction
      } catch (error) {
        console.error('Error tracking visit:', error);
      } finally {
        setLoading(false);
      }
    };

    trackVisit();
  }, []);

  if (loading || visitCount === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Eye className="w-4 h-4" />
      <span>{visitCount.toLocaleString('pt-BR')} visitas</span>
    </div>
  );
}
