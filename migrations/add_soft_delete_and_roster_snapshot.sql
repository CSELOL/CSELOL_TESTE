-- Migration: Add soft delete for users and tournaments, plus roster snapshot
-- Run this migration to add all required columns

-- 1. Add deleted_at to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at timestamp without time zone DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- 2. Add deleted_at to tournaments table
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS deleted_at timestamp without time zone DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_tournaments_deleted_at ON tournaments(deleted_at);

-- 3. Add roster_snapshot to tournament_registrations table
-- This stores a snapshot of the team roster at registration time as JSONB
ALTER TABLE tournament_registrations ADD COLUMN IF NOT EXISTS roster_snapshot jsonb DEFAULT NULL;

-- Verify columns were added
SELECT 'users.deleted_at' AS column_check, 
       EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='deleted_at') AS exists
UNION ALL
SELECT 'tournaments.deleted_at', 
       EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='deleted_at')
UNION ALL
SELECT 'tournament_registrations.roster_snapshot', 
       EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='tournament_registrations' AND column_name='roster_snapshot');
