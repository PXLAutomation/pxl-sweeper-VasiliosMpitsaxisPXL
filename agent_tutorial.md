# SIDEBAR



---

# CONTENT

Agentic Software Engineering
Start with project state
Preferred development environment
Phase 1: ideation
Phase 2: requirements
Prepare the project locally
Shared agent instruction files
Use strong models for important phases
Phase 3: design
Phase 4: implementation plan
Track and finish work
Git and review hygiene
The Main Cycle
Repo organization
Testing starts early
Extra features
Deploy the browser game with GitHub Pages
Agentic Software Engineering

Agentic software engineering uses a coding agent inside a real engineering process.

You still need requirements, design, planning, review, testing, and release checks. The agent helps with the work. It does not replace the workflow.
In this course, the first project is a small browser game.
For the running example in this page, use one specific game all the way through:
PXL Sweep, a small one-page Minesweeper clone where the player reveals tiles, marks suspected mines, and clears the board without detonating a mine.
https://tomcoolpxl.github.io/pxl-sweeper/

GH classroom: https://classroom.github.com/a/tCYEI_iy

Start with project state

Do not treat browser agent chat history as the project.

The project should have real files that hold the current truth:

File	Purpose
REQUIREMENTS.md	What the project must do
DESIGN.md	How the solution is structured
IMPLEMENTATION_PLAN.md	The planned route of work
TODO.md	Active task queue created after IMPLEMENTATION_PLAN.md exists
DONE.md	Verified completed work, created with TODO.md after the plan exists
AGENTS.md, CLAUDE.md, GEMINI.md	Stable operating rules for coding agents

Chat history is only temporary working memory:

Long sessions drift.
The model accumulates old assumptions, half-finished reasoning, and details that no longer match the repository.
If the important state only lives in chat, the project gets weaker every time the session gets long or the tool compacts context.
Use one browser game through the course

The first project is a small browser game that runs as a single static web page.

That keeps the moving parts small:

one page
frontend only
no backend
no database
no service orchestration
simple deployment path

Deployment:

GitHub Pages fits this kind of project well. see https://docs.github.com/en/pages
GitHub documents branch-based publishing for simple static sites and supports publishing from the repository root or from /docs.
The publish source needs a top-level entry file such as index.html, index.md, or README.md.

The working example is PXL Sweep:

minesweeper clone
the player reveals tiles on a grid
the player marks suspected mines with a flag action
numbered tiles show adjacent mine counts
revealing a mine ends the run
clearing all safe tiles wins the game

This project is small, but the same habits scale later to larger repos, monorepos, and multi-service systems.

Keep the working files simple

For this course, keep the main project-state files at the repository root. In larger projects move it do /docs.

A simple layout is enough:

.
├── AGENTS.md              # permanent memory for codex
├── CLAUDE.md              # permanent memory for claude
├── GEMINI.md              # permanent memory for gemini
├── REQUIREMENTS.md
├── IMPLEMENTATION_PLAN.md
├── TODO.md                # create after IMPLEMENTATION_PLAN.md exists
├── DONE.md                # create with TODO.md after the plan exists
├── index.html             # starting point of the webpage
├── package.json           # defines runnable commands for JavaScript projects
├── src/
├── tests/
├── assets/
└── README.md
Copy to clipboard
Error
Copied

Use this starting structure because the important files are easy to find and easy to reference in prompts.

For the course default stack, package.json should exist even in a small project. This is a solid default for most JavaScript projects because it records the Node settings and the exact commands the project uses.

Preferred development environment

A native Linux environment is usually the safest fit for local coding agents and the tools around them.

If you use Windows, WSL2 is a good fallback, but keep the repository inside the Linux filesystem, not under /mnt/c/.... That avoids many common problems with file watching, permissions, case sensitivity, and path handling when Unix tools work on Windows-backed files.

This becomes more important once you start using package managers, test runners, bundlers, or file watchers.

Phase 1: ideation

Start ideation in a web AI before local coding begins.

Use ideation to narrow the problem until it is clear enough to turn into requirements.
State the phase clearly. Do not assume the model will infer it.

An ideation prompt looks like this:

I would like to create a game. This is the ideation phase. The game should be a small one-page web app with a static screen. It is a Minesweeper clone. In this ideation phase, I do not want to create a document. I want to have a conversation until we fix the idea. Give me potential directions in which I could develop this idea. I want to stick very close to minecraft original. Note that simple complexity must be maintenained. Ask questions if needed. Think deep.
Copy to clipboard
Error
Copied
PXL Sweep checkpoint

