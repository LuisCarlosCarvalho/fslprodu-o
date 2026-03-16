-- Create seo_logs table for Semantic Purge Telemetry
CREATE TABLE IF NOT EXISTS seo_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE seo_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the Cloudflare Worker)
CREATE POLICY "Enable insert for anon" ON seo_logs FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated reads (for the Admin Dashboard)
CREATE POLICY "Enable read for authenticated" ON seo_logs FOR SELECT TO authenticated USING (true);
