-- Add carnet column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS carnet TEXT;
