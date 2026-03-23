---
name: project-types
description: "Activated during project discovery (/discover), when helping a user choose what to build, when discussing project scope and milestones, or when the user asks about what kinds of projects they could build."
origin: MDH
---

# Project Archetypes

## Project Routes Overview

There are six types of projects you can build, each teaching you different skills. Think of these as routes on a map — they all lead to "I can build software," but through different terrain.

| Route | What You Build | What You Learn |
|---|---|---|
| **Web App** | An application that runs in a browser | Full-stack development: frontend, backend, database, deployment |
| **Automation** | A script that does repetitive work for you | Scripting, APIs, scheduling, error handling |
| **API/Integration** | A service that connects systems together | API design, authentication, webhooks, data transformation |
| **Data Tool** | Something that processes, analyzes, or visualizes data | Data processing, file handling, visualization, reporting |
| **CLI Tool** | A command-line utility you run in the terminal | Terminal interaction, argument parsing, file system operations |
| **Mobile/Desktop** | An app for phones or computers | Cross-platform development, state management, packaging |

No route is better than another. The right choice depends on what you need — the project that would be most useful to you RIGHT NOW.

---

## Route Details

### Web App

**What it is:** An application that runs in a web browser. It has a visual interface users interact with, a server that handles logic, and usually a database that stores information.

**Example projects:**

- **Expense Tracker** — Log purchases, categorize spending, see monthly totals in charts. You'll learn forms, data storage, and visualization.
- **Booking System** — Let clients reserve time slots. Calendar UI, conflict detection, email confirmations. Teaches state management and time-based logic.
- **Team Dashboard** — Aggregate data from different sources (GitHub commits, task completion, uptime stats) into one view. Teaches API consumption and real-time updates.
- **Recipe Manager** — Save recipes, scale ingredients by serving size, generate shopping lists. Teaches CRUD operations (create, read, update, delete — the four basic data operations) and computed values.

**Difficulty:** 3/5 — More moving parts (frontend + backend + database) but well-supported by frameworks and tutorials. The most common project type with the most available learning resources.

**Estimated sessions:** 8-15 for MVP (a "minimum viable product" — the simplest version that actually works).

**Tech stack recommendations:**
- **Next.js** (React framework) — handles both frontend and backend in one project. Most popular, largest community.
- **Database: SQLite** for learning, **PostgreSQL** for production.
- **Styling: Tailwind CSS** — utility-based, avoids fighting CSS architecture.

**Competence dimensions developed:** Frontend, Backend, Database, Deployment, Testing, Git.

**Milestones:**
1. **Hello World** — Project scaffolded, home page renders, development server running.
2. **First Feature** — One complete user flow works end-to-end (e.g., "user can add an expense and see it in a list").
3. **Data Layer** — Database connected, data persists between sessions, basic queries work.
4. **Polish** — Error handling, input validation, loading states, basic styling, edge cases covered, tests passing.
5. **Ship** — Deployed to a hosting platform, accessible via public URL.

