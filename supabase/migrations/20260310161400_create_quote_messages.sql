-- Create quote_messages table
CREATE TABLE IF NOT EXISTS quote_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  sender_name text NOT NULL,
  message text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'email', 'direct')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quote_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage all quote messages"
  ON quote_messages FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Leads can view their own messages"
  ON quote_messages FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quote_requests
      WHERE quote_requests.id = quote_messages.quote_id
      AND (
        -- If authenticated, check if email matches
        (auth.uid() IS NOT NULL AND quote_requests.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        OR
        -- This part is tricky for anonymous users, 
        -- but usually we'd only show this in the dashboard after they login/verify.
        -- For now, let's keep it secure for logged-in users.
        false
      )
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quote_messages_quote_id ON quote_messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_messages_created_at ON quote_messages(created_at DESC);
