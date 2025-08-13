# 🚀 Hướng dẫn Setup Vercel cho Step V Studio

## 📋 Checklist Setup (Chỉ cần làm 1 lần)

### 1. Cấu hình GitHub Repository
- ✅ Repository: `https://github.com/Hieubkav/stepv_nextjs`
- ✅ Branch chính: `master`
- ✅ Framework: Next.js 15

### 2. Cấu hình Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. **Sign up/Login** với GitHub account
3. Click **"New Project"**
4. **Import** repository: `Hieubkav/stepv_nextjs`
5. **Deploy** (Vercel tự động detect Next.js)

### 3. Kiểm tra cấu hình
- ✅ `next.config.ts`: Tối ưu cho Vercel
- ✅ `package.json`: homepage URL = vercel.app
- ✅ `constants.ts`: URL production đã cập nhật
- ✅ `vercel.json`: Cấu hình deployment

## 🔄 Quy trình Deploy

### Tự động (Khuyến nghị)
```bash
# 1. Thực hiện thay đổi code
git add .
git commit -m "Cập nhật website"
git push origin master

# 2. Vercel tự động build và deploy
# 3. Website được deploy tại: https://dohystudio.com
```

### Thủ công (từ Vercel Dashboard)
1. Vào [vercel.com/dashboard](https://vercel.com/dashboard)
2. Chọn project **stepv-nextjs**
3. Click **"Redeploy"** nếu cần

## 🎯 Kết quả mong đợi

- **Development**: `http://localhost:3000`
- **Production**: `https://dohystudio.com`
- **Build time**: ~30-60 giây (nhanh hơn GitHub Actions)
- **Auto deploy**: Mỗi lần push lên `master`
- **Preview**: Mỗi PR có URL preview riêng

## 🔍 Troubleshooting

### Nếu deploy thất bại:
1. Kiểm tra **Actions** tab để xem lỗi
2. Đảm bảo GitHub Pages đã enable
3. Kiểm tra permissions trong Settings > Actions

### Lỗi thường gặp đã sửa:
- ✅ **".nojekyll file not found"**: Đã sửa trong workflow
- ✅ **TypeScript errors**: Đã sửa interface và imports
- ✅ **Next.js config warnings**: Đã cập nhật cấu hình
- ✅ **Image optimization warnings**: Đã thay `<img>` bằng `<Image>`

### Nếu website không hiển thị:
1. Đợi 5-10 phút sau khi deploy
2. Kiểm tra URL: `https://hieubkav.github.io/stepv_nextjs`
3. Clear browser cache

## ✅ Xác nhận Setup thành công

- [ ] Repository đã tạo và push code
- [ ] GitHub Pages đã enable với source "GitHub Actions"
- [ ] Workflow đã chạy thành công (green checkmark)
- [ ] Website accessible tại production URL
- [ ] Auto deploy hoạt động khi push code mới

---

🎉 **Setup hoàn tất!** Từ giờ chỉ cần push code lên `master` branch là website sẽ tự động cập nhật.
