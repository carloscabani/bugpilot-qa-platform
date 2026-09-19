CREATE TABLE bug_history (
    id SERIAL PRIMARY KEY,

    bug_id INTEGER NOT NULL,

    changed_by INTEGER NOT NULL,

    old_status VARCHAR(30),

    new_status VARCHAR(30) NOT NULL,

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_bug
        FOREIGN KEY (bug_id)
        REFERENCES bugs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_bug_history_bug
ON bug_history(bug_id);