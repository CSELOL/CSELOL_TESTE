-- Add description and social_media columns to teams table
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS social_media JSONB;
