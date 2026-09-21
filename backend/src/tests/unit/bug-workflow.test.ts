import {
  describe,
  expect,
  it
} from "vitest";

import {
  canTransition
} from "../../services/bug-workflow.service";


describe("Bug Workflow", () => {

  it("allows a developer to start working on a bug", () => {

    const result = canTransition(
      "OPEN",
      "IN_PROGRESS",
      "DEVELOPER"
    );

    expect(result).toBe(true);

  });


  it("prevents QA from starting development", () => {

    const result = canTransition(
      "OPEN",
      "IN_PROGRESS",
      "QA"
    );

    expect(result).toBe(false);

  });


  it("allows a developer to send a bug to QA", () => {

    const result = canTransition(
      "IN_PROGRESS",
      "READY_FOR_QA",
      "DEVELOPER"
    );

    expect(result).toBe(true);

  });


  it("allows QA to close a validated bug", () => {

    const result = canTransition(
      "READY_FOR_QA",
      "CLOSED",
      "QA"
    );

    expect(result).toBe(true);

  });


  it("allows QA to reopen a bug", () => {

    const result = canTransition(
      "READY_FOR_QA",
      "REOPENED",
      "QA"
    );

    expect(result).toBe(true);

  });


  it("prevents a developer from closing a bug", () => {

    const result = canTransition(
      "READY_FOR_QA",
      "CLOSED",
      "DEVELOPER"
    );

    expect(result).toBe(false);

  });


  it("prevents changes to closed bugs", () => {

    const result = canTransition(
      "CLOSED",
      "IN_PROGRESS",
      "DEVELOPER"
    );

    expect(result).toBe(false);

  });


  it("allows a developer to resume a reopened bug", () => {

    const result = canTransition(
      "REOPENED",
      "IN_PROGRESS",
      "DEVELOPER"
    );

    expect(result).toBe(true);

  });

});