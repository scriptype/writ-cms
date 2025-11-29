## Coding Conventions
- Avoid semicolons unless it's absolutely necessary
- Always use block statements even if it could be a one-liner
- Always use curly braces {} for control structures (if, for, while, etc.), even if the body is a single statement
- Keep lines shorter than 80 columns (including comments)
- For multiple expressions with logical operators (&&, ||), break lines after each operator
- No trailing whitespace at the end of lines
- In multiline comments, add blank lines between logical points for readability
- Respect existing indentation style when editing files (maintain consistency with surrounding code)
- Keep ternary operator `?` at the end of the line, not at the start of the next line (avoid JSHint misleading line break warning)
- Respect default JSHint rules and do not change coding style in ways that cause JSHint to report warnings

## Test Assertions Formatting
- Assertion function call on one line (e.g., `t.ok(`, `t.equal(`, `t.notOk(`)
- Actual/expected value on separate line
- Message on its own line
- Add blank line between consecutive assertions
- Only use `t.plan()` for async or non-deterministic tests where assertions might be skipped; omit for sync tests

## Test File Naming
- Create test files with the same name and casing as the module being tested, with `.spec.js` appended
- Example: `FileSystemParser.js` → `FileSystemParser.spec.js`
- Test files use the glob pattern `src/**/*.spec.js`

## Test File Operations
- Use `Promise.all()` to parallelize independent async file operations (mkdir, writeFile, etc.) instead of awaiting them serially

## Test Suite Design
- Write lean tests that avoid redundancy while covering optimal paths and edge cases
- Each test should demonstrate one distinct behavior or scenario, not repeat what other tests already cover
- Focus on meaningful differences: testing the same logic with different data types (strings vs numbers) is redundant; test different behavior patterns instead
- Include edge cases and boundary conditions (empty inputs, zero values, falsy values, etc.)
- Remove tests that are functionally identical to existing ones, even if they test the same function in different scenarios
- Prioritize tests that demonstrate unexpected or complex behaviors over tests that verify basic functionality with different data types

## DOM Element Assertions
- Use `.length === 1` to assert an element is rendered exactly once (strict, single element expectation)
- Use `.length !== 0` to assert elements exist but allow multiple (when multiple are expected)
- Never use `.length > 0` as it's ambiguous about whether one or multiple elements are expected