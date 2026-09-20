CREATE TABLE test_cases (

    id SERIAL PRIMARY KEY,

    project_id INTEGER NOT NULL,

    bug_id INTEGER,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    preconditions TEXT,

    steps TEXT NOT NULL,

    expected_result TEXT NOT NULL,

    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',

    test_type VARCHAR(20) NOT NULL DEFAULT 'MANUAL',

    created_by INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_test_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_test_bug
        FOREIGN KEY (bug_id)
        REFERENCES bugs(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_test_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT check_test_priority
        CHECK (
            priority IN (
                'LOW',
                'MEDIUM',
                'HIGH',
                'URGENT'
            )
        ),

    CONSTRAINT check_test_type
        CHECK (
            test_type IN (
                'MANUAL',
                'AUTOMATED'
            )
        )

);

CREATE INDEX idx_test_cases_project
ON test_cases(project_id);

CREATE INDEX idx_test_cases_bug
ON test_cases(bug_id);