Before leaving ideation, the course project should have exact answers for:

the game concept
the core player action
the win or loss condition

If those are not fixed yet, the project is not ready for REQUIREMENTS.md.

Phase 2: requirements

Once the idea is narrow enough, move on purpose into the requirements phase.

The model's job now is to remove ambiguity, not to keep brainstorming broadly.

Use a prompt that forces clarification if you're uncertain. This is a pattern that can be often useful as you can finetune the more exact resulting prompt.

Now I would like to transition to the requirements phase. To do that, I would like to create a REQUIREMENTS.md document. Craft me a prompt that I can use to start this requirements phase and create that document. Think deep.
Copy to clipboard
Error
Copied

Then review and execute the resulting new prompt.

Review your requirements document. Reviewing often is key to agentic quality.

You can use a prompt to draft a review prompt, review that prompt itself and then execute it.

I now have a REQUIREMENTS.md document you generated for me. Craft me a prompt to review and improve this requirements document. Be meticulous. Think deep.
Copy to clipboard
Error
Copied

Make sure the commandline tools git, gh (github cli) are installed. Configure gh by executing gh auth login and authenticate using you GitHub account.

Create the repository:

cd ~
mkdir -p github
cd github

mkdir pxl-sweeper
cd pxl-sweeper

git init -b main

cat > README.md <<'EOF'
# pxl-sweeper

A tiny project scaffold for pxl-sweeper.
EOF

git add README.md
git commit -m "Initial commit"

gh repo create pxl-sweeper --public --source=. --remote=origin --push

Copy to clipboard
Error
Copied

add a .gitignore file for js:

cd ~/github/pxl-sweeper
gh repo gitignore view Node > .gitignore
git add .gitignore
git commit -m "Add Node gitignore"
git push
Copy to clipboard
Error
Copied

Maker sure visual studio code is installed, then run this command inside ~/github/pxl-sweeper:

code .
Copy to clipboard
Error
Copied

This will open the directory as a workspace (Ctrl+Shift+E). Make sure the Source Control (Ctrl+Shift+G) is working and you can commit and push to the repository.

Once REQUIREMENTS.md exists, put it in the root of the repository and commit it immediately. That is the first real checkpoint. You can finetune the document by hand right now.

PXL Sweep checkpoint

By the end of the requirements phase, PXL Sweep should have a committed REQUIREMENTS.md that names:

the player goal
the game loop
the exact in-scope features
the out-of-scope features
the control scheme
browser assumptions
acceptance criteria

If the file does not make those visible, the requirements are still too vague.

Prepare the project locally
Choose the stack for the project and for the workflow

The technical stack choice is not only about technical power. It also needs to fit:

the project size
the time available
the people who must understand it
the kinds of output current coding agents generate reliably

For PXL Sweep, plain JavaScript is the course default. It is close to the runtime, easy to generate, easy to inspect, and easy to deploy as a static site.

Use this as the first-project default:

plain JavaScript
one static page
simple test setup
GitHub Pages deployment

That also means:

add a small package.json
set "type": "module" if the project uses ESM imports
put the test command in package.json so the agent can run the same command every time

Add this at the end to the REQUIREMENTS.md file if not already there:

## Project Setup Requirements

- The project shall include a `package.json` file in the repository root.
- The `package.json` file shall define the project's runnable commands in a consistent way.
- The `package.json` file shall include at least a `test` script so the same test command can be run every time.
- If the project uses ES module imports in JavaScript, `package.json` shall set `"type": "module"`.
- The project shall remain compatible with a plain JavaScript, static-site workflow.
Copy to clipboard
Error
Copied

If you want the model to explain the tradeoffs before you commit to that stack, ask with context:

Recommend 3 stack options for this project.

Constraints:
- understandable in this course
- easy for an AI coding agent to generate, review, and test
- simple deployment
- no unnecessary complexity

For each option, give:
- why it fits
- what it makes harder
- test strategy
- deploy strategy

Then recommend one option and explain why it is the best teaching choice.
Copy to clipboard
Error
Copied

This gives the model the constraints it needs to compare realistic options.

Make sure to install nodejs and npm on your operating system.

Let's continue with actually running the agent. The course is made using chatgpt browser prompting for ideation and requirements, and the Google gemini cli agent for coding, but any agent will do.

npm

# install Node.js + npm first if needed

# Debian / Ubuntu
sudo apt update && sudo apt install -y nodejs npm

