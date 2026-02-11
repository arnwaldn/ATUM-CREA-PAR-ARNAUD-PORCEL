# Rust Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Rust specific content.

## Formatting

- **rustfmt** is mandatory -- no style debates
- Run `cargo fmt --check` in CI to enforce formatting
- Configure via `rustfmt.toml` for project-specific overrides

## Ownership and Borrowing

ALWAYS prefer borrowing over taking ownership:

```rust
// WRONG: Takes ownership unnecessarily
fn process(data: String) -> usize {
    data.len()
}

// CORRECT: Borrows the data
fn process(data: &str) -> usize {
    data.len()
}
```

Guidelines:
- Use `&T` for read-only access
- Use `&mut T` only when mutation is required
- Transfer ownership only when the function needs to store or consume the value
- Use `Clone` explicitly rather than implicitly -- cloning should be a conscious decision

## Lifetime Annotations

KEEP lifetimes simple and explicit:

```rust
// WRONG: Unnecessary lifetime complexity
fn first_word<'a, 'b>(s: &'a str, _unused: &'b str) -> &'a str {
    &s[..s.find(' ').unwrap_or(s.len())]
}

// CORRECT: Minimal lifetime annotations (elision handles simple cases)
fn first_word(s: &str) -> &str {
    &s[..s.find(' ').unwrap_or(s.len())]
}

// CORRECT: Explicit when needed for clarity
struct Parser<'input> {
    source: &'input str,
    position: usize,
}
```

Guidelines:
- Let lifetime elision work whenever possible
- Name lifetimes descriptively when explicit: `'input`, `'conn`, `'ctx`
- Avoid `'static` unless truly needed (constants, leaked memory, thread spawning)
- Document why a lifetime is required if the relationship is not obvious

## Error Handling

NEVER use `unwrap()` or `expect()` in production code:

```rust
// WRONG: Panics on failure
let file = File::open("config.toml").unwrap();
let value: i32 = input.parse().expect("should be a number");

// CORRECT: Propagate with context using anyhow or thiserror
use anyhow::{Context, Result};

fn load_config(path: &str) -> Result<Config> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("failed to read config from {path}"))?;
    let config: Config = toml::from_str(&content)
        .context("failed to parse config TOML")?;
    Ok(config)
}
```

Error handling rules:
- Use `thiserror` for library error types (structured, typed errors)
- Use `anyhow` for application error types (ergonomic, context-rich)
- Use `?` operator for propagation -- avoid manual `match` on `Result`
- Add context with `.with_context()` or `.context()` at every boundary
- Define domain-specific error enums for public APIs
- `unwrap()` is ONLY acceptable in tests and build scripts

```rust
// CORRECT: Domain error with thiserror
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("user not found: {id}")]
    UserNotFound { id: u64 },
    #[error("invalid input: {0}")]
    InvalidInput(String),
    #[error("database error")]
    Database(#[from] sqlx::Error),
}
```

## Option Handling

PREFER combinators over manual matching:

```rust
// WRONG: Verbose match
let name = match user.name {
    Some(n) => n.to_uppercase(),
    None => "ANONYMOUS".to_string(),
};

// CORRECT: Combinator chain
let name = user.name
    .as_deref()
    .map(str::to_uppercase)
    .unwrap_or_else(|| "ANONYMOUS".to_string());
```

## Type Design

LEVERAGE the type system to prevent invalid states:

```rust
// WRONG: Stringly typed, allows invalid states
struct User {
    email: String,        // Could be empty or invalid
    role: String,         // Could be anything
    age: i32,             // Could be negative
}

// CORRECT: Newtypes and enums enforce validity
struct Email(String);  // Validated at construction

enum Role {
    Admin,
    User,
    Guest,
}

struct Age(u8);  // Non-negative by construction

struct User {
    email: Email,
    role: Role,
    age: Age,
}
```

## Clippy Compliance

ALWAYS run Clippy with strict settings:

```bash
cargo clippy -- -D warnings -W clippy::pedantic -W clippy::nursery
```

Key Clippy lints to enforce:
- `clippy::unwrap_used` -- no unwrap in production
- `clippy::expect_used` -- no expect in production
- `clippy::panic` -- no panic in production
- `clippy::todo` -- no todo macros left behind
- `clippy::dbg_macro` -- no debug macros in production
- `clippy::needless_pass_by_value` -- borrow instead of move
- `clippy::large_enum_variant` -- box large variants
- `clippy::clone_on_ref_ptr` -- explicit Arc/Rc cloning

Configure in `clippy.toml` or `Cargo.toml`:

```toml
[lints.clippy]
unwrap_used = "deny"
expect_used = "deny"
panic = "deny"
todo = "deny"
dbg_macro = "deny"
pedantic = { level = "warn", priority = -1 }
```

## Concurrency

PREFER message passing over shared state:

```rust
// CORRECT: Channel-based communication
use tokio::sync::mpsc;

let (tx, mut rx) = mpsc::channel(32);

tokio::spawn(async move {
    while let Some(msg) = rx.recv().await {
        process(msg).await;
    }
});

// When shared state is needed, use Arc<Mutex<T>> or Arc<RwLock<T>>
// NEVER hold a lock across an await point
```

## Module Organization

- One module per file, one concern per module
- Public API in `lib.rs`, internal details in submodules
- Use `pub(crate)` for crate-internal visibility
- Re-export important types from the crate root
- Keep `main.rs` thin -- delegate to library code

## Code Quality Checklist

Before marking work complete:
- [ ] `cargo fmt` passes
- [ ] `cargo clippy -- -D warnings` passes
- [ ] No `unwrap()` or `expect()` in production code
- [ ] All public items have doc comments (`///`)
- [ ] Error types are meaningful and contextual
- [ ] Ownership and borrowing are minimal
- [ ] No unnecessary `clone()` calls
- [ ] `unsafe` blocks have safety comments (if any)
