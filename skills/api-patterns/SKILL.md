---
name: api-patterns
description: "Activated when building APIs or integrations, when connecting to external services, when the agent proposes an API design, or when the user asks about how applications communicate with each other."
origin: MDH
---

# API Patterns

## What an API Is

An API (Application Programming Interface) is how two pieces of software talk to each other. It defines what you can ask for, how to ask, and what you'll get back.

**The restaurant analogy:** You (the client) sit at a table and look at the menu. You give your order to the waiter (the API). The waiter takes your order to the kitchen (the server), which prepares your food. The waiter brings back your meal (the response). You never enter the kitchen. You don't need to know how the food is made. You just need to know how to read the menu and place an order.

This is exactly how APIs work. Your application sends a request to another system, and that system sends back a response. Your application never sees the other system's internal code — just the response.

**Why APIs exist:** Because systems need to share data without sharing their internals. A weather app on your phone doesn't contain weather data — it asks a weather service's API for the current forecast. A payment system on a website doesn't process credit cards itself — it asks a payment service's API to handle the transaction.

---

## Understanding API Communication

When the agent builds an API or integrates with one, it handles the technical details. But understanding the basic communication pattern helps you evaluate whether the integration is working and diagnose problems.

**Requests and responses:** Your application sends a request (what it wants) and gets back a response (the answer). A response includes a status code — a number that tells you what happened:

- **200s mean success** — the request worked
- **400s mean the client did something wrong** — bad input, missing credentials, asking for something that doesn't exist
- **500s mean the server had a problem** — something broke on the other end

When testing your app and something isn't working, these numbers tell you WHERE the problem is. A 401 means your credentials are wrong. A 404 means you're asking for something that doesn't exist. A 500 means the other service is broken, not your app.

---

## Evaluating API Design

When the agent builds an API for your application, you can evaluate the quality of the design without understanding the technical details. Ask:

**Is it consistent?** Every response should follow the same structure. If some endpoints return data one way and others return it differently, that's a flag. Tell the agent: "Make all API responses use the same format."

**Are errors helpful?** When something goes wrong, does the API return a clear message explaining what happened? "No user exists with ID 999" is useful. "Error: null" is not. If you see unhelpful error messages during testing, tell the agent to improve them.

**Is it secure?** Does the API require authentication? Can anyone access it without credentials? If the security review flags an unprotected API endpoint, that's always worth fixing.

---

## Webhooks — Being Notified by Other Services

A regular API call works like checking your mailbox every hour. A webhook is the mail carrier ringing your doorbell when a package arrives.

Instead of your app repeatedly asking another service "did anything happen?", the other service TELLS your app when something happens.

**Common examples:**
- **Payment processing:** Stripe sends a webhook when a payment succeeds or fails.
- **Deployment triggers:** GitHub sends a webhook when code is pushed.
- **Chat integrations:** Slack sends a webhook when someone messages your bot.

**What to demand when the agent builds webhook handling:**
- Events should be validated (confirmed they actually came from the expected service, not an impersonator)
- Duplicate events should be handled gracefully (the same event arriving twice shouldn't cause double charges or duplicate records)
- Your app should respond quickly and process heavy work in the background

If the agent builds a webhook handler and the security review flags missing validation, fix it — an unvalidated webhook is an open door.

---

## Integrating with External Services

When your application needs to connect to an external service (a payment processor, an email sender, a mapping service), there's a practical workflow.

### Step 1: Read the documentation

Every service publishes API documentation — your menu. Tell the agent: "Read the API docs for [service] and build the integration." The agent can usually fetch documentation directly.

### Step 2: Get credentials

Most services require you to create an account and generate API credentials. Many offer a "sandbox" or "test" mode with fake data so you can experiment without real consequences. Always start in test mode.

### Step 3: Test before building

Before the agent writes a full integration, have it test the API connection. "Test the API with our credentials and show me a working response." This confirms credentials work and the API behaves as documented, before building your integration on top of it.

### Step 4: Verify error handling

External services fail in ways your own code doesn't — they go down, they rate-limit you, they return unexpected data. After the agent builds the integration, ask: "What happens if this service is down? What happens if we hit the rate limit?" If the answers aren't satisfactory, tell the agent to add proper error handling.

### Step 5: Secure the credentials

This cannot be overemphasized:
- **Never put credentials in your source code.** The security review will flag this as CRITICAL.
- Credentials should come from environment variables or a secrets manager.
- If credentials are ever accidentally exposed, revoke them immediately and generate new ones.

### The integration mindset

When evaluating an integration the agent built, check these three things:

1. **Does the app survive if the service is down?** — It should degrade gracefully, not crash.
2. **Are credentials stored securely?** — Never in code, always in environment variables.
3. **Can you swap the service later?** — If you switch payment processors, how much of the app needs to change? Less is better.