# Arch Linux
# sudo pacman -S --needed nodejs npm

# Fedora
# sudo dnf install -y nodejs npm

# macOS (using Homebrew)
# brew install node

# verify
node --version
npm --version
Copy to clipboard
Error
Copied

codex (OpenAI)

cd ~/github/pxl-sweeper
npm install -g @openai/codex
codex
Copy to clipboard
Error
Copied

gemini (Google)

cd ~/github/pxl-sweeper
npm install -g @google/gemini-cli
gemini
Copy to clipboard
Error
Copied

claude (Anthropic)

cd ~/github/pxl-sweeper

# recommended by Anthropic
curl -fsSL https://claude.ai/install.sh | bash

# then start it
claude
Copy to clipboard
Error
Copied
Agent context file

Context files, which use the default name GEMINI.md for the gemini cli agent, are a powerful feature for providing instructional context to the Gemini model.

You can use these files to give project-specific instructions, define a persona, or provide coding style guides to make the AI's responses more accurate and tailored to your needs.

Instead of repeating instructions in every prompt, you can define them once in a context file.

Use an initial GEMINI.md like this:

# Browser Game Project Rules

This repository builds PXL Sweep across the course.
Do not start a different project unless the course instructions explicitly change the project.

Authoritative project files:

- `REQUIREMENTS.md`
- `IMPLEMENTATION_PLAN.md`
- `TODO.md`
- `DONE.md`

Project rules:

- Keep one `TODO.md` item small enough for one review cycle.
- Refresh `TODO.md` from the current phase in `IMPLEMENTATION_PLAN.md`.
- Update `TODO.md` before starting a new implementation chunk.
- Update `TODO.md` and `DONE.md` after implementation.
- Move an item to `DONE.md` only after the required checks, review, and doc updates are complete.
- `DONE.md` holds only verified work.
- Update `REQUIREMENTS.md` when scope or acceptance criteria change.
- Update `IMPLEMENTATION_PLAN.md` when the order or grouping of work changes.
- For narrow tasks, pass the exact authoritative files in the prompt instead of retyping context.
- Ask before making a large refactor, changing the directory structure, or removing tests.
- Before moving work to `DONE.md`, review the diff, run the required checks, and update docs if the change affected scope or structure.
Copy to clipboard
Error
Copied

You can also add behavioral guidelines to reduce common LLM coding mistakes.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

Add this at the bottom of the GEMINI.md file:

# CLAUDE.md

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

Copy to clipboard
Error
Copied
Shared agent instruction files

Different coding agents use different project instruction files:

Codex uses AGENTS.md
Claude Code uses CLAUDE.md
Gemini CLI uses GEMINI.md

The important practice is to avoid scattering the real project rules across three unrelated files. Keep one shared rule set, then keep the tool-specific files thin.

For this course, use this pattern:

put shared project rules in GEMINI.md
let AGENTS.md refer to GEMINI.md
let CLAUDE.md refer to AGENTS.md

You can do that in simple text. Keep the wrapper files exact and short:

AGENTS.md

Do not adapt this file.
Find project-specific context in `@GEMINI.md`.
Update `GEMINI.md` instead of this file unless the shared cross-tool rules changed.
Copy to clipboard
Error
Copied

CLAUDE.md

Do not adapt this file.
Find project-specific context in `@GEMINI.md`.
Update `GEMINI.md` instead of this file unless the shared cross-tool rules changed.
Copy to clipboard
Error
Copied

Commit everything you have, push it to github. Make sure the empty TODO.md and DONE.md files exist.

What belongs in agent instruction files

Agent instruction files should contain stable rules that matter across future sessions.

Do not stop at vague categories. Put the stable rules the project actually needs.
Promote a rule into AGENTS.md, CLAUDE.md, or GEMINI.md only if it is stable, repeated, and likely to matter again.
Keep these files concise and structured.
Current Claude and Gemini guidance supports splitting larger instruction sets with imports or scoped rules, and reviewing nested files periodically for conflicts.
that is what we are doing by referring to REQUIREMENTS.md and IMPLEMENTATION_PLAN.md from inside the instruction files.
Small, specific files are easier to manage than one long dump.
Keep instruction files current

Do not write AGENTS.md, CLAUDE.md, or GEMINI.md once and forget them.

Review them when:

the project structure changes
the run, lint, or test commands change
the workflow around TODO.md or DONE.md changes
the agent makes the same mistake more than once
you start repeating the same correction in prompts

