-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    summoner_name VARCHAR(255),
    role VARCHAR(50), -- TOP, JUNGLE, MID, ADC, SUPPORT
    team_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tag VARCHAR(10) NOT NULL,
    logo_url TEXT,
    captain_id INTEGER REFERENCES players(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key to players table (after teams table is created)
ALTER TABLE players 
ADD CONSTRAINT fk_team 
FOREIGN KEY (team_id) 
REFERENCES teams(id) 
ON DELETE SET NULL;
