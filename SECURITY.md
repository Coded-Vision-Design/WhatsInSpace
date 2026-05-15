# Security Policy

## Supported Versions

Only the latest deployment of this site (the `main` branch, served at https://whatsthatin.space) is actively maintained and patched. Older commits and forks are not supported.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it privately rather than opening a public issue or pull request.

**Preferred channel:** email **DJohnsonRose@live.co.uk** with the subject line `Security: WhatsInSpace`.

Where possible, please include:

- A description of the issue and the impact you believe it has.
- Steps to reproduce, or a proof-of-concept.
- The affected URL, commit, or component.
- Your name and any preferred attribution (or a request to remain anonymous).

You can also use [GitHub Private Vulnerability Reporting](https://github.com/Coded-Vision-Design/WhatsInSpace/security/advisories/new) on this repository.

## Response Expectations

- Initial acknowledgement within **3 working days**.
- A triage assessment within **7 working days**, including whether the report is accepted, requires more information, or is out of scope.
- Fixes for confirmed vulnerabilities are deployed via the standard CI pipeline (GitHub Actions to Hostinger), typically within 14 days for moderate issues and as quickly as practical for critical issues.

Please do not disclose the vulnerability publicly until a fix has been deployed and you have been notified.

## Scope

In scope:

- The Next.js application in this repository.
- The deployed site at `whatsthatin.space` and its subdomains.
- The Space News blog backend (MySQL on Hostinger) accessed by this application.
- GitHub Actions workflows in [.github/workflows](.github/workflows) that deploy this site.

Out of scope:

- Third-party APIs and content sources used by the site (NASA, ESA, news feeds, etc.); please report those upstream.
- Generic best-practice findings without a demonstrable impact (for example, missing security headers on static assets that contain no sensitive data).
- Denial-of-service findings that require unrealistic traffic volumes.
- Social-engineering or physical attacks against maintainers or hosting providers.

## Safe Harbour

We will not pursue legal action against researchers who:

- Make a good-faith effort to follow this policy.
- Avoid privacy violations, service degradation, and data destruction.
- Stop testing and report immediately upon discovering sensitive data.
