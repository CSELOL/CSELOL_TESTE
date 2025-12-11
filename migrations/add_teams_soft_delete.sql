-- Migration: Add soft delete support for teams
-- Run this migration to add the deleted_at column

-- Add deleted_at column (nullable timestamp)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS deleted_at timestamp without time zone DEFAULT NULL;

-- Create index for efficient filtering of active teams
CREATE INDEX IF NOT EXISTS idx_teams_deleted_at ON teams(deleted_at);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teams' AND column_name = 'deleted_at';
