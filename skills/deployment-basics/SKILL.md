---
name: deployment-basics
description: "Activated when a project is ready to ship to production, when discussing hosting or deployment options, when the user asks about how to make their application accessible online, or during the final milestone of a project."
origin: MDH
---

# Deployment Basics

## What Deployment Means

Right now, when you run your application, it runs on YOUR computer. You open a browser to `localhost:3000` and see it working. That's called running locally. Nobody else in the world can see it — it only exists on your machine.

**Deployment** is the process of putting your application on a server (someone else's computer that's always on and always connected to the internet) so that anyone can access it through a web address.

Think of it like cooking. Right now your app is a home-cooked meal — it's great, but only people in your kitchen can eat it. Deployment is opening a restaurant. You take the same recipe, set it up in a public space, and now anyone can walk in and enjoy it.

That's the finish line for every project. Software that only runs on your laptop isn't software — it's a prototype. Deployment is what turns your project from "something I built" into "something people use."

---

## Localhost vs. Production

Your app behaves differently depending on where it runs. Understanding the difference prevents most deployment headaches.

### Localhost (Your Computer)

- **Who can access it:** Only you.
- **Security:** Doesn't matter much. You're the only user, and nothing is exposed to the internet.
- **Speed:** Instant. Everything is right there on your machine.
- **Errors:** You see them immediately and fix them. If something crashes, you just restart.
- **Purpose:** Building, testing, experimenting.

### Production (A Server)

- **Who can access it:** Everyone on the internet.
- **Security:** Critical. Real users, real data, real attackers. Secrets must be locked down.
- **Speed:** Depends on the server, the network, and how many people are using it at once.
- **Errors:** Users see them. A crash means your app is down for everyone. You need to handle errors gracefully — show helpful messages, not technical stack traces.
- **Purpose:** Serving real users reliably.

### What Changes Between Environments

When you move from localhost to production, several things need to change:

- **Database connections.** Locally you connect to a database on your machine. In production, you connect to a hosted database with different credentials.
- **API keys.** Your development keys might have relaxed limits or point to test data. Production keys point to real services with real billing.
- **URLs.** Locally your app is at `localhost:3000`. In production it's at `yourapp.com`. Links, redirects, and API calls all need to use the right address.
- **Error logging.** Locally you print errors to your terminal. In production you send them to a logging service so you can investigate problems without being physically at the server.

This is why every serious project has separate configuration for each environment. Same code, different settings. The code doesn't change — the configuration around it does.

---

## Hosting Options

Where your app lives in production depends on what kind of app it is. You don't need to understand the infrastructure deeply — you need to pick the right category.

### Static Hosting (No Backend)

**What it's for:** Websites that don't need a server — the browser does all the work. Portfolio sites, landing pages, blogs, single-page apps that call external APIs.

**How it works:** Your HTML, CSS, and JavaScript files get uploaded to a service. The service delivers them to browsers. No server code runs.

**Platforms:** Vercel, Netlify, GitHub Pages, Cloudflare Pages.

**Cost:** Usually free for personal projects.

**When to choose:** Your project has no backend, no database, no server-side logic. Everything happens in the browser.

### Platform-as-a-Service (Full-Stack)

**What it's for:** Apps with both a frontend (what users see) and a backend (server code, database). This covers most real projects — anything with user accounts, data storage, or server-side processing.

**How it works:** You push your code, the platform handles installing dependencies, building, running your server, and connecting your database. You don't manage the underlying machine.

**Platforms:** Vercel (with serverless functions), Railway, Render, Fly.io.

**Cost:** Free tiers available, paid plans as you grow.

**When to choose:** Your project has a backend — API routes, a database, user authentication. This is the most common choice.

### Serverless

**What it's for:** APIs, webhooks, scheduled jobs — code that runs in response to events rather than running continuously.

**How it works:** You write individual functions. The platform runs them only when triggered (an API call, a timer, an incoming webhook). You pay per execution, not per hour.

**Platforms:** Vercel Serverless Functions, AWS Lambda, Cloudflare Workers.

**When to choose:** Your backend is a collection of independent operations (process a payment, send an email, respond to a webhook) rather than a continuously running server.

### Container Hosting (Advanced)

**What it's for:** Complex applications that need precise control over the runtime environment — multiple services, specific system dependencies, custom networking.

**How it works:** You package your entire application and its environment into a container (think of it as a portable box that contains your app plus everything it needs to run). The platform runs that container.

**Platforms:** Railway, Fly.io, AWS ECS, Google Cloud Run.

**When to choose:** You're at Phase 4 or beyond, your app has multiple services, or you need specific system-level configurations. If you're reading this section and it sounds complex — you probably don't need it yet.

### Decision Framework

