export type BugStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "READY_FOR_QA"
  | "REOPENED"
  | "CLOSED";

export type UserRole =
  | "ADMIN"
  | "QA"
  | "DEVELOPER";

interface TransitionRule {
  nextStatus: BugStatus;
  allowedRoles: UserRole[];
}

const transitions: Record<BugStatus, TransitionRule[]> = {
  OPEN: [
    {
      nextStatus: "IN_PROGRESS",
      allowedRoles: ["DEVELOPER"]
    }
  ],

  IN_PROGRESS: [
    {
      nextStatus: "READY_FOR_QA",
      allowedRoles: ["DEVELOPER"]
    }
  ],

  READY_FOR_QA: [
    {
      nextStatus: "CLOSED",
      allowedRoles: ["QA", "ADMIN"]
    },
    {
      nextStatus: "REOPENED",
      allowedRoles: ["QA", "ADMIN"]
    }
  ],

  REOPENED: [
    {
      nextStatus: "IN_PROGRESS",
      allowedRoles: ["DEVELOPER"]
    }
  ],

  CLOSED: []
};

export function canTransition(
  currentStatus: BugStatus,
  nextStatus: BugStatus,
  role: UserRole
): boolean {

  const allowedTransitions = transitions[currentStatus];

  if (!allowedTransitions) {
    return false;
  }

  return allowedTransitions.some(
    transition =>
      transition.nextStatus === nextStatus &&
      transition.allowedRoles.includes(role)
  );
}