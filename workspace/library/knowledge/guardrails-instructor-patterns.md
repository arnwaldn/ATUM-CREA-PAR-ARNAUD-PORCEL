# Guardrails & Instructor Patterns
## ULTRA-CREATE v27.3 Knowledge File

> **Purpose**: Output validation, structured LLM responses, and safety layers for AI applications.

---

## Overview

Two complementary approaches for reliable AI outputs:

| Library | Purpose | Best For |
|---------|---------|----------|
| **Guardrails AI** | Input/Output validation with risk detection | Safety, compliance, content filtering |
| **Instructor** | Structured data extraction with Pydantic | Schema enforcement, type-safe outputs |

---

## Guardrails AI

### Core Concepts

```
User Input → [INPUT GUARD] → LLM → [OUTPUT GUARD] → Validated Output
                  │                       │
                  ▼                       ▼
            Risk Detection           Risk Detection
            (validators)             (validators)
```

### Installation

```bash
pip install guardrails-ai
guardrails hub install hub://guardrails/regex_match
guardrails hub install hub://guardrails/toxic_language
```

### Basic Usage

```python
from guardrails import Guard
from guardrails.hub import RegexMatch, ToxicLanguage

# Create guard with validators
guard = Guard().use_many(
    RegexMatch(regex=r"^\d{3}-\d{2}-\d{4}$", on_fail="exception"),  # SSN format
    ToxicLanguage(on_fail="filter")  # Remove toxic content
)

# Validate LLM output
result = guard(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Generate a SSN"}]
)

print(result.validated_output)  # Only if validation passes
```

### Popular Validators (Guardrails Hub)

| Validator | Purpose | Usage |
|-----------|---------|-------|
| `ToxicLanguage` | Detect harmful content | Safety |
| `PII` | Detect/redact personal info | Privacy |
| `RegexMatch` | Pattern matching | Format validation |
| `ValidJSON` | JSON structure validation | Data integrity |
| `Factual` | Fact checking | Accuracy |
| `SensitiveTopic` | Block sensitive topics | Compliance |
| `Hallucination` | Detect hallucinations | Reliability |

### Guard Patterns

```python
# Pattern 1: Input + Output Guards
input_guard = Guard().use(PII(on_fail="fix"))
output_guard = Guard().use_many(
    ToxicLanguage(on_fail="filter"),
    ValidJSON(on_fail="reask")
)

# Pattern 2: Structured Output
from pydantic import BaseModel

class UserInfo(BaseModel):
    name: str
    email: str
    age: int

guard = Guard.from_pydantic(UserInfo)
result = guard(model="gpt-4o", prompt="Extract user info from: ...")
# result.validated_output is UserInfo instance
```

### Failure Actions

| Action | Behavior |
|--------|----------|
| `exception` | Raise ValidationError |
| `reask` | Retry with error feedback |
| `filter` | Remove invalid content |
| `fix` | Attempt automatic correction |
| `noop` | Log and continue |

---

## Instructor

### Core Concepts

```
Pydantic Model → instructor.patch → LLM → Validated Model Instance
                      │
                      ▼
              Automatic retries on
              validation failures
```

### Installation

```bash
pip install instructor
```

### Basic Usage

```python
import instructor
from pydantic import BaseModel, Field
from openai import OpenAI

# Patch OpenAI client
client = instructor.from_openai(OpenAI())

# Define output schema
class UserExtract(BaseModel):
    name: str = Field(description="User's full name")
    age: int = Field(ge=0, le=150, description="User's age")
    email: str = Field(pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")

# Extract structured data
user = client.chat.completions.create(
    model="gpt-4o",
    response_model=UserExtract,
    max_retries=3,
    messages=[{"role": "user", "content": "John Doe, 30, john@example.com"}]
)

print(user)  # UserExtract(name='John Doe', age=30, email='john@example.com')
```

### Multi-Provider Support (15+)

```python
# OpenAI
client = instructor.from_provider("openai/gpt-4o")

# Anthropic
client = instructor.from_provider("anthropic/claude-3-5-sonnet")

# Google
client = instructor.from_provider("google/gemini-2.5-flash")

# Ollama (local)
client = instructor.from_provider("ollama/llama3")

# DeepSeek
client = instructor.from_provider("deepseek/deepseek-chat")
```

### Advanced Patterns

#### Complex Nested Schemas

