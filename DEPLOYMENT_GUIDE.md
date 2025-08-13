# 🚀 Hướng dẫn Deploy Step V Studio lên dohystudio.com

## 📋 Tổng quan

Dự án đã được cấu hình hoàn chỉnh để deploy lên Vercel với custom domain **dohystudio.com**.

## ✅ Những gì đã được cấu hình

### 1. **Cấu hình Domain**
- ✅ `src/utils/constants.ts` → URL production: `https://dohystudio.com`
- ✅ `package.json` → homepage: `https://dohystudio.com`
- ✅ `next.config.ts` → Thêm domain vào image optimization
- ✅ `vercel.json` → Cấu hình custom domain, redirects, headers

### 2. **Cấu hình Vercel**
- ✅ Framework: Next.js (auto-detect)
- ✅ Build Command: `npm run build`
- ✅ Region: Singapore (sin1) - gần VN nhất
- ✅ Security headers đã setup
- ✅ Cache optimization cho static assets

### 3. **Redirects & SSL**
- ✅ www.dohystudio.com → dohystudio.com
- ✅ HTTP → HTTPS redirect
- ✅ SSL certificate tự động (Let's Encrypt)

## 🚀 Quy trình Deploy

### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "Setup custom domain dohystudio.com"
git push origin master
```

### Bước 2: Setup Domain trong Vercel
1. Vào [vercel.com/dashboard](https://vercel.com/dashboard)
2. Chọn project **stepv-nextjs**
3. Settings → Domains → Add Domain
4. Nhập: `dohystudio.com`

### Bước 3: Cấu hình DNS Records
Tại nhà cung cấp domain (GoDaddy, Namecheap, etc.):

```
A Record:
Name: @
Value: 76.76.19.61

CNAME Record:
Name: www
Value: cname.vercel-dns.com
```

### Bước 4: Đợi DNS Propagation
- Thời gian: 5 phút - 48 giờ
- Kiểm tra: `nslookup dohystudio.com`
- Vercel sẽ tự động verify domain

## 🔧 Environment Variables

Đảm bảo các environment variables đã được setup trong Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://eqriodcmakvwbjcbbegu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Kết quả mong đợi

Sau khi hoàn tất:
- ✅ `https://dohystudio.com` → Trang chủ Step V Studio
- ✅ `https://www.dohystudio.com` → Redirect về dohystudio.com
- ✅ `https://dohystudio.com/dashboard` → Dashboard hoạt động
- ✅ SSL certificate active
- ✅ Performance A+ rating

## 🔍 Troubleshooting

### Lỗi thường gặp:

1. **Domain not verified**
   - Kiểm tra DNS records
   - Đợi DNS propagation

2. **SSL Certificate Error**
   - Đợi 5-10 phút để Vercel tạo SSL
   - Refresh browser

3. **404 Not Found**
   - Kiểm tra A record: 76.76.19.61
   - Kiểm tra CNAME: cname.vercel-dns.com

## 📚 Tài liệu tham khảo

- [docs/CUSTOM_DOMAIN_SETUP.md](docs/CUSTOM_DOMAIN_SETUP.md) - Chi tiết setup DNS
- [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) - Environment variables
- [docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md) - Quy trình deploy

## 🎉 Hoàn tất!

Website Step V Studio giờ đã sẵn sàng deploy lên **dohystudio.com** với:
- ⚡ Performance tối ưu
- 🔒 SSL certificate
- 🌍 Global CDN
- 🚀 Auto deployment