Also check for conflicts between:

top-level shared instructions
nested instruction files in subdirectories
local or user-level instructions
imported instruction files

If two rules conflict, the model may follow either one inconsistently.

Use strong models for important phases

Use the strongest available model for work that shapes the project:

reviewing REQUIREMENTS.md, DESIGN.md, and IMPLEMENTATION_PLAN.md
making architecture and stack decisions
planning phases and detailed implementation steps
debugging hard or confusing failures
doing release-readiness checks

Cheaper or faster modes are fine for small, local edits:

renaming one symbol or file
adding obvious logging
wiring a simple new test around already agreed behavior
formatting or tiny refactors with clear tests

Do not use a weak mode to generate core structure, requirements, or release gates. Pay for quality on the decisions that control everything else.

Interrupt bad reasoning early

Do not let the agent continue when it is clearly wrong.

If it starts editing the wrong file or changing the wrong concept, stop it.
Say what is wrong, restate the constraint, and narrow the task again.
If the diff is already large and wrong, undo it before asking for a new attempt.

Short interruptions save more time than reviewing a big broken change later.

Phase 3: design

For anything beyond a trivial game, create DESIGN.md before major coding starts.

The design document does not need to be long. It does need to make the structure clear.

For PXL Sweep, DESIGN.md could explain:

the main game state
how turns or frames work
how rendering works
how input is handled
where the core logic lives
how testing will be done

Keep the design concrete. We are going to skip the design document for this small project. A project consisting of a monorepo with multiple components will need a DESIGN.md or ARCHITECTURE.md document, next to for example API.md etc.

Phase 4: implementation plan

Before the model starts larger changes, create IMPLEMENTATION_PLAN.md:

This file should break the work into small phases.
Each phase should be reviewable on its own.

A recommended planning prompt looks like this:

Create a complete @IMPLEMENTATION_PLAN.md document for this project. DO NOT START IMPLEMENTATION!! ONLY CREATE THE DOCUMENT!!

Context:
- Project name: [PROJECT_NAME]
- Project type: 
- Goal: [SHORT PRODUCT OR DELIVERY GOAL]
- Constraints: [TECHNICAL / TEAM / TIME / PLATFORM CONSTRAINTS]
- Existing documents available: [REQUIREMENTS.md / DESIGN.md / ARCHITECTURE.md / none / other]
- Deployment target: [LOCAL ONLY / STATIC HOST / CLOUD / APP STORE / OTHER]
- Risk tolerance: [LOW / MEDIUM / HIGH]

Task:
Write the full contents of `IMPLEMENTATION_PLAN.md` in Markdown.

Output rules:
- Output only the final Markdown for `IMPLEMENTATION_PLAN.md`.
- Do not output commentary about your process.
- Do not output a template explanation.
- Do not number document headings.
- Use clear Markdown headings.
- Use phase-driven planning, not a flat task list.

Planning rules:
- Organize the work into sequential phases.
- Each phase must have exactly one primary goal.
- Each phase must end in a reviewable state.
- Order phases by dependency.
- If a phase is too large for one review cycle, split it before finalizing the plan.
- Prefer thin vertical slices where practical.
- Separate risky refactors, infrastructure changes, migrations, and deployment changes into their own phases.
- Include deployment or release phases only if relevant.
- Include a final stabilization and review phase.
- Do not invent major features or systems not implied by the context.
- If information is missing, make the smallest reasonable assumption and record it under `Assumptions`.
- If information is missing and sequencing depends on it, record it under `Open questions` or as a blocker inside the relevant phase.

Required top-level sections:
- Overview
- Assumptions
- Delivery strategy
- Phase list
- Detailed phases
- Dependency notes
- Review policy
- Definition of done for the plan
- Open questions

Requirements for `Delivery strategy`:
- State whether the plan uses vertical slices, layered implementation, or a hybrid.
- Briefly justify the choice.
- State why this strategy fits the project type and review cadence.

Requirements for `Phase list`:
- Provide a short list of all phases in order.
- Give each phase a stable identifier, such as `Phase 1`, `Phase 2`, and so on.
- Each phase title must describe the primary outcome, not a vague activity.

For each phase, include these sections exactly:
- Goal
- Scope
- Expected files to change
- Dependencies
- Risks
- Tests and checks to run
- Review check before moving work to `DONE.md`
- Exact `TODO.md` entries to refresh from this phase
- Exit criteria for moving items to `DONE.md`

