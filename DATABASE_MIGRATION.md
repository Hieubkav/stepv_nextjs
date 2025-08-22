# 🗄️ Database Migration - Thêm cột Link cho Libraries

## 📋 Tổng quan

Cần thêm 2 cột mới vào bảng `libraries` trong Supabase:
- `link_url`: Lưu URL link (TEXT, nullable)
- `link_status`: Lưu trạng thái hiển thị (TEXT, default 'visible')

## 🔧 SQL Migration Commands

### 1. Thêm cột `link_url`
```sql
ALTER TABLE libraries ADD COLUMN link_url TEXT;
```

### 2. Thêm cột `link_status`
```sql
ALTER TABLE libraries ADD COLUMN link_status TEXT DEFAULT 'visible';
```

### 3. Thêm constraint cho `link_status` (tùy chọn)
```sql
ALTER TABLE libraries ADD CONSTRAINT check_link_status 
CHECK (link_status IN ('visible', 'hidden'));
```

## 📝 Hướng dẫn thực hiện

### Bước 1: Truy cập Supabase Dashboard
1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** từ sidebar

### Bước 2: Chạy Migration
1. Copy và paste các lệnh SQL ở trên
2. Chạy từng lệnh một hoặc chạy tất cả cùng lúc
3. Kiểm tra kết quả trong **Table Editor**

### Bước 3: Verify Migration
```sql
-- Kiểm tra cấu trúc bảng
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'libraries' 
ORDER BY ordinal_position;
```

## ✅ Kết quả mong đợi

Sau khi migration, bảng `libraries` sẽ có cấu trúc:

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| title | text | NO | - |
| description | text | NO | - |
| type | text | NO | - |
| pricing | text | NO | - |
| image_url | text | YES | - |
| **link_url** | **text** | **YES** | **-** |
| **link_status** | **text** | **YES** | **'visible'** |
| created_at | timestamp | NO | now() |

## 🎯 Tính năng mới

### 1. **Trong Dashboard Admin:**
- Form tạo/sửa thư viện có thêm 2 trường:
  - URL Link: Nhập link muốn mở
  - Trạng thái: Chọn Hiện/Ẩn
- Hiển thị thông tin link trong card thư viện

### 2. **Trong LibraryCard (Frontend):**
- Nút link chỉ hiện khi có URL và trạng thái = 'visible'
- Click vào nút sẽ mở trang mới
- Hiển thị trạng thái link ở cuối card

### 3. **Validation:**
- URL không bắt buộc
- Trạng thái mặc định là 'visible'
- Chỉ chấp nhận 2 giá trị: 'visible' hoặc 'hidden'

## 🚀 Test Migration

Sau khi chạy migration, test bằng cách:

1. **Tạo thư viện mới** với link
2. **Sửa thư viện cũ** thêm link
3. **Kiểm tra hiển thị** trên frontend
4. **Test click link** mở trang mới

## 🔄 Rollback (nếu cần)

Nếu cần rollback migration:

```sql
-- Xóa constraint (nếu đã tạo)
ALTER TABLE libraries DROP CONSTRAINT IF EXISTS check_link_status;

-- Xóa cột link_status
ALTER TABLE libraries DROP COLUMN IF EXISTS link_status;

-- Xóa cột link_url
ALTER TABLE libraries DROP COLUMN IF EXISTS link_url;
```

## 📞 Hỗ trợ

Nếu gặp lỗi khi migration:
1. Kiểm tra quyền admin trên Supabase
2. Đảm bảo không có dữ liệu conflict
3. Chạy từng lệnh một thay vì chạy tất cả
4. Kiểm tra logs trong Supabase Dashboard
