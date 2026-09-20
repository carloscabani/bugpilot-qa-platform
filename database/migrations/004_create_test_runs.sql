CREATE TABLE test_runs (

    id SERIAL PRIMARY KEY,

    test_case_id INTEGER NOT NULL,

    executed_by INTEGER NOT NULL,

    status VARCHAR(20) NOT NULL,

    environment TEXT,

    actual_result TEXT,

    notes TEXT,

    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_test_run_case
        FOREIGN KEY (test_case_id)
        REFERENCES test_cases(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_test_run_executor
        FOREIGN KEY (executed_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT check_test_run_status
        CHECK (
            status IN (
                'PASS',
                'FAIL',
                'BLOCKED'
            )
        )
);

CREATE INDEX idx_test_runs_case
ON test_runs(test_case_id);