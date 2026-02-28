## Meta
- When the user states a strong preference or asserts that something should always/never be done a certain way, ask if they'd like it added to this file for future threads

## Project
- An SSG with a built-in CMS studio — not a headless CMS or bolt-on editor

## Architecture
<!-- Fill in over time -->

## Preferences
- Keep notes in `notes/` as markdown files named `dd-mm-yy-topic.md`

## Coding Conventions

### Naming
- Never shorten self-documentary names unless the short form is also self-documentary and well-known (e.g. `btn`, `el`, `i` are OK; `ct`, `coll`, `sub` are not)
- Replace magic numbers with named constants
- Use pronounceable, searchable names
- Function names must accurately describe the operation, not the caller's intent
- Prefer domain-specific terms over generic words (e.g. `node` over `item` when the domain calls them nodes)
- Avoid encodings — don't append prefixes or type information

### Functions
- Functions should do one thing
- Prefer fewer arguments (ideally ≤ 3)
- Functions should have no side effects — do what the name suggests and nothing else
- Don't use flag arguments; split into separate functions

### Comments
- Always try to explain yourself in code first; comment only when code can't be clear enough on its own
- Don't add obvious/redundant comments
- Don't comment out code — just remove it (version control exists)
- Use comments for intent, clarification, or warning of consequences
- Always use standard comment styles, no extra dashes or decorations
- In multiline comments, add blank lines between logical points

### Structure
- Respect existing indentation style in each file
- Keep lines shorter than 80 columns (including comments), but don't break a line just to shave a few characters if it hurts readability
- Don't break a logical unit of code across lines when it fits on one line
- No trailing whitespace
- Separate concepts vertically with blank lines
- Related code should appear vertically dense (close together)
- Declare variables close to their usage
- Dependent functions should be close to each other
- Place called functions below their callers (downward direction)

### General
- Be consistent — if you do something a certain way, do all similar things the same way
- Avoid negative conditionals (prefer `isActive` over `isInactive`)
- Encapsulate boundary conditions in one place
- Don't repeat yourself (DRY), but don't abstract prematurely either

### JS
- Avoid semicolons unless absolutely necessary
- Always use curly braces {} for control structures (if, for, while, etc.), even for single statements
- For multiline arrow functions without explicit parentheses, always use curly braces with return (e.g., `=> { return ... }`, not `=> expr` spanning lines). Implicit return with parentheses is OK (e.g., `=> ({...})`)
- Respect default JSHint rules
- Keep logical operator chains (&&, ||) on one line unless they exceed 80 columns
- Keep short destructured imports on one line; break across lines only when exceeding 80 columns
- Keep ternary `?` at end of line, not start of next
- Always check for unused imports after finishing work on a module

### CSS
- Order CSS properties from layout-affecting to cosmetic: positioning/z-index → display/layout → box model (padding, border) → typography → background/color → decoration (shadow, opacity) → animation
- Never use arbitrarily high z-index values; use the lowest value that works

## Testing
### Conventions
- File naming: `ModuleName.spec.js` (matching source file casing)
- Glob pattern: `src/**/*.spec.js`
- Use `Promise.all()` for independent async file ops in setup/teardown
- Only use `t.plan()` for async or non-deterministic tests

### Assertion Formatting
- Assertion call on one line (e.g., `t.ok(`)
- Actual/expected value on separate line
- Message on its own line
- Blank line between consecutive assertions

### DOM Assertions
- `.length === 1` — element rendered exactly once
- `.length !== 0` — elements exist, multiple allowed
- Never `.length > 0` (ambiguous)

### Design Principles
- One distinct behavior per test, no redundancy
- Prioritize edge cases and unexpected behaviors over basic type variations
- Remove functionally identical tests even across different scenarios