# Security Policy

## Reporting a vulnerability

The Tooark web-components maintainers take security seriously — these packages
render inside other people's applications, with access to whatever the page has.
If you believe you have found a security vulnerability in any `@tooark/*`
package (the Custom Elements, the framework wrappers, the core helpers, the
shipped CSS), in the build scripts, or in the CI workflows of this repository,
please report it **privately** so we can address it before public disclosure.

### How to report

**Do NOT** open a public GitHub issue for security vulnerabilities.

Instead, use one of the following channels:

1. **Preferred** — GitHub Security Advisories:
   [Report a vulnerability](https://github.com/Tooark/web-components/security/advisories/new)
2. **Email** — `security@tooark.com` (PGP key available on request)

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce (a minimal page or a StackBlitz link is ideal)
- The affected package(s) and version(s) (e.g. `@tooark/web-components@1.0.0`)
- The environment (browser, framework wrapper, bundler) where you observed it
- Your name / handle for credit (optional)

### What to expect

| Milestone                            | Target time                                             |
| ------------------------------------ | ------------------------------------------------------- |
| Acknowledgment of report             | Within **72 hours**                                     |
| Initial triage & severity assessment | Within **5 business days**                              |
| Fix and coordinated disclosure plan  | Within **30 days** (may be extended for complex issues) |
| Public advisory (if applicable)      | After a fixed release is published                      |

We follow the principles of
[Coordinated Vulnerability Disclosure (CVD)](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure).

## Supported versions

All `@tooark/*` packages are versioned and released together (one version for
the whole family). Only the **latest published minor** receives security fixes;
older versions remain on npm for reproducibility but are not patched.

Always update to the latest version before reporting a bug or vulnerability.

## Scope

In scope:

- Cross-site scripting or HTML injection through component attributes,
  properties, slots or `locale-json` (the components write their own markup
  with `innerHTML` only from constants; anything user-provided must go through
  `textContent`)
- Unsafe handling of user content in `@tooark/wysiwyg` (Tiptap document JSON)
  and `@tooark/code` (editor content, variable completions)
- Focus-trap or overlay escapes that let a modal dialog be bypassed in a way
  that defeats an app's intended gating
- Supply-chain issues in how the packages are built, versioned and published
  (`scripts/`, Rollup configs, the release workflow), including secret exposure
  or release spoofing in `.github/workflows/`

Out of scope:

- Vulnerabilities in peer dependencies and upstream libraries (ECharts, Tiptap,
  CodeMirror, Motion, React, Vue, Angular) — report those upstream; here they
  are handled through version bumps and the security floors in
  `pnpm-workspace.yaml`
- Issues that require an already-compromised page (malicious code running in
  the same origin can do anything a component can)
- Vulnerabilities in browsers, bundlers or the CI platform itself
- Social engineering, physical attacks, and denial of service

## Safe harbor

We support security research conducted in good faith. If you follow this policy,
we will:

- Not pursue legal action against you
- Work with you to understand and resolve the issue
- Publicly credit you (if you wish) in the security advisory

## Bounties

Tooark web-components is an open-source project maintained by volunteers. **No
monetary bounty program is currently offered**, but we deeply appreciate
responsible disclosure and will credit reporters publicly.