Requirements for phase design:
- Each phase must focus on one primary deliverable.
- Each phase must be small enough for one review cycle under the stated review cadence.
- Do not hide multiple large deliverables inside one phase.
- Call out parallelizable work only if it is truly independent.
- Do not use a generic "polish" phase to hide unfinished core work.
- If a research spike or decision is required before implementation can proceed safely, create a dedicated phase for it.

Requirements for `Expected files to change`:
- Be concrete.
- List likely files, folders, or document names.
- If exact names are unknown, give the most likely path patterns.
- Include source files, tests, docs, config, CI, scripts, deployment files, and migration files when relevant.
- Do not use vague placeholders like "various files" or "app code".

Requirements for `Dependencies`:
- List both upstream dependencies and intra-project dependencies.
- State what must already exist before the phase begins.
- Identify blockers caused by unresolved decisions.
- State whether the phase depends on completion of a specific earlier phase.

Requirements for `Risks`:
- State the actual delivery or regression risks for the phase.
- If risk is low, say so and explain briefly.
- If risk is medium or high, identify the main failure modes.

Requirements for `Tests and checks to run`:
- Include exact checks where possible, for example:
  - unit tests
  - integration tests
  - end-to-end tests
  - lint
  - typecheck
  - format check
  - build
  - accessibility checks
  - smoke tests
  - manual UX checks
  - deployment verification
- If exact commands are unknown, use placeholder command patterns such as:
  - `npm test`
  - `npm run lint`
  - `npm run build`
  - `pytest`
  - `cargo test`
  - `[project test command]`
- Only include checks relevant to the phase.

Requirements for `Review check before moving work to \`DONE.md\``:
- This is a strict gate.
- Include:
  - code review concerns
  - requirement traceability
  - regression risk review
  - documentation update check
  - scope creep check
  - check that unfinished follow-up work has been written back to `TODO.md`
- Require the reviewer to confirm that the phase outcome matches the stated goal and scope.

Requirements for `Exact \`TODO.md\` entries to refresh from this phase`:
- Write exact checkbox-ready entries.
- Keep entries atomic, concrete, and reviewable.
- Group them under the phase.
- Each entry must map to a single piece of work that can be verified independently.
- Do not use vague entries such as:
  - "finish feature"
  - "polish app"
  - "wrap up"
- Include test, docs, and verification entries when needed.

Requirements for `Exit criteria for moving items to \`DONE.md\``:
- Make each criterion binary and verifiable.
- Tie each criterion to actual evidence such as:
  - code present in the expected files
  - tests passing
  - build succeeding
  - review completed
  - docs updated
- Do not allow an item to move to `DONE.md` because it is "mostly finished".
- State what must be true before each related `TODO.md` entry can be moved to `DONE.md`.

Requirements for `Review policy`:
- Define the expected review size based on the provided review cadence.
- State when a phase must be split before implementation starts.
- State that oversized phases are not allowed to proceed unchanged.

Requirements for `Definition of done for the plan`:
- Define what must be true for the overall project to be considered complete.
- Include implementation, validation, documentation, and deployment expectations if deployment is in scope.

Requirements for `Open questions`:
- List unresolved decisions that affect implementation quality or sequencing.
- Separate non-blocking open questions from blocking unknowns if needed.

Quality bar:
- Dependency-ordered phases
- Small enough for one review cycle
- Clear primary goal per phase
- Risky work isolated
- Explicit test gates
- Explicit review gates
- Concrete `TODO.md` and `DONE.md` handling
- Concrete expected file paths or path patterns
- No accidental scope creep

Silently self-check before finalizing:
- Are phases dependency-ordered?
- Is each phase small enough for one review cycle?
- Does each phase have a clear goal and binary exit criteria?
- Are risky changes isolated?
- Are tests and review gates explicit?
- Are `TODO.md` and `DONE.md` rules concrete?
- Are file changes concrete enough to guide implementation?
- Did the plan avoid feature creep?

DO NOT FORGET BUILD STEPS.

ALSO:
- think deep!
- check online!
Copy to clipboard
Error
Copied

Use the plan to give the agent bounded work instead of one huge vague request.

PXL Sweep checkpoint

By the end of planning, IMPLEMENTATION_PLAN.md should break PXL Sweep into named phases with review-sized tasks.

Those phases should then feed the first agent-refreshed entries in TODO.md.

Now let's review again:

