# Security Policy & Governance — VendorHub™

## Security Architecture & Defenses
VendorHub enforces defense-in-depth principles across all platform layers:
1. **Cloud Firestore Security Rules (`firestore.rules`)**: Granular role-based access control (RBAC) ensuring users only access authorized collections and documents.
2. **Cryptographic Credential Protection**: User credentials utilize salted SHA-256 one-way hashing; cleartext passwords are never stored.
3. **Mass Assignment Prevention**: Registration endpoints strictly limit selectable roles to `buyer` and `seller`.
4. **Authoritative Order Validation**: Order totals are verified against authoritative database item prices, preventing cart tampering.
5. **Context-Aware Output Sanitization**: All user-supplied fields are HTML-escaped before DOM rendering to eliminate XSS.
6. **Caller Authorization Gates**: Product mutations, stock adjustments, and order state transitions verify ownership or administrative privileges.

## Supported Versions
| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability
If you discover a security vulnerability or weakness within this repository:
1. Do **not** open a public issue.
2. Report the vulnerability privately to [Amey Dongre](https://github.com/ameydongre10) via GitHub Security Advisories or direct communication.
3. Provide a clear, actionable description of the issue, affected endpoints, and minimal reproduction steps.
4. Security reports will be reviewed promptly with coordinated disclosure and remediation.
