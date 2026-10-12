# WorkNest Security Specification (Payload-First Security TDD)

## 1. Data Invariants & Master Source of Truth

1. **Identity & Privilege Isolation**:
   - No user may self-assign `Manager` or `HR` roles during registration (`/profiles/{profileId}`). Public self-registration strictly enforces `role == 'Employee'` and `ownerUid == request.auth.uid`, unless the actor is an authenticated `isAdmin()`.
   - Admin status (`isAdmin()`) is strictly verified against either the bootstrapped admin (`request.auth.token.email == '25r21a67b9@mlrit.ac.in' && request.auth.token.email_verified == true`) or the existence of `/admins/$(request.auth.uid)`.
2. **PII Split-Collection Isolation**:
   - Personal contact information (`email`, `contactNumber`, `emergencyContact`, `address`) is isolated inside `/profile_private/{userId}` and can only be read (`get`/`list`) or updated by `request.auth.uid == userId`, `resource.data.ownerUid == request.auth.uid`, or `isAdmin()`.
3. **Reporting Hierarchy & Relational Integrity**:
   - Every `leave_requests`, `workplace_requests`, `attendance_records`, and `leave_balances` document must reference an existing `/profiles/$(incoming().employeeUid)` document on creation.
   - Managers cannot approve their own leave or workplace requests (`existing().employeeUid != request.auth.uid`), unless the actor is `isAdmin()`.
4. **Terminal State Locking**:
   - Once a `leave_requests` document reaches `'Approved'`, `'Rejected'`, or `'Cancelled'`, or a `workplace_requests` document reaches `'Approved'`, `'Rejected'`, or `'Resolved'`, non-admin users are locked out from further state mutations.
5. **Temporal Integrity & Immortal Fields**:
   - Every `create` operation requires `incoming().createdAt == request.time && incoming().updatedAt == request.time`.
   - Every `update` operation requires `incoming().updatedAt == request.time` and preserves immutable fields (`createdAt`, `employeeUid`, `ownerUid`).
6. **Zero Blanket List Queries & Cost-Optimization**:
   - Every `allow list` rule evaluates `resource.data` directly without invoking `get()` or `exists()`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

### Payload 1: Self-Privilege Escalation on Registration (Identity Spoofing)
```json
{
  "collection": "/profiles/user_attacker",
  "auth": { "uid": "user_attacker", "email": "attacker@example.com", "email_verified": true },
  "operation": "create",
  "payload": {
    "uid": "user_attacker",
    "ownerUid": "user_attacker",
    "hrUid": "user_attacker",
    "fullName": "Mallory Attacker",
    "employeeId": "EMP-9999",
    "departmentId": "dept_eng",
    "departmentName": "Engineering",
    "designation": "Fake HR Director",
    "role": "HR",
    "status": "Active",
    "managerUid": "unassigned",
    "managerName": "Unassigned",
    "joiningDate": "2026-10-11",
    "avatarInitials": "MA"
  }
}
```

### Payload 2: Unverified Admin Email Spoof Attack
```json
{
  "collection": "/departments/dept_hacked",
  "auth": { "uid": "spoof_uid", "email": "25r21a67b9@mlrit.ac.in", "email_verified": false },
  "operation": "create",
  "payload": {
    "id": "dept_hacked",
    "name": "Shadow Dept",
    "code": "SHDW",
    "description": "Unauthorized creation with unverified admin email",
    "headUid": "spoof_uid",
    "headName": "Spoofer",
    "status": "Active",
    "visibility": "organization",
    "createdByUid": "spoof_uid"
  }
}
```

### Payload 3: Cross-Employee PII Scraping (`/profile_private`)
```json
{
  "collection": "/profile_private/victim_uid",
  "auth": { "uid": "curious_colleague", "email": "colleague@example.com", "email_verified": true },
  "operation": "get"
}
```

### Payload 4: Shadow Field Injection on Leave Request Update
```json
{
  "collection": "/leave_requests/req_101",
  "auth": { "uid": "emp_1", "email": "emp1@example.com", "email_verified": true },
  "operation": "update",
  "payload": {
    "status": "Cancelled",
    "isBypassed": true,
    "updatedAt": "SERVER_TIMESTAMP"
  }
}
```