Critically audit the provided IMPLEMENTATION_PLAN.md to ensure it provides a viable, low-risk, and verifiable path to delivery. Evaluate the plan against the following criteria:

   1. Phase Granularity: Is each phase focused on exactly one primary goal? Identify any "hidden" deliverables that would make a phase too large for a single review cycle.
   2. Logical Sequencing: Are dependencies handled correctly? Verify that foundational logic (data structures/state management) is established and tested before UI/UX layers are built upon them.
   3. Risk Isolation: Are high-complexity items—such as recursive expansion logic, first-click safety, or state transitions—isolated or prioritized early enough to prevent late-stage architectural rework?
   4. Verification & Exit Criteria: Are the 'Tests and checks to run' and 'Exit criteria' binary and verifiable? Check for vague language like "ensure it works" and replace with specific behavioral expectations or test patterns.
   5. Requirement Traceability: Does the plan map 1:1 to the REQUIREMENTS.md? Flag any missing features or potential scope creep not supported by the core requirements.
   6. Delivery Strategy: Evaluate the choice of vertical slices versus layering. Does the strategy minimize the "integration tax" at the end of the project?
   7. Operational Integrity: Ensure the 'Review check' gates are strict enough to prevent technical debt or "mostly finished" tasks from moving to DONE.md.

  Identify specific gaps, logical contradictions, or missing file patterns that could stall execution, and suggest concrete adjustments to improve the plan's robustness.
Copy to clipboard
Error
Copied

Then, apply the suggested adjustments. Do this multiple times and across agents for larger projects.

COMMIT AFTER EVERY STEP.

Then update GEMINI.md with new info. (do not do this yourself, say adapt @GEMINI.md if needed), then commit again.

Regular committing to github at every possible step is your life line for when things go haywire.

Track and finish work
Use TODO.md and DONE.md correctly

IMPLEMENTATION_PLAN.md is not the same as TODO.md.

The repo setup section told you when these files first appear. This section explains how to use them every day after the plan exists.

Use the files like this:

IMPLEMENTATION_PLAN.md is the planned route
TODO.md is the current execution queue
DONE.md is verified completed work

The plan should stay relatively stable. TODO.md should change often. DONE.md should record real progress that was actually checked.

Create TODO.md and DONE.md as soon as IMPLEMENTATION_PLAN.md exists.
Do not maintain TODO.md line by line by hand. Let the agent draft and refresh it from IMPLEMENTATION_PLAN.md.
DONE.md starts empty. It fills up only after work was actually checked.
Git and review hygiene

Watch the repository while the agent works.

Keep the Source Control view open and watch which files change.
Review diffs before you accept a large edit.
Run tests and checks before committing when possible.

Commit often, but only at stable points.

One commit per small, reviewable step is ideal.
Avoid huge "mixed" commits that blend refactors, feature work, and fixes.
Use clear commit messages that describe the change. Get vs code to generate them for you using the "Generate Commit Message" button.

Use branches and pull requests for a large project involving multiple developers.

Put risky or large phases on a feature branch.
Use pull requests to do agent-assisted reviews instead of pushing straight to main.
The Main Cycle

We start detailed plans per implementation phase and then, FINALLY we will start the coding part.

commit what you have

reset the agent session, clear the memory context:

/clear
Copy to clipboard
Error
Copied

Create detailed implementation plan for this phase using this agent prompt:

Zoom in on the next Phase from @IMPLEMENTATION_PLAN.md using @TODO.md. Based on @REQUIREMENTS.md and the existing codebase, generate a highly detailed technical implementation blueprint in a new file titled @IMPLEMENTATION_PHASE[N].md.

This blueprint must serve as a surgical execution guide, containing:
1. Architectural Design: Precise data structures, state definitions, and function signatures required for this phase.
2. File-Level Strategy: An exact list of files to touch, defining the specific responsibility of each change.
3. Atomic Execution Steps: For every checkbox in the high-level TODO.md for this phase, provide a detailed 'Plan-Act-Validate' cycle.
4. Edge Case & Boundary Audit: A list of specific failure modes, boundary conditions, and logic traps relevant to this phase's scope.
5. Verification Protocol: A step-by-step checklist of manual UX checks and automated test cases that must pass to satisfy the exit criteria.
6. Code Scaffolding: Essential boilerplate or structural templates for new modules to ensure idiomatic consistency.

CREATE ONLY the Markdown File for IMPLEMENTATION_PHASE[N].md. Do not begin implementation until this blueprint is reviewed. Think deep. Check online if needed for extra information.
Copy to clipboard
Error
Copied

Check the resulting file in vscode. Commit.

