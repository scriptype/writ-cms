## Meta
- When the user states a strong preference or asserts that something should always/never be done a certain way, ask if they'd like it added to this file for future threads

## Project
<!-- Fill in over time -->

## Architecture
<!-- Fill in over time -->

## Preferences
<!-- e.g., "No TypeScript", "No bundlers", "Vanilla JS only" -->

## Coding Conventions
- Respect existing indentation style in each file
- Keep lines shorter than 80 columns (including comments), but don't break a line just to shave a few characters if it hurts readability
- No trailing whitespace
- In multiline comments, add blank lines between logical points

### JS
- Avoid semicolons unless absolutely necessary
- Always use curly braces {} for control structures (if, for, while, etc.), even for single statements
- For multiline arrow functions without explicit parentheses, always use curly braces with return (e.g., `=> { return ... }`, not `=> expr` spanning lines). Implicit return with parentheses is OK (e.g., `=> ({...})`)
- Respect default JSHint rules
- Break logical operator chains (&&, ||) across lines only when significantly long
- Keep short destructured imports on one line; break across lines only when exceeding 80 columns
- Keep ternary `?` at end of line, not start of next
- Always check for unused imports after finishing work on a module

### CSS
- Order CSS properties from layout-affecting to cosmetic: positioning → display/layout → box model (padding, border) → typography → background/color → decoration (shadow, opacity) → animation → z-index
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