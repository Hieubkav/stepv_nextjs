# Validation Checklist

Checklist đơn giản để kiểm tra skill trước khi hoàn thành.

---

## 1. Cấu Trúc Files

### Bắt buộc
- [ ] **SKILL.md** có trong thư mục đúng
- [ ] **README.md** có và < 100 ký tự, tiếng Việt
- [ ] Tên thư mục khớp với `name` trong frontmatter

### Tùy chọn (nếu có)
- [ ] **references/** chứa workflow.md, examples.md
- [ ] **scripts/** chứa scripts hỗ trợ
- [ ] Mỗi reference file < 300 dòng

---

## 2. YAML Frontmatter

### Cấu trúc
- [ ] Có `---` đầu và cuối
- [ ] YAML syntax đúng (spaces, không tabs)
- [ ] Có field `name`
- [ ] Có field `description`

### Field `name`
- [ ] Chỉ chữ thường, số, dấu gạch ngang (-)
- [ ] Không có UPPERCASE, underscore (_), spaces
- [ ] Độ dài ≤ 64 ký tự
- [ ] Khớp với tên thư mục

**Ví dụ:**
- ✅ `commit-helper`, `schema-design`, `api-v2`
- ❌ `Commit_Helper`, `Schema Design`, `api!`

### Field `description`
- [ ] Độ dài ≤ 1024 ký tự
- [ ] Có "Skill làm gì?"
- [ ] Có "Khi nào dùng?"
- [ ] Có trigger words users sẽ nói

**Format tốt:**
```
[Skill làm gì] + [Khi nào dùng] + [Key triggers]
```

**Ví dụ:**
```yaml
description: Tạo git commit message theo chuẩn. Dùng khi cần commit hoặc viết commit message
```

---

## 3. Nội Dung SKILL.md

### Cấu trúc 3 Levels
- [ ] **Level 1: Overview** - Mô tả ngắn gọn (2-3 câu)
- [ ] **Level 2: Quick Start** - Quy trình cơ bản
- [ ] **Level 3: References** - Links đến files chi tiết

### Độ dài
- [ ] SKILL.md < 200 dòng
- [ ] Level 1 < 30 dòng
- [ ] Level 2 < 100 dòng
- [ ] Chi tiết bỏ vào references/

### Nội dung
- [ ] Instructions rõ ràng, step-by-step
- [ ] Có ít nhất 1 ví dụ cụ thể
- [ ] Code blocks có specify language
- [ ] Links đến references đúng

---

## 4. Chất Lượng Nội Dung

### Instructions
- [ ] Viết cho AI Agent, không phải humans
- [ ] Các bước cụ thể, không mơ hồ
- [ ] Có handle edge cases
- [ ] Có error handling

### Examples
- [ ] Ví dụ realistic và practical
- [ ] Code/commands chạy được
- [ ] Cover common use cases

### Dependencies
- [ ] List tất cả tools cần thiết
- [ ] Mention packages/libraries nếu có
- [ ] External services documented nếu có

---

## 5. Testing

### Activation Test
- [ ] Skill activate với trigger words
- [ ] AI Agent load skill đúng
- [ ] Không conflict với skills khác

### Functionality Test
- [ ] Follow instructions hoạt động đúng
- [ ] Examples chạy thành công
- [ ] Scripts execute OK (nếu có)

### Test Cases
1. Hỏi câu match description → Verify skill activates
2. Run examples từ docs → Verify outputs
3. Test với invalid inputs → Verify error handling

---

## 6. Registration

### active_skill.md
- [ ] Đã thêm skill vào active_skill.md
- [ ] Format đúng: `**name**: Description. Path | Triggers: "x", "y"`
- [ ] Triggers có cả tiếng Việt và English (3-5 triggers)

**Ví dụ:**
```markdown
- **commit-helper**: Tạo git commit message theo chuẩn conventional commits. `\.claude\skills\git\commit-helper` | Triggers: "commit", "git commit", "commit message"
```

---

## 7. Security (nếu cần)

### Permissions
- [ ] Read-only skills dùng `allowed-tools: Read, Grep, Glob`
- [ ] Không hardcode credentials
- [ ] No API keys trong code

### Scripts
- [ ] Scripts có proper shebang (`#!/bin/bash`)
- [ ] Execute permissions đúng
- [ ] Input validation implemented

---

## 8. Final Checklist

Trước khi hoàn thành:

- [ ] ✅ Tất cả validation checks pass
- [ ] ✅ Test với real queries
- [ ] ✅ YAML valid
- [ ] ✅ File structure đúng
- [ ] ✅ README.md < 100 ký tự, tiếng Việt
- [ ] ✅ Đã đăng ký trong active_skill.md
- [ ] ✅ Test với trigger words
- [ ] ✅ No errors trong logs
- [ ] ✅ Documentation đầy đủ

---

## Common Errors & Solutions

| Lỗi | Giải pháp |
|-----|-----------|
| Skill không activate | Thêm trigger words cụ thể vào description |
| YAML parse error | Check indentation (spaces), verify `---` |
| Name không match folder | Đổi tên folder hoặc update `name` field |
| Description quá mơ hồ | Thêm use cases và trigger words |
| SKILL.md quá dài | Chuyển chi tiết sang workflow.md |
| Links broken | Dùng relative paths, verify file tồn tại |

---

## Quick Validation Flow

```
1. ✅ Files → Section 1
2. ✅ YAML → Section 2
3. ✅ Content → Section 3
4. ✅ Quality → Section 4
5. ✅ Testing → Section 5
6. ✅ Registration → Section 6
7. ✅ Security → Section 7
8. ✅ Final → Section 8

Tất cả pass → ✅ Skill ready!
```
