# 🔧 Hướng dẫn thiết lập bảng Settings trong Supabase

## 📋 **Tạo bảng Settings**

Truy cập Supabase Dashboard → SQL Editor và chạy các lệnh sau:

### 1️⃣ **Tạo bảng settings**

```sql
-- Tạo bảng settings
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    label VARCHAR(200) NOT NULL,
    type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'number', 'boolean', 'textarea', 'email', 'tel', 'url')),
    category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('payment', 'contact', 'general', 'seo', 'social')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho key (để tìm kiếm nhanh)
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- Tạo index cho category (để filter theo danh mục)
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings(category);

-- Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON public.settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2️⃣ **Thiết lập Row Level Security (RLS)**

```sql
-- Bật RLS cho bảng settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Chỉ cho phép authenticated users đọc settings
CREATE POLICY "Allow authenticated users to read settings" ON public.settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Chỉ cho phép authenticated users tạo settings
CREATE POLICY "Allow authenticated users to create settings" ON public.settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Chỉ cho phép authenticated users cập nhật settings
CREATE POLICY "Allow authenticated users to update settings" ON public.settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Chỉ cho phép authenticated users xóa settings
CREATE POLICY "Allow authenticated users to delete settings" ON public.settings
    FOR DELETE USING (auth.role() = 'authenticated');
```

### 3️⃣ **Thêm dữ liệu mặc định**

```sql
-- Thêm các settings mặc định cho thanh toán và liên hệ
INSERT INTO public.settings (key, value, label, type, category, description) VALUES
-- Payment settings
('bank_name', '', 'Tên ngân hàng', 'text', 'payment', 'Tên ngân hàng nhận thanh toán'),
('bank_account', '', 'Số tài khoản', 'text', 'payment', 'Số tài khoản ngân hàng'),
('bank_account_name', '', 'Tên chủ tài khoản', 'text', 'payment', 'Tên chủ tài khoản ngân hàng'),
('payment_qr_code', '', 'Mã QR thanh toán', 'url', 'payment', 'Link ảnh mã QR thanh toán'),

-- Contact settings
('contact_email', '', 'Email liên hệ', 'email', 'contact', 'Email chính để khách hàng liên hệ'),
('contact_phone', '', 'Số điện thoại', 'tel', 'contact', 'Số điện thoại liên hệ'),
('contact_address', '', 'Địa chỉ', 'textarea', 'contact', 'Địa chỉ văn phòng/studio'),

-- General settings
('site_name', 'Step V Studio', 'Tên website', 'text', 'general', 'Tên hiển thị của website'),
('site_description', 'Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp', 'Mô tả website', 'textarea', 'general', 'Mô tả ngắn về website'),

-- SEO settings
('meta_title', 'Step V Studio - Chuyên gia hình ảnh 3D', 'Meta Title', 'text', 'seo', 'Tiêu đề SEO cho trang chủ'),
('meta_description', 'Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp. Tạo ra, thu hút, chuyển đổi.', 'Meta Description', 'textarea', 'seo', 'Mô tả SEO cho trang chủ'),
('meta_keywords', '3D, hình ảnh 3D, nước hoa, làm đẹp, thương hiệu', 'Meta Keywords', 'text', 'seo', 'Từ khóa SEO'),

-- Social settings
('facebook_url', '', 'Facebook URL', 'url', 'social', 'Link trang Facebook'),
('instagram_url', '', 'Instagram URL', 'url', 'social', 'Link trang Instagram'),
('youtube_url', '', 'YouTube URL', 'url', 'social', 'Link kênh YouTube'),
('tiktok_url', '', 'TikTok URL', 'url', 'social', 'Link trang TikTok')

ON CONFLICT (key) DO NOTHING;
```

## 🔐 **Kiểm tra quyền truy cập**

Sau khi tạo xong, kiểm tra bằng cách:

```sql
-- Kiểm tra bảng đã tạo thành công
SELECT * FROM public.settings LIMIT 5;

-- Kiểm tra RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'settings';

-- Kiểm tra indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'settings';
```

## 🎯 **Cách sử dụng trong dự án**

### Trong Admin Dashboard:
1. Truy cập `/dashboard`
2. Click tab "Cài đặt"
3. Quản lý các settings theo danh mục

### Trong code:
```tsx
import { useSettings } from '@/hooks/useSettings';

function MyComponent() {
  const { getSettingValue } = useSettings();
  
  const bankName = getSettingValue('bank_name', 'Chưa cài đặt');
  const contactEmail = getSettingValue('contact_email', 'info@stepvstudio.com');
  
  return (
    <div>
      <p>Ngân hàng: {bankName}</p>
      <p>Email: {contactEmail}</p>
    </div>
  );
}
```

## 🚨 **Lưu ý quan trọng**

1. **Backup trước khi chạy SQL**: Luôn backup database trước khi thực hiện thay đổi
2. **Kiểm tra RLS**: Đảm bảo RLS policies hoạt động đúng
3. **Test authentication**: Kiểm tra chỉ user đã đăng nhập mới truy cập được
4. **Monitor performance**: Theo dõi hiệu suất với indexes đã tạo

## 📞 **Hỗ trợ**

Nếu gặp vấn đề, kiểm tra:
- Supabase logs trong Dashboard
- Browser console cho lỗi frontend
- Network tab để xem API calls
