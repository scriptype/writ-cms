## Coding Conventions
- Avoid semicolons unless it's absolutely necessary
- Always use block statements even if it could be a one-liner
- Always use curly braces {} for control structures (if, for, while, etc.), even if the body is a single statement

## Test Assertions Formatting
- Assertion function call on one line (e.g., `t.ok(`, `t.equal(`, `t.notOk(`)
- Actual/expected value on separate line
- Message on its own line
- Add blank line between consecutive assertions
- Only use `t.plan()` for async or non-deterministic tests where assertions might be skipped; omit for sync tests

## Test File Operations
- Use `Promise.all()` to parallelize independent async file operations (mkdir, writeFile, etc.) instead of awaiting them serially