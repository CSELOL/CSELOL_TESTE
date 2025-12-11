-- Migration: Create activity_logs table for system-wide audit logging
-- Run this migration to add the activity logs table

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  
  -- What happened
  action TEXT NOT NULL,              -- e.g., 'team.create', 'tournament.register', 'match.update_score'
  
  -- Who did it
  actor_id TEXT,                     -- supabase_id of user who performed action (NULL for system actions)
  actor_nickname TEXT,               -- Denormalized for quick display
  actor_role TEXT,                   -- 'user', 'admin', 'organizer', 'system'
  
  -- What was affected
  target_type TEXT,                  -- 'team', 'tournament', 'match', 'user', 'registration'
  target_id INTEGER,                 -- ID of the affected entity
  target_name TEXT,                  -- Denormalized name for quick display
  
  -- Context
  metadata JSONB DEFAULT '{}',       -- Additional context (old/new values, reason, etc.)
  ip_address TEXT,                   -- Client IP for security auditing
  user_agent TEXT,                   -- Browser/client info
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_type ON activity_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_id ON activity_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Composite index for common admin queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_type_created ON activity_logs(target_type, created_at DESC);

-- Verify table was created
SELECT 'activity_logs table created successfully' AS status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs');
