-- Ensure only one session can be IN_PROGRESS at a time.
-- When a session is updated to IN_PROGRESS, complete any other active sessions.
CREATE TRIGGER IF NOT EXISTS complete_other_in_progress_sessions
AFTER UPDATE OF status ON sessions
WHEN NEW.status = 'IN_PROGRESS'
BEGIN
    UPDATE sessions
    SET status = 'COMPLETED',
        updated_at = CURRENT_TIMESTAMP
    WHERE status = 'IN_PROGRESS'
      AND id != NEW.id;
END;
