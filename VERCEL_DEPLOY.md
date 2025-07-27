# 🚀 Hướng dẫn Deploy Step V Studio lên Vercel

## 📋 Tại sao chọn Vercel?

✅ **Tối ưu cho Next.js** - Được tạo bởi team phát triển Next.js
✅ **Zero-config** - Tự động detect và cấu hình
✅ **Build nhanh** - 30-60 giây vs 2-3 phút GitHub Actions  
✅ **Global CDN** - Performance tối ưu toàn cầu
✅ **Preview deployments** - Mỗi PR có URL riêng
✅ **Image optimization** - Tự động tối ưu hình ảnh
✅ **Server-side features** - Hỗ trợ SSR, API routes, ISR

## 🎯 Quy trình Deploy

### Bước 1: Chuẩn bị Repository
```bash
# Push code lên GitHub
git add .
git commit -m "Setup for Vercel deployment"
git push origin master
```

### Bước 2: Setup Vercel Account
1. Truy cập [vercel.com](https://vercel.com)
2. Click **"Sign Up"** 
3. Chọn **"Continue with GitHub"**
4. Authorize Vercel access to GitHub

### Bước 3: Import Project
1. Trong Vercel Dashboard, click **"New Project"**
2. Tìm repository: **"Hieubkav/stepv_nextjs"**
3. Click **"Import"**

### Bước 4: Configure Project
Vercel sẽ tự động detect:
- ✅ Framework: **Next.js**
- ✅ Build Command: **`npm run build`**
- ✅ Output Directory: **`.next`**
- ✅ Install Command: **`npm install`**
- ✅ Development Command: **`npm run dev`**

**Không cần thay đổi gì!** Click **"Deploy"**

### Bước 5: Đợi Deploy
- ⏱️ Build time: ~30-60 giây
- 🔄 Status: Building → Deploying → Ready
- 🎉 Live URL: `https://stepv-nextjs.vercel.app`

## 🔧 Cấu hình đã tối ưu

### `next.config.ts`
```typescript
// ✅ Đã tối ưu cho Vercel
- Bỏ output: 'export' (không cần cho Vercel)
- Enable image optimization
- Bỏ basePath (Vercel hỗ trợ custom domain)
- Bỏ trailingSlash (không cần)
```

### `vercel.json`
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "regions": ["sin1"],  // Singapore region (gần VN)
  "headers": [...]      // Security headers
}
```

## 🎯 Kết quả

- **Live URL**: https://stepv-nextjs.vercel.app
- **Build time**: ~30-60 giây
- **Auto deploy**: Mỗi push lên `master`
- **Preview**: Mỗi PR có URL preview
- **Performance**: A+ trên tất cả metrics

## 🔄 Workflow mới

```bash
# 1. Thay đổi code
git add .
git commit -m "Update website"
git push origin master

# 2. Vercel tự động:
# - Detect changes
# - Build project  
# - Deploy to production
# - Update live URL

# 3. Nhận notification:
# - Email deployment success
# - Slack/Discord webhook (optional)
```

## 🎉 Hoàn tất!

Website Step V Studio giờ đã:
- ✅ Deploy tự động với Vercel
- ✅ Performance tối ưu
- ✅ Global CDN
- ✅ Image optimization
- ✅ Zero downtime deployments

**Live Demo**: [https://stepv-nextjs.vercel.app](https://stepv-nextjs.vercel.app)