/clear session

Implement in plan mode

Execute the next unchecked phase from @TODO.md by entering plan mode. You MUST treat the corresponding @IMPLEMENTATION_PHASE[N].md file as your immutable execution blueprint; do not re-draft or propose an alternative strategy.

Proceed with the 'Atomic Execution Steps' defined in the phase document. You are responsible for the full lifecycle:
1. Implementation: Write idiomatic code following the established file-level strategy.
2. Verification: Empirically test the implementation (e.g., via browser inspection or layout logic validation) to ensure it meets the 'Verification Protocol' and specs.
3. Refinement: Perform a self-rectification and code review to ensure architectural integrity.
4. Documentation: Update @DONE.md and, if necessary, @GEMINI.md to reflect the new project state.
5. VCS: Commit the verified changes with message.

Think deep.
Copy to clipboard
Error
Copied

If the agent forgets: make it adapt @GEMINI.md if needed, and especially adapt DONE.md. Commit

Make sure the agent executed/tested this implementation at least roughly, and further according to specs in detailed implementation if present. You might need to force it.

Check implementation artifacts in visual studio code. Test/check running implementation yourself in browser. Ask agent for help if you don't know how to run it.

Often there will be old running servers in the background that the agent forgets. You need to ask to check for it and add a rule to the agent instruction file (GEMINI.md) to check for and kill older running servers.

If needed recification because it doesn't run or onbious bugs.

Commit to github in vscode!

/clean

repeat the cycle until all phases are implemented.

For larger projects it is useful to do code reviews in between phases.

Repo organization

Make sure the repo has proper organization, especially when it is a monorepo whichy needs very precise oprganization and testing/deployment practices.

Role: Senior Software Architect.
Task: Analyze and optimize the repository's directory structure and file organization.

Instructions:
1. Categorize: Identify the repository type (Monolith, Modular Monolith, or Monorepo via Workspaces/Packages).
2. Evaluate: Assess the current layout against industry standards for the primary language framework (e.g., Golang internal/ vs. pkg/, React features/ vs. components/).
3. Analyze Monorepo Specifics (If applicable): Evaluate boundary isolation, shared logic/config distribution, and dependency management between packages.
4. Propose Improvements: Provide a refactored directory map that optimizes for:
   * Discoverability: Reducing "folder-hunting" for new developers.
   * Separation of Concerns: Decoupling business logic from infrastructure/framework code.
   * Build/CI Efficiency: Grouping files to enable better caching and selective testing.
   * Scalability: Identifying where the current structure will break as the codebase grows.

Output Format:
 * Current State Audit: Brief list of organizational "debt" or friction points.
 * Proposed Hierarchy: A clean tree representation of the new structure.
 * Migration Path: A logical 3-step sequence to move from the old to the new layout without breaking CI/CD.
Copy to clipboard
Error
Copied
Testing starts early

Do not wait until the end to think about testing.

For the browser game, think in layers:

unit tests for pure rules or state transitions
integration tests for pieces working together
browser or scenario tests for user-visible behavior when justified

Keep the test setup small. Design the code so testing is possible.

Design for testability

If all the logic lives inside UI code, testing becomes painful.

If you separate:

game state and rules
rendering
input handling

then testing becomes much easier. You yourself need to think logically about this. AI prompts and agents don't always do that unless explicitly pushed in the right direction.

In larger, more complex service-based systems, the same idea becomes separation between business logic, transport, persistence, and orchestration.

Broader testing and tooling

Testing is not only unit tests.

Write integration tests where parts of the system work together.
Add higher-level checks only when they give real value, for example a small end-to-end test and/or a quick smoke test.

Set up basic quality tooling early:

a linter for common mistakes
a formatter for consistent style
a type checker when the language supports it

In a proper project, add simple CI as soon as tests exist so every push or pull request runs the same checks.

Be suspicious when the model edits tests

When tests fail, weak model behavior often looks like this:

weaken the assertion
remove the failing condition
rewrite the test until it passes
make the signal weaker instead of fixing the bug

That is not a fix.

Whenever the agent changes tests, review those changes very carefully.

Ask:

Was the test actually wrong?
Did the assertion get weaker?
Did the change remove the signal instead of fixing the cause?
Testing our game

Let's add a testing plan and implementation.

We only go for unit and integration tests. Full Playwright tests are very very hard to do well and are very expensive to create in hours and credits spent.

Insist that:

