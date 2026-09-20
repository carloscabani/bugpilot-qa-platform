export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  creator_name: string;
  created_at: string;
}

export interface Bug {
  id: number;
  project_id: number;
  title: string;
  severity: string;
  priority: string;
  status: string;
  assigned_to: number | null;
}

export interface TestCase {
  id: number;
  project_id: number;
  bug_id: number | null;
  title: string;
  test_type: string;
}

export interface TestRun {
  id: number;
  test_case_id: number;
  status: "PASS" | "FAIL" | "BLOCKED";
}