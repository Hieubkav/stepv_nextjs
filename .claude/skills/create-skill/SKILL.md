---
name: create-skill
description: Tạo skill mới cho AI Agent theo đúng chuẩn. Dùng khi cần tạo/viết skill mới hoặc làm việc với file SKILL.md
---

# Create Skill

## Level 1: Overview

Meta skill giúp tạo các Agent Skills mới theo đúng chuẩn cho hệ thống AI Agent.

### Skill này làm gì?

1. Hướng dẫn xác định scope của skill (One Skill = One Capability)
2. Kiểm tra trùng lặp với skills hiện có
3. Tạo cấu trúc thư mục và files chuẩn
4. Viết SKILL.md với frontmatter đúng format
5. Đăng ký skill vào active_skill.md
6. Validate và test skill

### Yêu cầu

- Truy cập thư mục `.claude/skills/`
- Biết rõ mục đích của skill cần tạo
- Xác định được group skill phù hợp

---

## Level 2: Quick Start

### Quy trình cơ bản

```bash
# 1. Xác định scope
#    - Skill làm gì?
#    - Khi nào dùng?
#    - One Skill = One Capability

# 2. Kiểm tra trùng lặp
#    - Đọc active_skill.md
#    - So sánh với skills hiện có
#    - Quyết định: tạo mới/merge/refine

# 3. Tạo cấu trúc
mkdir -p .claude/skills/{group}/{skill-name}
mkdir -p .claude/skills/{group}/{skill-name}/references

# 4. Tạo files
#    - SKILL.md với frontmatter
#    - README.md (<100 ký tự, tiếng Việt)
#    - references/ (nếu cần)

# 5. Đăng ký và Test
#    - Thêm vào active_skill.md
#    - Format: **skill-name**: Description. Path | Triggers: "x", "y"
#    - Test với trigger words
```

### Nguyên tắc quan trọng

- **One Skill = One Capability** - Tập trung, không làm quá nhiều thứ
- **SKILL.md < 200 dòng** - Chi tiết bỏ vào references/
- **README.md < 100 ký tự** - Mô tả ngắn gọn bằng tiếng Việt
- **Kiểm tra trùng lặp trước** - Tránh tạo skills giống nhau
- **Đăng ký ngay** - Thêm vào active_skill.md sau khi tạo

### Cấu trúc thư mục

```
.claude/skills/{group}/{skill-name}/
├── SKILL.md         # Bắt buộc: <200 dòng, 3 levels
├── README.md        # Bắt buộc: <100 ký tự, tiếng Việt
├── references/      # Tùy chọn: Chi tiết
│   ├── workflow.md
│   ├── examples.md
|   ├── feature1.md
|   ├── feature2.md
|   ├── feature3.md
|   ├── advanced_feature.md
|   ├── template.md
|
├── assets/
│   ├── font (file)
│   ├── image.png
|   ├── icon.svg
|
└── scripts/         # Tùy chọn: Scripts hỗ trợ
```

### Template SKILL.md

```yaml
---
name: skill-name
description: Mô tả ngắn gọn + khi nào dùng + trigger words
---

# Skill Name

## Level 1: Overview
- Skill làm gì?
- Yêu cầu gì?
- Output ra sao?

## Level 2: Quick Start
- Các bước cơ bản
- Ví dụ sử dụng
- Best practices

## Level 3: References
- Link đến workflow.md
- Link đến examples.md
- Link đến files chi tiết khác
```

---

## Level 3: References

### Chi tiết

- [workflow.md](./references/workflow.md) - Quy trình 6 bước chi tiết
- [examples.md](./references/examples.md) - Ví dụ skills mẫu
- [validation.md](./references/validation.md) - Checklist validation

### Scripts hỗ trợ

- `list_skills.py` - Liệt kê tất cả skills đã đăng ký
- `cleanup_duplicates.py` - Xóa skills trùng lặp trong active_skill.md

### Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Skill không hoạt động | Kiểm tra đã đăng ký trong active_skill.md chưa |
| SKILL.md quá dài | Chuyển chi tiết sang references/ |
| Description không rõ | Thêm trigger words cụ thể |
| Skill bị trùng | Chạy cleanup_duplicates.py |

---

## Checklist hoàn thành

Trước khi kết thúc, đảm bảo:

- [ ] SKILL.md đã tạo với frontmatter đúng
- [ ] README.md < 100 ký tự, tiếng Việt
- [ ] Đã đăng ký trong active_skill.md
- [ ] Test skill với trigger words
- [ ] Validate cấu trúc và nội dung