new implementatiion comes with new tests
make sure all type of tests are always run
make sure all REQUIREMENTS.md requirements are covered.
make sure you have enough tests
consider code coverage reporting and tracking

Add rules to your memory context file for testing

```text
  Role: Senior SDET (Software Development Engineer in Test).
  Task: Design and implement a robust testing strategy for the specified module/feature, documented in a TESTING_STRATEGY.md file.

  Instructions:
   1. Discovery: Identify the existing test runner and assertion library by analyzing project manifests (e.g., package.json, Cargo.toml, requirements.txt, go.mod).
   2. Organization: Propose a directory structure following the industry standard for the detected language:
       * Unit Tests: Place near the source (e.g., src/__tests__/ or module_test.go) for logic isolation.
       * Integration Tests: Place in a dedicated root-level folder (e.g., tests/integration/) for cross-module verification.
   3. Strategy:
       * Unit: Use mocks/stubs for dependencies. Focus on edge cases, boundary conditions, and error handling.
       * Integration: Use real (or containerized) dependencies where possible. Focus on data flow between components and side effects.
   4. Implementation: Design the strategy to support tests using the AAA Pattern (Arrange, Act, Assert). Ensure clean setup/teardown logic to prevent test pollution.

  Output Format (The TESTING_STRATEGY.md content):
   * Infrastructure Check: Summary of detected tools and chosen directory paths.
   * Test Map: List of specific scenarios to be covered (Happy path vs. Edge cases).
   * Code Samples: The test files, including any necessary mock configurations or test helpers.
   * Execution Guide: The exact CLI command to run these specific tests.

Think deep. Check online.
Copy to clipboard
Error
Copied
Post implementation

Select a software license! ;^)

Make sure you have extensive debugging info in dev mode vs prod mode so the AI can solve them better.

Add extensive logging for more complex projects. This will help find bugs massivly.
Make it check output from startup commands (e.g. npm or npx serve commands)
Make it check logs. Make sure you have lots af debug logs. Ask to add more logging if needed.
You yourself: check Browser errors in F12 console

Use reviews to enhance the project quality:

manual review
Agent reviews:
UX review
code review
edge cases & testing
security review
Code reviews

Let's do a fully comprehensive code review:

# ROLE
You are a Senior Principal Engineer and SDET. Perform a high-signal code review of the current project.

# OBJECTIVE
Analyze the codebase and produce `CODE_REVIEW.md`, a fully comprehensive code review, with at least the following sections:

## Architecture & Design Patterns
- Separation between core engine (`Board`, `Cell`) and UI controller (`Game`)
- SOLID, DRY, KISS, and clear state flow

## Code Quality & Maintainability
- Code smells (god objects, long methods, deep nesting, primitive obsession)
- Naming quality and composition over inheritance
- use of magic numbers

## Repository Organization & Infrastructure
- Standard layout (`src/`, `tests/`)
- Config health (`package.json`, `vitest.config.js`)

## Testing & Quality Assurance
- AAA pattern (Arrange, Act, Assert)
- Mocking quality, boundary coverage, statement/branch coverage tracking

## Frontend & UX
- Interaction feedback and state transitions
- Accessibility (ARIA) and performance

## Error Handling & Logic Integrity
- Key assumptions (for example first-click safety)
- Fail-fast input validation

## Requirement Traceability
- Coverage of requirements in `REQUIREMENTS.md`

# OUTPUT FORMAT: CODE_REVIEW.md
Use this exact structure:
- **Executive Summary**: score 1-10 and 2-sentence summary
- **Architecture & Design**
- **Implementation & Code Quality**
- **Testing & Stability**
- **UX & Accessibility**
- and MOST important: **Actionable Recommendations**

Think deep. Check online. Ask questions if needed.
Copy to clipboard
Error
Copied

Then implement a selection of recommendations in that file.

Repeated "fully comprehensive code reviews" are an excellent tool to improve quality of your project.

Extra features

Plan features carefully, in the same manner as before.

Use phases when needed.
Heavily rely on regression testing, especially integration tests.
Deploy the browser game with GitHub Pages

For this tutorial, GitHub Pages is the simplest deployment path.

The practical steps are:

make sure the publish source has a top-level entry file such as index.html
open the repository Settings
open Pages
choose the publishing source
for a simple static project, branch-based publishing is usually enough
choose the branch and either / or /docs
save
verify the published result
Next steps for the game
Proper CI/CD (using github actions, don't forget to switch gh pages set-up as well)
V2, starting with ideation (mobile compatibility, Phaser3 platform, ...)