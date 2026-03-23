---
name: debugging-strategy
description: "Activated when errors or bugs are encountered, when build or test failures occur, when the user sees an error message and needs help understanding it, or when discussing how to fix things that are broken."
origin: MDH
---

# Debugging Strategy

## Errors Are Information, Not Failures

When you see red text and error messages, your first instinct might be alarm. That's completely natural -- it looks like something broke. But here's the shift in perspective: an error message is the computer telling you exactly what went wrong, and usually where.

Error messages are helpful messages, not punishments. They're the software equivalent of a car dashboard warning light. The light isn't the problem -- it's telling you about the problem so you can fix it.

**Anatomy of a typical error message:**

Most error messages have three parts:

1. **The error type** -- a category name like "TypeError," "SyntaxError," or "ModuleNotFoundError." This tells you what KIND of problem happened.
2. **The message** -- a plain-language description like "Cannot read property 'name' of undefined." This tells you WHAT went wrong.
3. **The stack trace** -- a list of files and line numbers showing the path the code took before it hit the error. This tells you WHERE it happened.

```
TypeError: Cannot read property 'name' of undefined
    at getUserName (src/users/user.service.js:42)
    at handleRequest (src/server.js:118)
```

Reading this: A "TypeError" happened. The code tried to read a property called "name" from something that doesn't exist ("undefined"). It happened on line 42 of `user.service.js`, inside a function called `getUserName`. The function was called from line 118 of `server.js`.

That's a lot of useful information packed into three lines. Once you learn to read these, errors become guideposts rather than roadblocks.


## The Debugging Process

Debugging is not "stare at code until the answer appears." It's a systematic process, and following these steps will solve most problems faster than guessing.

### Step 1: Read the error message word by word

Don't skim. Read every word. What does it actually say? Many errors describe the problem in plain language if you slow down enough to read them. "Cannot find module './userService'" means the code is looking for a file called `userService` and can't find it. Maybe it's named differently, or it's in a different folder.

### Step 2: Find the location

The error message tells you the file name and line number. Go there. Look at that exact line. What is the code doing at that point? What values might be wrong?

### Step 3: Form a hypothesis

Based on what the error says and where it happened, make a guess about the cause. Keep it simple:
- "It says 'undefined,' so maybe this variable wasn't set before it was used."
- "It says 'module not found,' so maybe the file name is spelled wrong."
- "It says 'unexpected token,' so maybe there's a typo in the syntax."

### Step 4: Test your hypothesis

Make ONE small change based on your hypothesis. Just one. Then run the code again. Did the error change? Did it go away? Did a different error appear?

Making one change at a time is critical. If you change five things and the error goes away, you don't know which change fixed it -- and you might have introduced new problems with the other four.

### Step 5: Verify the fix

Don't just confirm the error is gone. Run the tests. Make sure your fix didn't break something else. A fix that solves one problem but creates two new ones isn't a fix.

**The golden rule of debugging:** Change one thing, check the result, repeat.


## Common Error Patterns

Here are the most frequent error messages you'll encounter, translated into plain language:

**"undefined is not a function"** -- You tried to call something as a function, but it doesn't exist. Common causes: misspelled function name, forgot to import it, or the thing you're calling isn't actually a function.

**"Cannot read property of null" or "Cannot read property of undefined"** -- You tried to access a field on something that's empty (null) or doesn't exist (undefined). It's like trying to open the glove compartment of a car that isn't there. Common cause: data you expected to exist wasn't loaded yet, or a function returned nothing when you expected it to return something.

**"Module not found" or "Cannot find module"** -- The code is trying to use a file or package that it can't locate. Common causes: the package isn't installed (need to run your install command), the file path is wrong (check spelling and directory), or the file doesn't exist yet.

**"Type error" or "Expected X but received Y"** -- The code received the wrong kind of data. It expected a number but got text, or expected a list but got a single item. Like putting diesel in a gasoline car -- wrong fuel type.

**Build failures** -- The code can't be compiled or processed. Usually caused by syntax errors (missing bracket, extra comma, misspelled keyword) or missing imports. The build tool typically points to the exact location.

**Test failures** -- The code runs, but it doesn't produce the expected result. The test says "I expected 42 but got 41." This means your logic has a bug -- the code does something slightly different from what it should.