```python
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from enum import Enum

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Task(BaseModel):
    title: str = Field(min_length=5)
    priority: Priority
    estimated_hours: Optional[float] = Field(None, gt=0)

    @field_validator('estimated_hours')
    @classmethod
    def validate_hours(cls, v):
        if v and v % 0.5 != 0:
            raise ValueError('Must be in 0.5 increments')
        return v

class Project(BaseModel):
    name: str
    tasks: List[Task] = Field(min_length=1)

project = client.chat.completions.create(
    model="gpt-4o",
    response_model=Project,
    messages=[{"role": "user", "content": "Create a web app project plan"}]
)
```

#### Streaming Partial Results

```python
from instructor import Partial

# Stream partial object as it's generated
for partial_user in client.chat.completions.create_partial(
    model="gpt-4o",
    response_model=UserExtract,
    messages=[{"role": "user", "content": "Extract user info..."}]
):
    print(f"Partial: {partial_user}")
    # Partial: UserExtract(name='John', age=None, email=None)
    # Partial: UserExtract(name='John Doe', age=30, email=None)
    # Partial: UserExtract(name='John Doe', age=30, email='john@example.com')
```

#### Iterable Extraction (Lists)

```python
from typing import Iterable

class Person(BaseModel):
    name: str
    role: str

# Extract multiple items
people = client.chat.completions.create_iterable(
    model="gpt-4o",
    response_model=Person,
    messages=[{"role": "user", "content": "List team members: CEO John, CTO Jane"}]
)

for person in people:
    print(person)  # Streams each Person as extracted
```

---

## Combining Guardrails + Instructor

### Pattern: Defense in Depth

```python
import instructor
from guardrails import Guard
from guardrails.hub import ToxicLanguage, PII
from pydantic import BaseModel

# Layer 1: Input guard (before LLM)
input_guard = Guard().use(PII(on_fail="fix"))

# Layer 2: Structured output (Instructor)
class SafeResponse(BaseModel):
    answer: str
    confidence: float

client = instructor.from_openai(OpenAI())

# Layer 3: Output guard (after LLM)
output_guard = Guard().use(ToxicLanguage(on_fail="filter"))

def safe_query(user_input: str) -> SafeResponse:
    # Step 1: Validate input
    clean_input = input_guard.validate(user_input)

    # Step 2: Get structured output
    response = client.chat.completions.create(
        model="gpt-4o",
        response_model=SafeResponse,
        messages=[{"role": "user", "content": clean_input}]
    )

    # Step 3: Validate output
    validated = output_guard.validate(response.answer)
    response.answer = validated

    return response
```

---

## Integration with ULTRA-CREATE

### Auto-Loading

This knowledge is auto-loaded when intents match:
- `guardrails`, `instructor`, `validation`, `safety`, `structured output`

### Agent Integration

| Agent | Uses |
|-------|------|
| `security-auditor` | Guardrails for content validation |
| `api-designer` | Instructor for response schemas |
| `llm-integration-expert` | Both for production pipelines |

### Template Integration

Add to any AI template:

```python
# requirements.txt
guardrails-ai>=0.5.0
instructor>=1.0.0

# In agent code
from guardrails import Guard
import instructor
```

---

## Best Practices

### 1. Layer Your Validation

```
Input → PII/Injection Guard → LLM → Schema Validation → Toxicity Guard → Output
```

### 2. Use Appropriate Retry Strategies

```python
# Instructor: automatic retries with feedback
client.create(response_model=MyModel, max_retries=3)

# Guardrails: reask on failure
Guard().use(Validator(on_fail="reask"))
```

### 3. Schema Design

```python
# Good: Specific, constrained fields
class Order(BaseModel):
    amount: float = Field(gt=0, le=10000)
    currency: Literal["USD", "EUR", "GBP"]

# Bad: Overly permissive
class Order(BaseModel):
    amount: Any
    currency: str
```

### 4. Production Checklist

- [ ] PII detection on inputs
- [ ] Toxicity filtering on outputs
- [ ] Schema validation for structured data
- [ ] Retry limits to prevent loops
- [ ] Logging for validation failures
- [ ] Fallback responses for failures

---

## Resources

- [Guardrails Hub](https://hub.guardrailsai.com/) - Pre-built validators
- [Instructor Docs](https://python.useinstructor.com/) - Full documentation
- [Pydantic V2](https://docs.pydantic.dev/) - Schema definitions

---

*ULTRA-CREATE v27.3 | Guardrails + Instructor Patterns*
