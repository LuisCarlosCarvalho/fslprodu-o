-- Create the storage bucket 'quotes' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotes', 'quotes', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (it should be on by default, but good to ensure)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public access to view files (SELECT)
DROP POLICY IF EXISTS "Public Access to Quotes" ON storage.objects;
CREATE POLICY "Public Access to Quotes"
ON storage.objects FOR SELECT
USING ( bucket_id = 'quotes' );

-- Allow public access to upload files (INSERT)
DROP POLICY IF EXISTS "Public Upload to Quotes" ON storage.objects;
CREATE POLICY "Public Upload to Quotes"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'quotes' );

-- Allow public access to update files (UPDATE) - optional but useful for retries or overwrites if names clash (though we use random names)
DROP POLICY IF EXISTS "Public Update to Quotes" ON storage.objects;
CREATE POLICY "Public Update to Quotes"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'quotes' );
