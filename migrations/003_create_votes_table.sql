CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    fingerprint TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= -3 AND score <= 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE (session_id, team_id, fingerprint)
    -- Ensure that a user can only have one entry per team per session
    -- (Can only update their own vote, not create a new one for the same team in the same session)
)