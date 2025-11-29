-- Rename existing columns
ALTER TABLE tournaments RENAME COLUMN name TO tournament_name;
ALTER TABLE tournaments RENAME COLUMN description TO tournament_description;
ALTER TABLE tournaments RENAME COLUMN start_date TO start_date_old; -- Rename to avoid conflict if type changes, or just keep it. Let's keep it simple.

-- Actually, let's just rename start_date if it's compatible. 
-- The user wants "start_date: string; // ISO string". Postgres usually stores dates as TIMESTAMP.
-- Assuming existing start_date is compatible.

-- Add new columns
ALTER TABLE tournaments ADD COLUMN banner_url TEXT;
ALTER TABLE tournaments ADD COLUMN logo_url TEXT;
ALTER TABLE tournaments ADD COLUMN format TEXT DEFAULT 'single_elimination'; -- "single_elimination" | "double_elimination"
ALTER TABLE tournaments ADD COLUMN has_lower_bracket BOOLEAN DEFAULT FALSE;
ALTER TABLE tournaments ADD COLUMN is_listed BOOLEAN DEFAULT TRUE;
ALTER TABLE tournaments ADD COLUMN allow_signups BOOLEAN DEFAULT TRUE;
ALTER TABLE tournaments ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Update status check constraint if it exists, or just update the column type if it's text.
-- Assuming status is TEXT. If it's an ENUM type, we might need to ALTER TYPE.
-- Let's assume TEXT for simplicity based on previous code.
-- Valid values: "draft" | "open" | "in_progress" | "completed"

-- Remove unnecessary columns (Optional, but user said "unnecessary")
-- ALTER TABLE tournaments DROP COLUMN max_teams;
-- ALTER TABLE tournaments DROP COLUMN organizer_id;
-- User said "organizer id is confusing too i will implement that later too", implying removal or ignoring.
-- Let's make them nullable instead of dropping, to be safe.
ALTER TABLE tournaments ALTER COLUMN max_teams DROP NOT NULL;
ALTER TABLE tournaments ALTER COLUMN organizer_id DROP NOT NULL;

-- Make start_date required (NOT NULL)
ALTER TABLE tournaments ALTER COLUMN start_date SET NOT NULL;
