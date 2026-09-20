import api from "./api";

import type {
  Project,
  Bug,
  TestCase,
  TestRun
} from "../types";

export interface DashboardStats {
  totalProjects: number;
  totalBugs: number;
  openBugs: number;
  criticalBugs: number;
  totalTestCases: number;
  totalTestRuns: number;
  passedTests: number;
  failedTests: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {

  const [
    projectsResponse,
    bugsResponse,
    testCasesResponse,
    testRunsResponse
  ] = await Promise.all([

    api.get<{ projects: Project[] }>("/projects"),

    api.get<{ bugs: Bug[] }>("/bugs"),

    api.get<{ test_cases: TestCase[] }>("/test-cases"),

    api.get<{ test_runs: TestRun[] }>("/test-runs")

  ]);

  const projects = projectsResponse.data.projects;

  const bugs = bugsResponse.data.bugs;

  const testCases = testCasesResponse.data.test_cases;

  const testRuns = testRunsResponse.data.test_runs;

  return {

    totalProjects: projects.length,

    totalBugs: bugs.length,

    openBugs: bugs.filter(
      bug => bug.status === "OPEN"
    ).length,

    criticalBugs: bugs.filter(
      bug => bug.severity === "CRITICAL"
    ).length,

    totalTestCases: testCases.length,

    totalTestRuns: testRuns.length,

    passedTests: testRuns.filter(
      run => run.status === "PASS"
    ).length,

    failedTests: testRuns.filter(
      run => run.status === "FAIL"
    ).length

  };

}