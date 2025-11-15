# Workflow Tạo Skill

Quy trình 6 bước đơn giản để tạo một Agent Skill hoàn chỉnh.

---

## Bước 1: Xác Định Scope

### Hỏi các câu sau:

- Skill này làm gì? (chức năng chính)
- Khi nào AI Agent nên dùng skill này?
- Cần tools gì? (Read, Edit, Execute, etc.)
- Input/Output như thế nào?

### Nguyên tắc: One Skill = One Capability

✅ **Tốt**: 
- "Tạo skill mới với SKILL.md và frontmatter"
- "Phân tích PDF và trích xuất bảng"

❌ **Quá rộng**: 
- "Xử lý tài liệu"
- "Làm việc với dữ liệu"

### Ví dụ

```
Skill: create-skill
Scope: Tạo Agent Skills mới theo chuẩn
When: User nói "tạo skill", "create skill", "SKILL.md"
Tools: Read, Edit, Create, Execute
Input: Yêu cầu tạo skill từ user
Output: SKILL.md, README.md, references/, đăng ký vào active_skill.md
```

---

## Bước 2: Kiểm Tra Trùng Lặp

### Tại sao quan trọng?

- Tránh tạo skills giống nhau
- Tối ưu hóa skill system
- Dễ quản lý và maintain

### Cách kiểm tra

1. **Đọc active_skill.md**
```bash
Read E:\Laravel\study\skill_system\.claude\hook\choose_skill.md\active_skill.md
```

2. **So sánh với skill mới**
- Tên skill có giống không?
- Description có overlap không?
- Trigger words có trùng không?
- Cùng group/domain không?

3. **Quyết định**

| Mức độ trùng | Hành động |
|-------------|-----------|
| **Cao (>70%)** | Merge vào skill hiện có hoặc refine skill cũ |
| **Trung (40-70%)** | Xem xét cẩn thận, có thể tạo mới với scope khác |
| **Thấp (<40%)** | OK - tạo skill mới |

---

## Bước 3: Tạo Cấu Trúc

### 3.1 Chọn Group Skill

Các groups phổ biến:
- `meta/` - Meta skills (create-skill, manage-skills)
- `database/` - Database, schema, queries
- `api/` - API design, contracts, docs
- `frontend/` - UI/UX, React, components
- `backend/` - Laravel, services, patterns
- `testing/` - Tests, QA, debugging

### 3.2 Tạo Thư Mục

```bash
# Tạo thư mục skill
mkdir -p .claude/skills/{group}/{skill-name}

# Tạo thư mục references nếu cần
mkdir -p .claude/skills/{group}/{skill-name}/references
```

### 3.3 Cấu Trúc Chuẩn

```
.claude/skills/{group}/{skill-name}/
├── SKILL.md         # Bắt buộc
├── README.md        # Bắt buộc
├── references/      # Tùy chọn
│   ├── workflow.md
│   └── examples.md
└── scripts/         # Tùy chọn
```

---

## Bước 4: Viết SKILL.md

### 4.1 Frontmatter

```yaml
---
name: skill-name  # lowercase, dấu gạch ngang
description: Mô tả ngắn + khi nào dùng + trigger words
---
```

**Công thức description tốt:**
```
[Skill làm gì] + [Khi nào dùng] + [Trigger words quan trọng]
```

**Ví dụ:**
```yaml
description: Tạo skill mới cho AI Agent theo đúng chuẩn. Dùng khi cần tạo/viết skill mới hoặc làm việc với file SKILL.md
```

### 4.2 Cấu Trúc 3 Levels

```markdown
# Skill Name

## Level 1: Overview
- Skill làm gì?
- Yêu cầu gì?
- Output như thế nào?

## Level 2: Quick Start
- Quy trình cơ bản (6-10 bước)
- Ví dụ code/commands
- Best practices
- Nguyên tắc quan trọng

## Level 3: References
- Link đến workflow.md (chi tiết)
- Link đến examples.md (ví dụ)
- Link đến validation.md (checklist)
```

### 4.3 Giới Hạn

- **SKILL.md < 200 dòng** - Chi tiết bỏ vào references/
- **Level 1 < 30 dòng** - Tóm tắt ngắn gọn
- **Level 2 < 100 dòng** - Quick start đủ dùng
- **Level 3** - Chỉ links, không copy content

---

## Bước 5: Tạo Supporting Files

### 5.1 README.md

```markdown
# Skill Name

Mô tả ngắn gọn bằng tiếng Việt (<100 ký tú).
```

**Ví dụ:**
```markdown
# Create Skill

Meta skill tạo Agent Skills mới theo chuẩn với SKILL.md, frontmatter và cấu trúc thư mục đúng format.
```

### 5.2 References (tùy chọn)

#### references/workflow.md
- Quy trình chi tiết step-by-step
- <300 dòng
- Nhiều ví dụ cụ thể

#### references/examples.md
- Ví dụ skills mẫu
- Templates code
- Use cases thực tế

#### references/validation.md
- Checklist kiểm tra
- Common errors
- Troubleshooting

