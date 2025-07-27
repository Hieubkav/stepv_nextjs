# 🚀 Hướng dẫn Setup GitHub Pages cho Step V Studio

## 📋 Checklist Setup (Chỉ cần làm 1 lần)

### 1. Cấu hình GitHub Repository
- ✅ Repository: `https://github.com/Hieubkav/stepv_nextjs`
- ✅ Branch chính: `master`
- ✅ Workflow file: `.github/workflows/deploy.yml`

### 2. Cấu hình GitHub Pages
1. Vào repository **Settings** > **Pages**
2. Chọn **Source**: `GitHub Actions`
3. Không cần chọn branch (workflow sẽ tự động handle)

### 3. Kiểm tra cấu hình
- ✅ `next.config.ts`: basePath = `/stepv_nextjs`
- ✅ `package.json`: homepage URL đã cập nhật
- ✅ `constants.ts`: URL production đã cập nhật

## 🔄 Quy trình Deploy

### Tự động (Khuyến nghị)
```bash
# 1. Thực hiện thay đổi code
git add .
git commit -m "Cập nhật website"
git push origin master

# 2. Workflow tự động chạy
# 3. Website được deploy tại: https://hieubkav.github.io/stepv_nextjs
```

### Thủ công (từ Actions tab)
1. Vào repository > **Actions**
2. Chọn workflow "Deploy Step V Studio to GitHub Pages"
3. Click **Run workflow** > **Run workflow**

## 🎯 Kết quả mong đợi

- **Development**: `http://localhost:3000`
- **Production**: `https://hieubkav.github.io/stepv_nextjs`
- **Build time**: ~2-3 phút
- **Auto deploy**: Mỗi lần push lên `master`

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