| Your project is... | Choose... |
|---|---|
| A website with no backend | Static hosting |
| A full-stack app with database | PaaS |
| An API or webhook handler | Serverless |
| Multiple services or complex deps | Containers |

When in doubt, start with PaaS. It handles the most common case and you can always migrate later.

---

## Environment Variables in Production

Environment variables are the bridge between "works on my machine" and "works in production." They are the most common source of deployment problems and the most important concept to understand.

### What They Are

An environment variable is a named value that lives outside your code. Instead of writing `DATABASE_URL = "postgres://localhost/mydb"` directly in your code, you write `DATABASE_URL = process.env.DATABASE_URL` (or the equivalent in your language). The actual value gets set in the environment where the code runs.

Think of it like a form with blanks. Your code says "connect to database at \_\_\_\_\_\_\_." On your laptop, the blank is filled with your local database. On the server, the blank is filled with the production database. Same form, different answers.

### Why They Exist

- **Secrets stay secret.** API keys, database passwords, and tokens never appear in your code. Your code goes on GitHub — your secrets don't.
- **Environments stay independent.** Your local setup, staging server, and production server all have different values. You switch environments by changing variables, not code.
- **Configuration is flexible.** You can change behavior (enable debug mode, switch payment providers, adjust rate limits) without deploying new code.

### How to Set Them in Production

Every hosting platform has a settings page where you add environment variables. The exact steps vary, but the pattern is always the same:

1. Go to your project's settings on the hosting platform.
2. Find the "Environment Variables" section.
3. Add each variable: a name (like `DATABASE_URL`) and a value (like `postgres://prod-server/mydb`).
4. Save and redeploy.

Your code reads these values at runtime. The hosting platform injects them into the environment before your app starts.

### The Most Common Deployment Bug

If something works locally but breaks in production, the first thing to check is: **is an environment variable missing?** Nine times out of ten, that's the answer. You added a new API key locally but forgot to add it to the hosting platform's settings.

Good practice: keep a list of every environment variable your app needs. When you add a new one locally, immediately add it to production too.

---

## The Deployment Workflow

Modern deployment is automated. You don't manually copy files to a server. Instead, you push code to git, and the hosting platform takes it from there.

### How It Works

1. **You push to git.** You run `git push` to send your latest code to GitHub (or another git host).

2. **The platform detects the push.** Your hosting platform is connected to your repository. When it sees new code, it starts a deployment automatically.

3. **The platform builds your app.** It installs your dependencies (`npm install`, `pip install`, etc.), compiles your code if needed, and prepares it to run.

4. **If the build succeeds, the new version goes live.** Your app is now running the latest code. Users see the updated version.

5. **If the build fails, nothing changes.** The old version keeps running. Nobody sees a broken site. You get an error log showing what went wrong. You fix it, push again, and the cycle repeats.

This is called **continuous deployment** and it's standard practice. It's much safer than manually copying files because:

- The process is repeatable and consistent.
- Failed builds don't affect users.
- Every deployment is tied to a specific git commit, so you always know what's running.
- You can roll back to any previous version.

### What a Build Failure Looks Like

The platform will show you a log — a record of everything it tried to do. Common failures:

- **Missing dependency.** Something your code needs isn't listed in your package file.
- **Build error.** A syntax error, type error, or failed test that prevents the app from compiling.
- **Missing environment variable.** Your code references a variable that doesn't exist in the production environment.

Read the log from the bottom up. The last error is usually the one that matters.

---

## After Deployment

Deployment isn't the end — it's the beginning of a new responsibility. Your app is now live and people depend on it.

### Post-Deployment Checklist

Run through these immediately after deploying:

- **Does it load?** Visit the URL. Does the page appear? If not, check the build logs.
- **Do the main features work?** Log in, create something, view something, delete something. Walk through the core user flows.
- **Are there errors in the logs?** Check your hosting platform's log viewer. Look for anything red or unexpected.
- **Do external services connect?** If your app calls external APIs (payment, email, etc.), verify those connections work in production.

### Rolling Back

If something is broken and you can't fix it quickly, **roll back**. Most hosting platforms let you redeploy a previous version with one click. This restores the last working version while you figure out what went wrong.

Rolling back is not failure — it's professional practice. Production users matter more than your ego. Get them back to a working state first, then debug.

### Monitoring

Monitoring means knowing when your app breaks before your users tell you. At the simplest level:

- **Error tracking:** Services like Sentry catch errors in production and notify you. You see what broke, for which user, and the exact line of code.
- **Uptime monitoring:** Services that ping your app every few minutes and alert you if it's down.
- **Log aggregation:** Collecting logs from your app so you can search and analyze them without SSH-ing into a server.

You don't need all of this on day one. But knowing it exists prepares you for the moment your app has real users who depend on it. Start with error tracking — it pays for itself immediately.