---

## Bước 6: Đăng Ký và Đồng Bộ

### 6.1 Đăng Ký vào active_skill.md

**Format chuẩn:**
```markdown
- **skill-name**: Mô tả ngắn (<200 ký tự). `\.claude\skills\{group}\{skill-name}` | Triggers: "trigger1", "trigger2", "trigger3"
```

**Ví dụ:**
```markdown
- **create-skill**: Tạo Agent Skills mới theo chuẩn với SKILL.md, frontmatter, cấu trúc thư mục. `\.claude\skills\meta\create-skill` | Triggers: "tạo skill", "create skill", "SKILL.md"
```

### 6.2 Chọn Trigger Words

**3-5 triggers quan trọng nhất:**
- Cả tiếng Việt và English
- User thường nói
- Cụ thể, không chung chung

**Ví dụ tốt:**
```
"tạo skill", "create skill", "SKILL.md", "new skill"
```

**Ví dụ không tốt:**
```
"skill", "làm", "tạo", "work"  # Quá chung chung
```

---

## Checklist Hoàn Thành

Trước khi kết thúc, đảm bảo:

### Files
- [ ] SKILL.md tạo với frontmatter đúng (<200 dòng)
- [ ] README.md ngắn gọn (<100 ký tự, tiếng Việt)
- [ ] references/ có workflow.md và examples.md (nếu cần)

### Registration
- [ ] Đã thêm vào active_skill.md
- [ ] Format đúng: `**skill-name**: Description. Path | Triggers: "x", "y"`
- [ ] Triggers có cả VN và EN

### Validation
- [ ] Frontmatter YAML hợp lệ
- [ ] Name lowercase, dấu gạch ngang
- [ ] Description rõ ràng với trigger words
- [ ] SKILL.md có đủ 3 levels

### Testing
- [ ] Test với trigger words
- [ ] Skill activate đúng
- [ ] Load được content

---

## Ví Dụ Hoàn Chỉnh

### Skill: simple-calculator

**File: SKILL.md**
```yaml
---
name: simple-calculator
description: Tính toán đơn giản với các phép +, -, *, /. Dùng khi cần tính toán nhanh hoặc làm máy tính
---

# Simple Calculator

## Level 1: Overview

Skill tính toán đơn giản hỗ trợ 4 phép toán cơ bản.

### Yêu cầu
- Input: Biểu thức toán học (VD: "2 + 2", "10 * 5")
- Output: Kết quả tính toán

## Level 2: Quick Start

### Sử dụng

1. User nhập biểu thức: "tính 2 + 2"
2. Skill parse biểu thức
3. Thực hiện phép tính
4. Trả về kết quả: "4"

### Ví dụ

```python
calculate("2 + 2")  # Output: 4
calculate("10 * 5")  # Output: 50
calculate("100 / 4")  # Output: 25
```

## Level 3: References

- [examples.md](./references/examples.md) - Ví dụ chi tiết
```

**File: README.md**
```markdown
# Simple Calculator

Máy tính đơn giản hỗ trợ phép +, -, *, / cho các phép toán cơ bản.
```

**Đăng ký trong active_skill.md:**
```markdown
- **simple-calculator**: Tính toán đơn giản với +, -, *, /. Dùng khi cần tính toán nhanh. `\.claude\skills\utility\simple-calculator` | Triggers: "tính toán", "calculate", "máy tính"
```

---

## Tips & Best Practices

### Do's ✅

- **One Skill = One Capability** - Tập trung một chức năng
- **Check duplicate trước** - Tránh tạo skills giống nhau
- **SKILL.md ngắn gọn** - Chi tiết bỏ references/
- **README bằng tiếng Việt** - Dễ đọc cho người Việt
- **Test với trigger words** - Đảm bảo activate đúng
- **Đăng ký ngay** - Thêm vào active_skill.md sau khi tạo

### Don'ts ❌

- **Không tạo mega-skills** - Làm quá nhiều thứ
- **Không skip duplicate check** - Dẫn đến skills trùng lặp
- **Không viết SKILL.md quá dài** - Khó đọc và maintain
- **Không quên đăng ký** - Skill sẽ không hoạt động

---

## Troubleshooting

### Skill không activate

**Nguyên nhân:**
- Chưa đăng ký trong active_skill.md
- Trigger words không rõ ràng
- Description quá chung chung

**Giải pháp:**
- Kiểm tra active_skill.md
- Thêm trigger words cụ thể hơn
- Cập nhật description với use cases rõ ràng

### SKILL.md quá dài

**Nguyên nhân:**
- Viết quá chi tiết trong Level 1, 2
- Không dùng references/

**Giải pháp:**
- Chuyển chi tiết sang workflow.md
- Chuyển ví dụ sang examples.md
- Level 1, 2 chỉ giữ essentials

### Wrong skill activates

**Nguyên nhân:**
- Trigger words overlap với skill khác
- Description không đủ specific

**Giải pháp:**
- Review active_skill.md, tìm skills tương tự
- Make triggers more specific
- Update description với context rõ hơn
