# Rust Testing

> This file extends [common/testing.md](../common/testing.md) with Rust specific content.

## Minimum Test Coverage: 80%

Use `cargo-tarpaulin` for coverage measurement:

```bash
# Install tarpaulin
cargo install cargo-tarpaulin

# Run with coverage report
cargo tarpaulin --out html --output-dir coverage/

# Fail CI if coverage drops below 80%
cargo tarpaulin --fail-under 80

# Exclude test code from coverage
cargo tarpaulin --ignore-tests

# Generate lcov for CI integration
cargo tarpaulin --out lcov --output-dir coverage/
```

## Unit Tests

Place unit tests in the same file as the code, inside a `#[cfg(test)]` module:

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

pub fn divide(a: f64, b: f64) -> Result<f64, &'static str> {
    if b == 0.0 {
        return Err("division by zero");
    }
    Ok(a / b)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_positive_numbers() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn test_add_negative_numbers() {
        assert_eq!(add(-2, -3), -5);
    }

    #[test]
    fn test_add_zero() {
        assert_eq!(add(0, 5), 5);
    }

    #[test]
    fn test_divide_success() {
        let result = divide(10.0, 3.0).unwrap();
        assert!((result - 3.333).abs() < 0.01);
    }

    #[test]
    fn test_divide_by_zero() {
        let result = divide(10.0, 0.0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "division by zero");
    }
}
```

Guidelines:
- Test function names describe the scenario: `test_<function>_<scenario>`
- One assertion per test when possible (clear failure messages)
- Use `assert_eq!` for equality, `assert!` for boolean, `assert_ne!` for inequality
- `unwrap()` is acceptable in tests -- panics give clear failure output
- Test both success and failure paths for `Result` and `Option` returns

## Integration Tests

Place integration tests in the `tests/` directory at the crate root:

```
project/
  src/
    lib.rs
    parser.rs
    evaluator.rs
  tests/
    integration_parser.rs
    integration_evaluator.rs
    common/
      mod.rs          # Shared test utilities
```

```rust
// tests/integration_parser.rs
use my_crate::Parser;

#[test]
fn test_parser_full_pipeline() {
    let input = "2 + 3 * 4";
    let parser = Parser::new(input);
    let ast = parser.parse().expect("should parse successfully");
    assert_eq!(ast.evaluate(), 14);
}
```

Guidelines:
- Integration tests can only access the public API of the crate
- Use a `tests/common/mod.rs` for shared fixtures and helpers
- Name test files descriptively: `tests/api_users.rs`, `tests/db_migrations.rs`
- Each file in `tests/` is compiled as a separate crate

## Property-Based Testing with Proptest

Use `proptest` for discovering edge cases automatically:

```toml
# Cargo.toml
[dev-dependencies]
proptest = "1"
```

```rust
#[cfg(test)]
mod tests {
    use proptest::prelude::*;

    // Basic property test
    proptest! {
        #[test]
        fn test_add_is_commutative(a in -1000i32..1000, b in -1000i32..1000) {
            assert_eq!(add(a, b), add(b, a));
        }

        #[test]
        fn test_add_is_associative(
            a in -1000i32..1000,
            b in -1000i32..1000,
            c in -1000i32..1000,
        ) {
            assert_eq!(add(add(a, b), c), add(a, add(b, c)));
        }

        #[test]
        fn test_parse_roundtrip(s in "[a-zA-Z0-9_]{1,50}") {
            let parsed = parse(&s).expect("should parse valid identifier");
            assert_eq!(parsed.to_string(), s);
        }
    }

    // Custom strategies
    fn valid_email() -> impl Strategy<Value = String> {
        ("[a-z]{1,10}", "[a-z]{1,10}", prop_oneof!["com", "org", "net"])
            .prop_map(|(user, domain, tld)| format!("{user}@{domain}.{tld}"))
    }

    proptest! {
        #[test]
        fn test_email_validation(email in valid_email()) {
            assert!(validate_email(&email).is_ok());
        }
    }
}
```

Guidelines:
- Use proptest for any function with a mathematical property (commutative, associative, idempotent)
- Use proptest for serialization/deserialization roundtrips
- Use proptest for parsing (valid inputs never panic, invalid inputs return errors)
- Constrain input ranges to avoid overflow in arithmetic tests
- Use `prop_assert!` and `prop_assert_eq!` inside `proptest!` blocks

## Async Tests

Use `#[tokio::test]` for async test functions:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_fetch_user() {
        let db = setup_test_db().await;
        let user = db.fetch_user(1).await.expect("user should exist");
        assert_eq!(user.name, "Alice");
        db.cleanup().await;
    }

    #[tokio::test]
    async fn test_concurrent_writes() {
        let db = setup_test_db().await;
        let handles: Vec<_> = (0..10)
            .map(|i| {
                let db = db.clone();
                tokio::spawn(async move {
                    db.insert_user(&format!("user_{i}")).await
                })
            })
            .collect();

        for handle in handles {
            handle.await.unwrap().expect("insert should succeed");
        }

        let count = db.count_users().await.unwrap();
        assert_eq!(count, 10);
    }
}
```

## Test Fixtures and Setup

Use builder patterns and helper functions for test setup:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // Test fixture builder
    struct TestUserBuilder {
        name: String,
        email: String,
        role: Role,
    }

    impl TestUserBuilder {
        fn new() -> Self {
            Self {
                name: "Test User".to_string(),
                email: "test@example.com".to_string(),
                role: Role::User,
            }
        }

        fn with_name(mut self, name: &str) -> Self {
            self.name = name.to_string();
            self
        }

        fn with_role(mut self, role: Role) -> Self {
            self.role = role;
            self
        }

        fn build(self) -> User {
            User {
                name: self.name,
                email: self.email,
                role: self.role,
            }
        }
    }

    #[test]
    fn test_admin_can_delete() {
        let admin = TestUserBuilder::new()
            .with_name("Admin")
            .with_role(Role::Admin)
            .build();
        assert!(admin.can_delete());
    }
}
```

## Snapshot Testing

Use `insta` for snapshot testing complex outputs:

```toml
# Cargo.toml
[dev-dependencies]
insta = { version = "1", features = ["yaml"] }
```

```rust
#[cfg(test)]
mod tests {
    use insta::assert_yaml_snapshot;

    #[test]
    fn test_api_response_format() {
        let response = build_user_response(1);
        assert_yaml_snapshot!(response);
    }
}
```

```bash
# Review and accept snapshots
cargo insta review
```

## Test Organization Checklist

Before marking work complete:
- [ ] Unit tests in `#[cfg(test)]` modules alongside code
- [ ] Integration tests in `tests/` directory
- [ ] Property-based tests for mathematical invariants
- [ ] Async tests use `#[tokio::test]`
- [ ] Test helpers and fixtures are reusable
- [ ] Error paths tested (not just happy path)
- [ ] Edge cases covered (empty, zero, max, overflow)
- [ ] Coverage at 80%+ (cargo tarpaulin)
- [ ] CI runs `cargo test` and `cargo tarpaulin --fail-under 80`
- [ ] No `#[ignore]` tests without explanation comment

## Agent Support

- **tdd-guide** - Use PROACTIVELY for new features, enforces write-tests-first
