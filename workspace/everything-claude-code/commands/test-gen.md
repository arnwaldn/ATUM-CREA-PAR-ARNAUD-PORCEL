# Test Generation

Generate tests for specified files or functions using Test-Driven Development principles:

1. Analyze the target:
   - Read the specified file(s) or function(s)
   - Identify all public exports and their signatures
   - Map dependencies and side effects
   - Determine the appropriate test framework (Vitest, Jest, Playwright, cargo test)

2. Identify test scenarios for each function:

   Happy Path:
   - Normal expected inputs and outputs
   - Standard use cases the function is designed for

   Error Handling:
   - Invalid inputs (null, undefined, empty string, wrong type)
   - Missing required parameters
   - Network/IO failures (for async operations)
   - Expected error messages and types

   Edge Cases:
   - Boundary values (0, -1, MAX_INT, empty arrays)
   - Unicode and special characters
   - Concurrent access (if applicable)
   - Very large inputs

   Integration Points:
   - Database interactions (use mocks or test DB)
   - API calls (use MSW or nock for mocking)
   - File system operations (use temp directories)

3. Generate test files:
   - Place tests alongside source: `file.test.ts` or `file.spec.ts`
   - Or in `__tests__/` directory matching source structure
   - Include proper imports and mocking setup
   - Use descriptive test names: `should return X when given Y`

4. Test structure (Arrange-Act-Assert):
   ```
   describe('FunctionName', () => {
     it('should return expected result for valid input', () => {
       // Arrange: Set up test data
       // Act: Call the function
       // Assert: Verify the result
     })
   })
   ```

5. Verify generated tests:
   - Run tests: `npm test -- --run`
   - All tests should PASS
   - Check coverage: `npm test -- --coverage`
   - Ensure 80%+ coverage on target files

6. Report:
   - Number of tests generated
   - Coverage before and after
   - Any untestable code paths identified
   - Suggestions for improving testability

Use the **tdd-guide** agent for TDD workflow guidance.
