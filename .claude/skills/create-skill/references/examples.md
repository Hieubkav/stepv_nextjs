# Ví Dụ Skills Mẫu

Các ví dụ đơn giản để tham khảo khi tạo skill mới.

---

## Ví Dụ 1: Simple Skill (Single File)

Skill đơn giản, tất cả trong SKILL.md.

### Cấu trúc

```
.claude/skills/git/commit-helper/
├── SKILL.md
└── README.md
```

### SKILL.md

```yaml
---
name: commit-helper
description: Tạo git commit message theo chuẩn conventional commits. Dùng khi cần commit hoặc viết commit message
---

# Commit Helper

## Level 1: Overview

Tạo commit messages theo format: `type(scope): description`

### Yêu cầu
- Git repo đã init
- Đã stage changes với `git add`

### Output
- Commit message theo chuẩn conventional commits

## Level 2: Quick Start

### Quy trình

1. Stage changes: `git add .`
2. AI phân tích changes với `git diff --cached`
3. Suggest commit type (feat, fix, docs, etc.)
4. Tạo commit message
5. Run: `git commit -m "message"`

### Commit Types

- **feat**: Tính năng mới
- **fix**: Sửa bug
- **docs**: Chỉ docs
- **refactor**: Refactor code
- **test**: Thêm tests
- **chore**: Maintenance

### Ví dụ

```bash
# Feature
git commit -m "feat(auth): add login endpoint"

# Bug fix
git commit -m "fix(api): resolve token expiration"

# Docs
git commit -m "docs(readme): update install guide"
```

## Level 3: References

- Không có references (simple skill)

### Best Practices

- First line ≤ 50 ký tự
- Dùng imperative mood ("add" không phải "added")
- Include scope trong ngoặc
- Có body cho changes phức tạp
```

### README.md

```markdown
# Commit Helper

Tạo git commit messages theo chuẩn conventional commits với format type(scope): description.
```

---

## Ví Dụ 2: Multi-File Skill với References

Skill phức tạp với workflow và examples riêng.

### Cấu trúc

```
.claude/skills/database/schema-design/
├── SKILL.md
├── README.md
└── references/
    ├── workflow.md
    └── examples.md
```

### SKILL.md

```yaml
---
name: schema-design
description: Thiết kế database schema với tables, relationships, indexes. Dùng khi thiết kế database hoặc tạo ERD
---

# Schema Design

## Level 1: Overview

Giúp thiết kế database schema với best practices cho MySQL/PostgreSQL.

### Output
- ERD (Entity Relationship Diagram)
- SQL migration files
- Table definitions với indexes

## Level 2: Quick Start

### Quy trình cơ bản

1. Hiểu requirements và entities
2. Xác định relationships (1-1, 1-N, N-N)
3. Define tables và columns
4. Add indexes cho performance
5. Add foreign keys
6. Generate SQL migrations
7. Validate schema

### Ví dụ

```sql
-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Posts table
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(500),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id)
);
```

## Level 3: References

- [workflow.md](./references/workflow.md) - Quy trình 7 bước chi tiết
- [examples.md](./references/examples.md) - Ví dụ schemas cho các use cases
```

### README.md

```markdown
# Schema Design

Thiết kế database schema với tables, relationships, indexes cho MySQL/PostgreSQL.
```

### references/workflow.md (trích đoạn)

```markdown
# Database Schema Design Workflow

## Bước 1: Analyze Requirements

- List tất cả entities (Users, Posts, Comments, etc.)
- Xác định attributes cho mỗi entity
- Identify primary data types

## Bước 2: Define Relationships

- 1-1: User → Profile
- 1-N: User → Posts
- N-N: Posts ↔ Tags (cần junction table)

[... chi tiết các bước tiếp theo ...]
```

---

## Ví Dụ 3: Skill với Scripts

Skill có automation scripts hỗ trợ.

### Cấu trúc

```
.claude/skills/testing/test-runner/
├── SKILL.md
├── README.md
└── scripts/
    └── run_tests.sh
```

### SKILL.md

```yaml
---
name: test-runner
description: Chạy tests tự động với coverage report. Dùng khi chạy tests hoặc check coverage
---

# Test Runner

## Level 1: Overview

Chạy unit tests và integration tests với coverage reporting.

### Tools Required
- pytest (Python)
- jest (JavaScript)
- PHPUnit (PHP)

## Level 2: Quick Start

### Chạy Tests

```bash
# Python
./scripts/run_tests.sh python

# JavaScript
./scripts/run_tests.sh js

# PHP
./scripts/run_tests.sh php
```

### Output
- Test results với pass/fail
- Coverage report (HTML)
- Failed test details

## Level 3: References

- [scripts/run_tests.sh](./scripts/run_tests.sh) - Automation script
```

### scripts/run_tests.sh

```bash
#!/bin/bash

LANG=$1

case $LANG in
  python)
    pytest --cov=src --cov-report=html tests/
    ;;
  js)
    jest --coverage
    ;;
  php)
    phpunit --coverage-html coverage/
    ;;
  *)
    echo "Usage: $0 {python|js|php}"
    exit 1
    ;;
esac
```

---

## So Sánh Các Loại Skill

| Loại | SKILL.md | References | Scripts | Use When |
|------|----------|------------|---------|----------|
| **Simple** | <100 dòng | Không | Không | Tasks đơn giản, ít steps |
| **Multi-File** | <200 dòng | Có | Không | Cần workflow chi tiết, nhiều examples |
| **Script-Based** | <150 dòng | Tùy chọn | Có | Automation tasks, repetitive work |

---

## Tips Chọn Structure

### Dùng Simple Skill khi:
- Task chỉ có 3-5 steps
- Không cần nhiều examples
- Ít edge cases

### Dùng Multi-File Skill khi:
- Workflow > 10 steps
- Nhiều use cases khác nhau
- Cần examples chi tiết

### Dùng Script-Based Skill khi:
- Có automation scripts
- Repetitive tasks
- Complex commands

---

## Template Nhanh

### Simple Skill Template

```yaml
---
name: your-skill
description: What it does. Dùng khi [use case]
---

# Your Skill

## Level 1: Overview
[2-3 câu mô tả]

## Level 2: Quick Start
[5-7 steps]

## Level 3: References
[Links hoặc "Không có"]
```

### Multi-File Skill Template

```yaml
---
name: your-skill
description: What it does. Dùng khi [use case]
---

# Your Skill

## Level 1: Overview
[2-3 câu mô tả]

## Level 2: Quick Start
[Quy trình cơ bản, best practices]

## Level 3: References
- [workflow.md](./references/workflow.md) - Chi tiết
- [examples.md](./references/examples.md) - Ví dụ
```