**Key learning moments:** The first time your data survives a page refresh (that's the database working). The first time you visit your URL on your phone and it works.

---

### Automation

**What it is:** A script that performs a repetitive task automatically. Instead of doing something manually every day, you write code once and let it run on its own.

**Example projects:**

- **Invoice Processor** — Read invoices from email or a folder, extract amounts and dates, generate a monthly summary spreadsheet. Saves hours of manual bookkeeping.
- **Social Media Scheduler** — Queue posts with text and images, publish them at scheduled times across platforms via their APIs.
- **File Organizer** — Watch a downloads folder, automatically sort files into subdirectories by type, date, or naming pattern. Rename according to a convention.
- **Report Generator** — Pull data from multiple sources (database, API, spreadsheet), compile into a formatted PDF or HTML report, email it to a distribution list.

**Difficulty:** 2/5 — Fewer moving parts than a web app. No frontend to build. The challenge is handling edge cases (what if the email format changes? what if the API is down?).

**Estimated sessions:** 4-8 for MVP.

**Tech stack recommendations:**
- **Node.js** — Great for file operations and API calls. You'll use it for web apps too, so the skills transfer.
- **Python** — Excellent for data processing and has libraries for everything. If your automation is data-heavy, Python might be simpler.

**Competence dimensions developed:** Backend, APIs, Error Handling, File I/O, Scheduling.

**Milestones:**
1. **Hello World** — Script runs, reads one input, produces one output.
2. **First Feature** — Handles the main use case end-to-end (e.g., "processes one invoice from start to finish").
3. **Data Layer** — Handles multiple inputs, stores results, tracks what's been processed.
4. **Polish** — Graceful error handling (doesn't crash on bad input), logging, handles edge cases, retry logic for failed API calls.
5. **Ship** — Runs on a schedule (cron job or scheduled task), notifications on failure, deployed to a server or runs reliably on your machine.

**Key learning moments:** The first morning you wake up and the work is already done. The first time your script handles a weird edge case that would have tripped you up manually.

---

### API/Integration

**What it is:** A service that connects different systems together, or exposes your own data/logic for others to consume. You're building the plumbing between applications.

**Example projects:**

- **Webhook Relay** — Receive webhooks from one service (Stripe payment events, GitHub push notifications), transform the data, forward to another service (Slack, your database, a spreadsheet).
- **Unified Notification API** — One endpoint that sends notifications across email, SMS, Slack, and push — your other apps call one API instead of integrating with each service separately.
- **Data Sync Service** — Keep two systems in sync (e.g., when a customer is added in your CRM, create their account in your billing system automatically).
- **Custom API** — Expose your own data or business logic as an API that other applications can call. For example, a pricing calculator that other tools can query.

**Difficulty:** 3/5 — Conceptually straightforward but requires understanding authentication (API keys, OAuth), error handling across systems, and data transformation.

**Estimated sessions:** 5-10 for MVP.

**Tech stack recommendations:**
- **Node.js + Express** or **Hono** — Lightweight, fast to set up, great for APIs.
- **Deployment: Serverless** (Vercel Functions, AWS Lambda) — APIs are a natural fit for serverless since they respond to individual requests.

**Competence dimensions developed:** Backend, APIs, Security, Error Handling, Architecture.

**Milestones:**
1. **Hello World** — API server running, responds to a test request.
2. **First Feature** — One integration works end-to-end (e.g., "receives Stripe webhook, posts to Slack").
3. **Data Layer** — Stores event history, handles retries for failed deliveries, deduplication.
4. **Polish** — Authentication on endpoints, rate limiting, validation of incoming data, comprehensive error responses, tests.
5. **Ship** — Deployed, endpoints documented, monitoring in place.

**Key learning moments:** Understanding that most of the internet is APIs talking to APIs. Once you can build an integration, you can connect anything to anything.

---

### Data Tool

**What it is:** Software that processes, analyzes, or visualizes data. Takes raw information and turns it into something useful — reports, charts, cleaned datasets, insights.

**Example projects:**

- **CSV Analyzer** — Upload a CSV file, get automatic summary statistics, filterable tables, and charts. Turn raw data into a dashboard without spreadsheet formulas.
- **Log Parser** — Read application logs, extract patterns (error rates, response times, usage peaks), generate visual reports.
- **Budget Analyzer** — Import bank transaction data, auto-categorize expenses, show spending trends over time with interactive charts.
- **Survey Processor** — Collect survey responses, clean the data, generate statistical summaries and visualizations for presentation.

**Difficulty:** 2/5 — Focused scope. The challenge is handling messy real-world data (missing values, inconsistent formats, unexpected characters).

**Estimated sessions:** 4-8 for MVP.

**Tech stack recommendations:**
- **Python + Pandas** — The standard for data processing. Pandas makes working with tabular data straightforward.
- **Visualization: Matplotlib/Plotly** (Python) or **Chart.js/D3** (web-based).
- **Alternative: Node.js** if you want a web interface around your data tool.

**Competence dimensions developed:** Backend, File I/O, Data Processing, Visualization, Error Handling.

**Milestones:**
1. **Hello World** — Reads one data file, prints basic output.
2. **First Feature** — Processes data and produces a useful output (summary, chart, cleaned file).
3. **Data Layer** — Handles multiple file formats, stores processed results, handles large files.
4. **Polish** — Graceful handling of bad data (missing values, wrong types), progress indicators for large files, clear output formatting, tests.
5. **Ship** — Usable by others — either as a web app, a CLI tool, or a shared script with documentation.

**Key learning moments:** The first time you process in seconds what used to take an hour in a spreadsheet. Understanding that data is always messier than you expect.

---

### CLI Tool

**What it is:** A command-line utility — a program you run in the terminal by typing a command. No visual interface; it communicates through text input and output.

**Example projects:**

- **Project Scaffolder** — Type a command, answer a few questions, get a new project directory with all the boilerplate files set up. Like `create-react-app` but for your own project structure.
- **Time Tracker** — `track start "client work"`, `track stop`, `track report week`. A personal time tracker that lives in your terminal.
- **Note Manager** — `note add "Deploy fix for login bug"`, `note search deploy`, `note list today`. Quick capture and retrieval of notes without leaving the terminal.
- **Deployment Helper** — `deploy staging`, `deploy production --dry-run`. Wraps your deployment steps into a single command with safety checks.

**Difficulty:** 1/5 — The smallest surface area of any project type. No frontend, no database required (files work fine), no deployment complexity. This is the fastest route from zero to a working tool.

**Estimated sessions:** 3-6 for MVP.

**Tech stack recommendations:**
- **Node.js** — Fast to build, works everywhere, excellent libraries for CLI interaction (`commander`, `inquirer`).
- **Python** — Equally good, especially with `click` or `argparse` for argument handling.

**Competence dimensions developed:** Backend, File I/O, Argument Parsing, Error Handling, Testing.

**Milestones:**
1. **Hello World** — Command runs, displays help text, accepts one argument.
2. **First Feature** — One command works end-to-end (e.g., `note add "something"` saves a note).
3. **Data Layer** — Data persists between runs (stored in a local file), multiple commands work together.
4. **Polish** — Helpful error messages, input validation, edge cases handled, colorized output, tests passing.
5. **Ship** — Installable via `npm install -g` or equivalent, README with usage examples, works on other people's machines.

**Key learning moments:** The satisfaction of typing a short command and watching something useful happen. Understanding that every CLI tool you've ever used was built the same way.

---

### Mobile/Desktop

**What it is:** An application installed on a phone, tablet, or desktop computer. Unlike web apps, these are downloaded and installed, and can access device features (camera, file system, notifications).

**Example projects:**

- **Habit Tracker** — Daily check-in app with streaks, reminders, and progress charts. Teaches state management and notifications.
- **Inventory Scanner** — Use the phone camera to scan barcodes, track inventory counts, export reports. Teaches device API access and data management.
- **Meeting Notes** — Desktop app for taking structured meeting notes with templates, action item extraction, and export to various formats.
- **Personal Dashboard** — Desktop menubar/tray app showing weather, calendar, tasks, and system stats at a glance.

**Difficulty:** 4/5 — Cross-platform tooling adds complexity. App store submission is a process. But the result feels professional — a real app on a real device.

**Estimated sessions:** 10-20 for MVP.

**Tech stack recommendations:**
- **Mobile: React Native** or **Expo** — Write once in JavaScript, run on iOS and Android. Expo simplifies the build process significantly.
- **Desktop: Electron** or **Tauri** — Package a web app as a desktop application. Electron is more mature; Tauri is lighter and faster.

**Competence dimensions developed:** Frontend, State Management, Cross-Platform, Packaging, Testing, Deployment.

**Milestones:**
1. **Hello World** — App runs on device/simulator, displays a screen.
2. **First Feature** — One user flow works (e.g., "add a habit and check it off").
3. **Data Layer** — Data persists between app sessions, syncs if applicable.
4. **Polish** — Smooth navigation, loading states, offline handling, device-appropriate UX, tests.
5. **Ship** — Built and installable. For mobile: TestFlight/internal distribution. For desktop: downloadable binary.

**Key learning moments:** Seeing your app on your actual phone for the first time. Understanding that "apps" are just software with a different distribution model.

---

## Choosing Your Project

Choosing what to build is one of the hardest parts. Here's a framework to cut through the indecision.

### The Urgency Filter

Ask yourself: **"Which of these would I actually use tomorrow?"**

Not "which sounds cool" or "which would impress people." Which one solves a problem you have right now? A tool you'd use every day beats an impressive project you'd abandon after building.

Motivation follows usefulness. You'll push through the hard parts if the result matters to you.

### Scope Control

**Finishing one project teaches you more than starting three.** The learning happens in the last 20% — error handling, edge cases, deployment, documentation. Anyone can scaffold a project. Shipping one is what makes you a developer.

If you're torn between two ideas, pick the smaller one. You can always build the bigger one next, and you'll build it faster because you finished the first one.

### What If It's Too Ambitious?

Decompose it. Every ambitious project is a stack of smaller projects. "Build Uber" is impossible for a first project. "Build an app that shows nearby drivers on a map" is a web app with a map API — totally doable.

Break your idea into milestones. If Milestone 1 (Hello World) would take more than 2 sessions, the scope is too big. Narrow it down.

### What If It's Too Simple?

Make it production-grade. "Hello World" is trivial. "Hello World with proper error handling, tests, CI/CD, environment configs, and deployment" is a legitimate learning project. The complexity isn't in the feature — it's in doing it right.

### No Idea at All?

**Default: Build a personal CLI productivity tool.** It has the smallest surface area (no frontend, no database, no deployment complexity), produces a useful result fastest, and teaches fundamentals that transfer to every other project type. A time tracker, a note manager, or a project scaffolder — pick the one that sounds least boring.

---

## Difficulty Scaling

The same project type can be simple or complex. Difficulty is a dial, not a category. Here's how any project scales across five levels.

### Level 1 — Minimal

- One data source, one output
- No authentication
- No database (files or in-memory)
- Hardcoded configuration
- Works on your machine

*Example: A CLI tool that converts one CSV file to JSON.*

### Level 2 — Functional

- Multiple features that work together
- Simple database (SQLite or a JSON file)
- Basic input validation
- Simple error handling
- Configuration via environment variables

*Example: A CLI tool that converts CSV files with column mapping, output format options, and a history of past conversions.*

### Level 3 — Integrated

- External API integrations
- User authentication
- Proper database with migrations
- Comprehensive error handling
- Test suite
- Deployed to a hosting platform

*Example: A web app that imports CSV data, integrates with Google Sheets API, has user accounts, and is accessible online.*

### Level 4 — Production

- Multiple services or components
- Real-time features (live updates, notifications)
- Advanced authentication (OAuth, roles, permissions)
- Performance optimization
- Monitoring and error tracking
- CI/CD pipeline

*Example: A full data platform with real-time dashboards, team collaboration, API access, role-based permissions, and automated deployment.*

### Level 5 — Professional

- Production-scale architecture
- Horizontal scaling (handles growing traffic)
- Comprehensive monitoring and alerting
- Automated testing at every level
- Infrastructure as code
- Security hardening and audit trails

*Example: The same data platform handling thousands of concurrent users with 99.9% uptime, automated scaling, and SOC 2 compliance.*

You don't choose a level upfront. You start at Level 1, ship it, and iterate upward. Each level builds on the last.

---

## Milestone Structure

### What Milestones Are

Milestones are checkpoints — specific, verifiable states your project passes through on the way to completion. They prevent the most common trap in software: **"90% done, 90% to go."**

Without milestones, progress feels infinite. You're always "almost done" but never actually done. Milestones break the work into chunks where each chunk has a clear definition of "done." You can point to your app and say, "Milestone 2 is complete — one feature works end-to-end." That's real progress, not a feeling.

### The Five Standard Milestones

Every project, regardless of type, passes through these five stages:

**1. Hello World** — Your project exists and runs. The skeleton is set up, the development server starts, you can see something in the browser or terminal. No features yet — just proof that the foundation works. This is where most people get stuck (tooling, configuration, "it won't start"). Getting past this is a real achievement.

**2. First Feature** — One real capability works end-to-end. Not a placeholder. Not a mock. A user can do one actual thing: add an expense, run a conversion, trigger an automation. The entire path from user action to result works. This milestone proves your architecture can support real features.

**3. Data Layer** — Data persists. When you close the app and reopen it, your data is still there. This is the database milestone — connecting storage, writing queries, handling data integrity. Before this, your app has amnesia. After this, it remembers.

**4. Polish** — The app handles the real world. Error messages are helpful (not "Error: undefined"). Invalid input gets rejected with guidance. Edge cases don't crash the app. Tests cover the important paths. The UI (if there is one) is styled and responsive. This milestone separates prototypes from software.

**5. Ship** — Deployed and accessible. Not running on your laptop — running on a server with a URL others can visit, or installable as a package. Documentation exists. Someone who isn't you can use it. This is the finish line, and reaching it means you built real software.

### Why This Order Matters

Each milestone depends on the one before it. You can't add features until the skeleton runs. You can't add a database until you have a feature that needs one. You can't polish what doesn't exist yet. And you can't ship what isn't polished.

Resist the urge to jump ahead. Building the database before you have a working feature is a common mistake — you end up with a schema that doesn't match what your code actually needs. Follow the order. Trust the process.
