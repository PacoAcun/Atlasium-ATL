-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  wallet_address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create event_members table
CREATE TABLE IF NOT EXISTS event_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'staff')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Add address columns to transactions table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'to_address') THEN
        ALTER TABLE transactions ADD COLUMN to_address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'from_address') THEN
        ALTER TABLE transactions ADD COLUMN from_address TEXT;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Members can view events" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_members
      WHERE event_members.event_id = events.id
      AND event_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update events" ON events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM event_members
      WHERE event_members.event_id = events.id
      AND event_members.user_id = auth.uid()
      AND event_members.role = 'admin'
    )
  );

-- RLS Policies for event_members
CREATE POLICY "Members can view members" ON event_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_members em
      WHERE em.event_id = event_members.event_id
      AND em.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members" ON event_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM event_members em
      WHERE em.event_id = event_members.event_id
      AND em.user_id = auth.uid()
      AND em.role = 'admin'
    )
  );
