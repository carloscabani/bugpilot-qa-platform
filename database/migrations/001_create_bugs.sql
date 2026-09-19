CREATE TABLE bugs (

    id SERIAL PRIMARY KEY,

    project_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    severity VARCHAR(20) NOT NULL
        DEFAULT 'MEDIUM',

    priority VARCHAR(20) NOT NULL
        DEFAULT 'MEDIUM',

    status VARCHAR(30) NOT NULL
        DEFAULT 'OPEN',

    reported_by INTEGER NOT NULL,

    assigned_to INTEGER,

    environment TEXT,

    steps_to_reproduce TEXT,

    expected_result TEXT,

    actual_result TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bug_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_bug_reporter
        FOREIGN KEY (reported_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_bug_assignee
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT check_bug_severity
        CHECK (
            severity IN (
                'LOW',
                'MEDIUM',
                'HIGH',
                'CRITICAL'
            )
        ),

    CONSTRAINT check_bug_priority
        CHECK (
            priority IN (
                'LOW',
                'MEDIUM',
                'HIGH',
                'URGENT'
            )
        ),

    CONSTRAINT check_bug_status
        CHECK (
            status IN (
                'OPEN',
                'IN_PROGRESS',
                'READY_FOR_QA',
                'REOPENED',
                'CLOSED'
            )
        )

);


CREATE INDEX idx_bugs_project
ON bugs(project_id);


CREATE INDEX idx_bugs_assigned_to
ON bugs(assigned_to);


CREATE INDEX idx_bugs_status
ON bugs(status);