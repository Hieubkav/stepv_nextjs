# Scripts Hỗ Trợ

Các scripts tiện ích để quản lý skill system.

---

## Scripts Chính

### 1. `list_skills.py`

**Chức năng**: Liệt kê tất cả skills đã đăng ký

**Sử dụng**:
```bash
python .claude/skills/meta/create-skill/scripts/list_skills.py
```

**Output**: Danh sách skills với numbering

---

### 2. `cleanup_duplicates.py`

**Chức năng**: Xóa skills trùng lặp, giữ lại occurrence cuối cùng

**Sử dụng**:
```bash
python .claude/skills/meta/create-skill/scripts/cleanup_duplicates.py
```

**Khi nào dùng**:
- Sau khi edit thủ công gây trùng lặp
- Sau multiple merges
- Cleanup định kỳ

---

### 3. `update_active_skills.py`

**Chức năng**: Batch update active_skill.md (thêm/xóa nhiều skills)

⚠️ **CẢNH BÁO**: Script này modify active_skill.md. Backup trước!

**Sử dụng**:
```bash
python .claude/skills/meta/create-skill/scripts/update_active_skills.py
```

**Khi nào dùng**:
- Batch add/remove nhiều skills
- Merge skills

---

### 4. `analyze_active_skills.py`

**Chức năng**: Phân tích size và suggest optimizations

**Sử dụng**:
```bash
python .claude/skills/meta/create-skill/scripts/analyze_active_skills.py
```

**Output**: Statistics và recommendations

---

### 5. `generate_skill_index.py` ⚠️ DEPRECATED

**Status**: Không còn dùng nữa sau khi đơn giản hóa hệ thống

**Lý do**: Hệ thống hiện tại chỉ dùng `active_skill.md` trực tiếp (format compact), không cần skill_index.md hay split files nữa

**Giữ lại**: Chỉ để tham khảo

---

## Best Practices

### Trước khi chạy
- ✅ Backup active_skill.md
- ✅ Review script constants nếu modify
- ✅ Test với subset nhỏ trước

### Sau khi chạy
- ✅ Verify với `list_skills.py`
- ✅ Check không có duplicates
- ✅ Test skill activation
- ✅ Commit với message rõ ràng

### Maintenance định kỳ
- Chạy `list_skills.py` hàng tháng để audit
- Chạy `cleanup_duplicates.py` nếu phát hiện trùng
- Update scripts khi skill system thay đổi

---

## Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Script fails encoding error | Check UTF-8 encoding, Python 3.7+ |
| Changes không apply | Verify file paths, check permissions |
| Duplicates vẫn còn | Chạy lại cleanup_duplicates.py |
| Script không tìm thấy file | Update absolute paths trong script |

---

## File Paths

```
Active Skills: .claude/hook/choose_skill.md/active_skill.md
Scripts: .claude/skills/meta/create-skill/scripts/
```
