-- Add start_time and end_time to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

-- Create static_qrs table
CREATE TABLE IF NOT EXISTS static_qrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for static_qrs (allow read by everyone, write by event members)
ALTER TABLE static_qrs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for static_qrs" ON static_qrs
    FOR SELECT USING (true);

CREATE POLICY "Event members can create static_qrs" ON static_qrs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM event_members
            WHERE event_members.event_id = static_qrs.event_id
            AND event_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Event members can delete static_qrs" ON static_qrs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM event_members
            WHERE event_members.event_id = static_qrs.event_id
            AND event_members.user_id = auth.uid()
        )
    );
