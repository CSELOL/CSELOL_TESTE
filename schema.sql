-- Database Schema Dump (Updated to match Production/Screenshot)

DROP TABLE IF EXISTS brackets CASCADE;
CREATE TABLE brackets (
  id integer NOT NULL DEFAULT nextval('brackets_id_seq'::regclass),
  tournament_id integer,
  stage_id integer,
  name text,
  config jsonb,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS match_players CASCADE;
CREATE TABLE match_players (
  id integer NOT NULL DEFAULT nextval('match_players_id_seq'::regclass),
  match_id integer,
  player_id integer,
  team_id integer,
  stats jsonb,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS matches CASCADE;
CREATE TABLE matches (
  id integer NOT NULL DEFAULT nextval('matches_id_seq'::regclass),
  bracket_id integer,
  stage_id integer,
  tournament_id integer,
  round integer DEFAULT 0,
  match_index integer DEFAULT 0,
  team_a_id integer,
  team_b_id integer,
  score_a integer DEFAULT 0,
  score_b integer DEFAULT 0,
  status text DEFAULT 'scheduled'::text,
  -- scheduled_at removed as it does not exist in DB
  best_of integer DEFAULT 3,
  metadata jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  winner_id integer,
  next_match_id integer,
  stage_id integer,
  stage text,
  group_name text,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS tournament_registrations CASCADE;
CREATE TABLE tournament_registrations (
  id integer NOT NULL DEFAULT nextval('participants_id_seq'::regclass), -- Sequence might be named differently but keeping for now
  tournament_id integer,
  team_id integer,
  payment_proof_url text,
  status text DEFAULT 'pending',
  rejection_reason text, -- Added for rejection feedback
  registered_at timestamp without time zone DEFAULT now(),
  approved boolean DEFAULT false, -- Keeping for compatibility if mixed usage, but status covers it
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS players CASCADE;
CREATE TABLE players (
  id integer NOT NULL DEFAULT nextval('players_id_seq'::regclass),
  user_id integer,
  nickname text NOT NULL,
  ingame_name text,
  team_id integer,
  avatar_url text,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS stages CASCADE;
CREATE TABLE stages (
  id integer NOT NULL DEFAULT nextval('stages_id_seq'::regclass),
  tournament_id integer,
  name text NOT NULL,
  type text NOT NULL,
  order_index integer DEFAULT 0,
  config jsonb,
  created_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS tournament_standings CASCADE;
CREATE TABLE tournament_standings (
  id integer NOT NULL DEFAULT nextval('standings_id_seq'::regclass),
  tournament_id integer,
  stage_id integer,
  team_id integer,
  group_name text,
  played integer DEFAULT 0,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  draws integer DEFAULT 0,
  points integer DEFAULT 0,
  round_robin_order integer DEFAULT 0,
  score_diff integer DEFAULT 0,
  tie_breaker jsonb,
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS teams CASCADE;
CREATE TABLE teams (
  id integer NOT NULL DEFAULT nextval('teams_id_seq'::regclass),
  name text NOT NULL,
  tag text,
  logo_url text,
  created_by_user_id integer, -- Keeping for history
  captain_id text, -- Added based on recent refactor
  invite_code text, -- Added based on recent refactor
  description text,
  social_media jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS tournaments CASCADE;
CREATE TABLE tournaments (
  id integer NOT NULL DEFAULT nextval('tournaments_id_seq'::regclass),
  slug text,
  tournament_name text NOT NULL,
  tournament_description text,
  organizer_id integer,
  start_date timestamp without time zone,
  status text DEFAULT 'draft'::text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  banner_url text,
  logo_url text,
  format text DEFAULT 'single_elimination'::text,
  has_lower_bracket boolean DEFAULT false,
  is_listed boolean DEFAULT true,
  allow_signups boolean DEFAULT true,
  is_archived boolean NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  supabase_id text,
  username text,
  email text,
  full_name text,
  nickname text,
  avatar_url text,
  riot_id text,
  primary_role text,
  secondary_role text,
  team_id integer,
  team_role text,
  roster_status text,
  phone_number text,
  is_onboarded boolean DEFAULT false,
  role text DEFAULT 'user'::text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  PRIMARY KEY (id)
);