### Payload 5: Self-Approval of Leave Application by Employee/Manager
```json
{
  "collection": "/leave_requests/req_self",
  "auth": { "uid": "mgr_1", "email": "mgr1@example.com", "email_verified": true },
  "operation": "update",
  "existing": { "employeeUid": "mgr_1", "managerUid": "mgr_1", "status": "Pending" },
  "payload": {
    "status": "Approved",
    "reviewerUid": "mgr_1",
    "reviewerName": "Self Manager",
    "reviewerRemarks": "Approved my own leave",
    "reviewedAt": "2026-10-11T10:00:00Z",
    "balanceDeducted": true,
    "updatedAt": "SERVER_TIMESTAMP"
  }
}
```

### Payload 6: Terminal State Mutation (Re-opening Rejected Leave Request)
```json
{
  "collection": "/leave_requests/req_closed",
  "auth": { "uid": "mgr_1", "email": "mgr1@example.com", "email_verified": true },
  "operation": "update",
  "existing": { "employeeUid": "emp_1", "managerUid": "mgr_1", "status": "Rejected" },
  "payload": {
    "status": "Approved",
    "reviewerUid": "mgr_1",
    "reviewerName": "Manager One",
    "reviewerRemarks": "Changed after terminal state",
    "reviewedAt": "2026-10-11T11:00:00Z",
    "balanceDeducted": true,
    "updatedAt": "SERVER_TIMESTAMP"
  }
}
```

### Payload 7: ID Poisoning / Resource Exhaustion (>128 chars or invalid regex)
```json
{
  "collection": "/attendance_records/bad$id!with*illegal#chars",
  "auth": { "uid": "emp_1", "email": "emp1@example.com", "email_verified": true },
  "operation": "create",
  "payload": {
    "id": "bad$id!with*illegal#chars",
    "employeeUid": "emp_1"
  }
}
```

### Payload 8: Forged Client Timestamp (Temporal Integrity Violation)
```json
{
  "collection": "/attendance_records/att_emp1_20261011",
  "auth": { "uid": "emp_1", "email": "emp1@example.com", "email_verified": true },
  "operation": "create",
  "payload": {
    "id": "att_emp1_20261011",
    "employeeUid": "emp_1",
    "createdAt": "2020-01-01T00:00:00Z",
    "updatedAt": "2020-01-01T00:00:00Z"
  }
}
```

### Payload 9: Unauthorized Leave Balance Tampering by Employee
```json
{
  "collection": "/leave_balances/bal_emp_1",
  "auth": { "uid": "emp_1", "email": "emp1@example.com", "email_verified": true },
  "operation": "update",
  "payload": {
    "casualTotal": 99,
    "casualUsed": 0,
    "updatedAt": "SERVER_TIMESTAMP"
  }
}
```

### Payload 10: Orphaned Workplace Request Creation (Non-existent Employee Profile)
```json
{
  "collection": "/workplace_requests/wpr_orphan",
  "auth": { "uid": "ghost_uid", "email": "ghost@example.com", "email_verified": true },
  "operation": "create",
  "payload": {
    "id": "wpr_orphan",
    "employeeUid": "ghost_uid",
    "employeeId": "EMP-0000",
    "employeeName": "Ghost User",
    "departmentName": "Engineering",
    "managerUid": "mgr_1",
    "managerName": "Manager One",
    "hrUid": "hr_1",
    "category": "IT Support",
    "title": "Need laptop",
    "description": "No profile exists for ghost_uid",
    "targetDate": "2026-10-12",
    "priority": "Medium",
    "status": "Submitted",
    "assignedToRole": "IT Support",
    "reviewerUid": "",
    "reviewerName": "",
    "remarks": "",
    "resolvedAt": ""
  }
}
```

### Payload 11: Unconstrained Blanket List Scraping on Attendance Records
```json
{
  "collection": "/attendance_records",
  "auth": { "uid": "emp_1", "email": "emp1@example.com", "email_verified": true },
  "operation": "list",
  "query": "SELECT * FROM attendance_records (no employeeUid filter)"
}
```

### Payload 12: Immutable Field Tampering (`employeeUid` changed during update)
```json
{
  "collection": "/workplace_requests/wpr_101",
  "auth": { "uid": "mgr_1", "email": "mgr1@example.com", "email_verified": true },
  "operation": "update",
  "existing": { "employeeUid": "emp_1", "managerUid": "mgr_1", "status": "Submitted" },
  "payload": {
    "employeeUid": "emp_2",
    "status": "Approved",
    "updatedAt": "SERVER_TIMESTAMP"
  }
}
```
