/**
 * WorkNest Firestore Security Rules Adversarial Test Suite
 * Verifies that all "Dirty Dozen" payloads in security_spec.md are rejected with PERMISSION_DENIED.
 */

export interface AdversarialTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expectedOutcome: 'PERMISSION_DENIED';
  invariantTested: string;
}

export const DIRTY_DOZEN_TESTS: AdversarialTestCase[] = [
  {
    id: 1,
    name: 'Reject self-privilege escalation to HR role on profile creation',
    collectionPath: '/profiles/user_attacker',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Pillar 4 Tiered Identity & Self-Assigned Role Prevention',
  },
  {
    id: 2,
    name: 'Reject spoofed admin email when email_verified is false',
    collectionPath: '/departments/dept_hacked',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Verified Users & Email Spoofing Guard',
  },
  {
    id: 3,
    name: 'Reject cross-employee read on isolated /profile_private/{userId}',
    collectionPath: '/profile_private/victim_uid',
    operation: 'get',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Pillar 6 PII Isolation Split Collection Strategy',
  },
  {
    id: 4,
    name: 'Reject shadow field injection on leave_requests update',
    collectionPath: '/leave_requests/req_101',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Pillar 2 Anti-Update-Gap & affectedKeys().hasOnly()',
  },
  {
    id: 5,
    name: 'Reject manager self-approval of own leave request',
    collectionPath: '/leave_requests/req_self',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Self-Approval Prohibition (existing().employeeUid != request.auth.uid)',
  },
  {
    id: 6,
    name: 'Reject non-admin state mutation after terminal status on leave_requests',
    collectionPath: '/leave_requests/req_closed',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Phase 4 #6 Terminal State Locking',
  },
  {
    id: 7,
    name: 'Reject document creation with poisoned ID characters',
    collectionPath: '/attendance_records/bad$id!with*illegal#chars',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Pillar 3 Path Variable Hardening isValidId()',
  },
  {
    id: 8,
    name: 'Reject forged client timestamps on attendance creation',
    collectionPath: '/attendance_records/att_emp1_20261011',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Phase 4 #13 Temporal Integrity (request.time)',
  },
  {
    id: 9,
    name: 'Reject unauthorized quota increase by employee on leave_balances',
    collectionPath: '/leave_balances/bal_emp_1',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Pillar 4 Tiered Identity & Action-Based Update',
  },
  {
    id: 10,
    name: 'Reject orphaned workplace_request when employee profile does not exist',
    collectionPath: '/workplace_requests/wpr_orphan',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Phase 4 #11 Global Consistency Invariant exists()',
  },
  {
    id: 11,
    name: 'Reject blanket list query without resource.data ownership filter',
    collectionPath: '/attendance_records',
    operation: 'list',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Pillar 8 Secure List Queries (The Query Enforcer)',
  },
  {
    id: 12,
    name: 'Reject mutation of immutable employeeUid field on workplace_requests',
    collectionPath: '/workplace_requests/wpr_101',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    invariantTested: 'Phase 4 #12 The Immortal Field Rule',
  },
];
