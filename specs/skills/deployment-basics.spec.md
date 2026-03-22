# Component: deployment-basics
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (deployment follows the verify step), git-workflow (deployment requires pushing code)
## Session Target: 1

## What This Is
Teaches how to ship software to production for non-developers. Covers what deployment IS, the difference between localhost and production, hosting options, environment variables in production, and basic deployment workflows. This is mostly custom content — ECC lacks dedicated deployment teaching — tailored for the moment when a learner's first project is ready to go live.

## Skill Frontmatter
```yaml
name: deployment-basics
description: "Activated when a project is ready to ship to production, when discussing hosting or deployment options, when the user asks about how to make their application accessible online, or during the final milestone of a project."
origin: MDH
```

## Content Specification

### Section 1: What Deployment Means
Explain for non-developers: your application currently runs on YOUR computer (localhost). Deployment means putting it on someone else's computer (a server) so that other people can access it over the internet. Use the analogy: localhost is like a home-cooked meal — only people in your kitchen can eat it. Deployment is like opening a restaurant — anyone can walk in.

### Section 2: Localhost vs. Production
Teach the key differences:
- **Localhost** — only accessible on your computer. No security needed. Fast iteration.
- **Production** — accessible to everyone. Must be secure. Must handle errors gracefully. Must be reliable.
- What changes between environments: database connections, API keys, URLs, error logging
- Why you need different configurations for each environment

### Section 3: Hosting Options (Simplified)
Present hosting options at a conceptual level, matching project archetypes:
- **Static hosting** (Vercel, Netlify) — for web apps with no backend
- **Platform-as-a-Service** (Vercel, Railway, Render) — for full-stack web apps
- **Serverless functions** — for APIs and webhooks without managing a server
- **Container hosting** — for complex applications (advanced, Phase 4+)
- Decision framework: what kind of project determines what hosting to use

### Section 4: Environment Variables in Production
Teach how secrets and configuration work in production:
- Environment variables are set on the hosting platform, not in your code
- Each environment (development, staging, production) has its own values
- How to configure them on common platforms (conceptual, not step-by-step tutorials)
- What to do when something works locally but not in production (usually a missing env var)

### Section 5: The Deployment Workflow
Teach the basic workflow:
1. Code is pushed to git (the commit step)
2. The hosting platform detects the push (continuous deployment)
3. The platform builds your application
4. If the build succeeds, the new version goes live
5. If the build fails, the old version stays live (rollback)
- Why this is safer than manually copying files to a server

### Section 6: After Deployment
Teach what to check after deploying:
- Does the application load? (basic smoke test)
- Do all features work? (manual testing or E2E tests)
- Are there errors in the logs? (monitoring)
- How to roll back if something goes wrong
- The concept of monitoring — knowing when your application breaks before users tell you

## ECC Source Material
- ECC manual section 3: pipeline step 5 (VERIFY) — verification as the pre-deployment gate
- ECC manual section 14: "MCP Servers Available" — Vercel, Railway, Cloudflare Workers as deployment targets
- ECC rules/common/security.md — secret management (environment variables, never hardcoded)
- Plan section 3.3: project template milestones — "Ship" milestone (deployed and accessible online)
- Plan section 3.3: project template learning moments — "What deployment means and why localhost isn't enough"

## Implementation Notes
[Empty — filled during implementation]
