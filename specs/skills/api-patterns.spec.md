# Component: api-patterns
## Type: skill
## Status: pending
## Dependencies: architecture-basics (API design is architectural), security-fundamentals (API auth is security)
## Session Target: 1

## What This Is
Teaches REST APIs, webhooks, and integrations for non-developers. Covers what an API is, how HTTP requests work, RESTful design, authentication patterns, webhooks, and how to integrate with external services. This skill activates when users build projects that connect to external services or expose their own API endpoints.

## Skill Frontmatter
```yaml
name: api-patterns
description: "Activated when building APIs or integrations, when connecting to external services, when discussing HTTP requests, webhooks, or data exchange between systems, or when the user asks about how applications communicate with each other."
origin: MDH
```

## Content Specification

### Section 1: What an API Is
Explain for non-developers: an API is a way for two pieces of software to talk to each other. Use the restaurant analogy — you (the client) give your order to the waiter (the API), the waiter takes it to the kitchen (the server), and brings back your food (the response). You never go into the kitchen yourself. Cover why APIs exist (so systems can share data without sharing their internal workings).

### Section 2: HTTP Basics
Teach the fundamental concepts in plain language:
- **Request** — asking for something (a URL + a method)
- **Response** — getting an answer back (status code + data)
- **Methods** — GET (read), POST (create), PUT (update), DELETE (remove)
- **Status codes** — 200 (OK), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)
- **Headers** — metadata about the request/response (like the envelope around a letter)
- **Body** — the actual data being sent (usually JSON)

### Section 3: RESTful API Design
Teach REST as a set of conventions for naming and organizing API endpoints:
- Resources are nouns (users, posts, orders), not verbs
- URLs describe the resource (/users/123, not /getUser?id=123)
- Methods describe the action (GET /users vs. POST /users)
- Consistent response format (envelope pattern from code-quality)
- Error responses should be helpful and consistent

### Section 4: API Authentication
Teach how APIs verify identity (connecting to security-fundamentals):
- **API keys** — a secret string that identifies your application
- **OAuth** — letting users log in with their existing accounts (Google, GitHub)
- **JWT tokens** — a secure way to prove identity across requests
- Why: without auth, anyone can access your API and your users' data

### Section 5: Webhooks
Teach what webhooks are and when they are useful:
- A webhook is the reverse of an API call — instead of you asking for data, the other system TELLS you when something happens
- Example: a payment service sends your app a message when a payment succeeds
- How to handle webhooks (receive, validate, process, respond)
- Common use cases (payment notifications, deployment triggers, chat bot messages)

### Section 6: Integrating with External Services
Teach the practical workflow for connecting to third-party APIs:
- Read the documentation (what endpoints exist, what data they return)
- Get API credentials (usually an API key or OAuth setup)
- Make test requests (verify the API works as documented)
- Handle errors (rate limits, timeouts, invalid responses)
- Store credentials securely (environment variables, never in code)

## ECC Source Material
- ECC rules/common/patterns.md — "API Response Format" (consistent envelope pattern: success, data, error, metadata)
- ECC manual section 5: "API/Integration" project route — API design, authentication, webhooks
- ECC manual section 3: pipeline steps — how API endpoints are verified in the verification step
- ECC rules/common/security.md — authentication/authorization verification, rate limiting on all endpoints
- ECC skills/ — api-design skill (referenced in ECC's skill catalog)

## Implementation Notes
[Empty — filled during implementation]