**"ECONNREFUSED" or "Connection refused"** -- Your code tried to connect to another service (a database, an API) and that service isn't running or isn't accepting connections. Check that the other service is started and that the address is correct.

**"Permission denied"** -- The code tried to access a file or resource it doesn't have permission for. Check file permissions or credentials.


## When to Debug Yourself vs. Ask for Help

Not every error requires the same response. Here's an escalation pattern:

### Always do first: Read the error

No matter what, read the error message yourself. Even if you don't fully understand it, the act of reading it builds your pattern recognition over time. You'll start noticing: "Oh, I've seen 'module not found' before -- that usually means I need to install something."

### Try one hypothesis

Based on the error message, try one thing. Just one. Did it help? If yes, you're learning to debug. If no, that's still useful information.

### When to ask Claude for help

Ask when:
- The error message uses terms you've never seen before
- You tried a hypothesis and the error didn't change or got more confusing
- The error points to code you didn't write (library code, generated code)
- Multiple errors appear at once and you're not sure which to fix first

**How to ask effectively.** Include these four things:

1. **The error message** -- copy the full text, not a summary
2. **What you expected** -- "I expected the user list to load"
3. **What actually happened** -- "Instead I got this error"
4. **What you already tried** -- "I checked the file name and it's correct"

This isn't just for Claude's benefit. Organizing your thoughts this way often helps you spot the problem yourself. Developers call this "rubber duck debugging" -- explaining the problem out loud (even to a rubber duck) frequently reveals the answer.

**The MDH build-fixer agent turns every error into a teaching moment.** It won't just fix the error -- it will explain what went wrong, why, and how to recognize similar errors in the future. Over time, you'll need to escalate less because you'll recognize more patterns on your own.


## Debugging with Tests

Tests and debugging are deeply connected. The most powerful debugging technique is also one of the simplest:

**When you find a bug, write a test that reproduces it.**

Here's the workflow:

1. **Bug exists** -- you see wrong behavior in your application
2. **Write a test** -- create a test that demonstrates the bug. The test should fail because it expects the correct behavior but gets the buggy behavior
3. **Fix the code** -- change the code until the test passes
4. **Bug never returns** -- that test now runs every time you make changes. If the bug ever comes back, the test catches it immediately

This is called **regression prevention**. A regression is when a bug you already fixed comes back. Without a test, you might not notice until a user reports it. With a test, you know instantly.

**Why this connects to TDD (Test-Driven Development):** In TDD, you write the test before the code. Debugging with tests is the same idea applied to bugs. The test defines "what correct looks like," and you write code until reality matches the definition.

**The practical benefit for non-developers:** You don't need to understand every detail of the code to write a useful test. You need to know: "When I do X, I expect Y." If the code gives you Z instead, that's a test: "Given X, the result should be Y, not Z."


## Reading Build and Verification Output

When you run a build or verification step, you'll see output from several different checks. Each one is testing something different, and understanding what each one does helps you know where to focus when something fails.

**Build check** -- "Does the code compile?" This is the most basic check. It verifies that the code is written in valid syntax and can be processed. If this fails, there's usually a typo, a missing bracket, or a syntax error. Fix these first because nothing else can run until the code compiles.

**Type check** -- "Are the data types correct?" This verifies that you're not passing text where a number is expected, or using a function that doesn't exist. Type errors are caught here before the code even runs. If this fails, look at the specific line -- you're probably using the wrong kind of data.

**Lint check** -- "Does the code follow style rules?" Linting checks for consistent formatting, unused variables, and common mistakes. These aren't bugs exactly -- the code might work -- but they indicate potential problems or make the code harder to read. Think of it as a spell-checker for code.

**Test check** -- "Does the code behave correctly?" Tests verify that the code actually does what it's supposed to do. If tests fail, look at which test failed and what it expected versus what it got. The test name usually describes the scenario: "should return user by ID" tells you what behavior is broken.

**Important: fixing one error may reveal others.** This is called cascading. A syntax error on line 10 might prevent the code from reaching line 50, hiding a different error. Once you fix line 10, the error on line 50 appears. This is normal -- it doesn't mean your fix broke something. It means the first error was hiding the second one.

**Read output from top to bottom.** Fix the FIRST error first. Often, later errors are caused by the first one, and fixing it makes them disappear.
