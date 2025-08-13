# 🌐 Hướng dẫn Setup Custom Domain cho dohystudio.com

## 📋 Tổng quan

Hướng dẫn này sẽ giúp bạn setup custom domain **dohystudio.com** cho dự án Step V Studio trên Vercel.

## 🚀 Bước 1: Cấu hình Domain trong Vercel

### 1.1 Truy cập Vercel Dashboard
1. Đăng nhập vào [vercel.com](https://vercel.com)
2. Chọn project **stepv-nextjs**
3. Vào tab **"Settings"**
4. Chọn **"Domains"** trong sidebar

### 1.2 Thêm Custom Domain
1. Click **"Add Domain"**
2. Nhập: `dohystudio.com`
3. Click **"Add"**
4. Vercel sẽ hiển thị DNS records cần setup

## 🔧 Bước 2: Cấu hình DNS Records

### 2.1 Tại nhà cung cấp domain (GoDaddy, Namecheap, etc.)

Thêm các DNS records sau:

#### **A Record (Root domain)**
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600 (hoặc Auto)
```

#### **CNAME Record (www subdomain)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (hoặc Auto)
```

### 2.2 Xác minh DNS Records

Sử dụng công cụ kiểm tra DNS:
```bash
# Kiểm tra A record
nslookup dohystudio.com

# Kiểm tra CNAME record
nslookup www.dohystudio.com
```

## ⏱️ Bước 3: Đợi DNS Propagation

- **Thời gian**: 5 phút - 48 giờ (thường là 15-30 phút)
- **Kiểm tra**: Vercel sẽ tự động verify domain
- **Status**: Chờ đến khi thấy ✅ "Valid Configuration"

## 🎯 Bước 4: Cấu hình SSL Certificate

Vercel tự động:
- ✅ Tạo SSL certificate (Let's Encrypt)
- ✅ Enable HTTPS redirect
- ✅ Setup HTTP/2

## 🔄 Bước 5: Test Domain

### 5.1 Kiểm tra URLs
- ✅ `https://dohystudio.com` → Trang chủ
- ✅ `https://www.dohystudio.com` → Redirect về dohystudio.com
- ✅ `http://dohystudio.com` → Redirect về HTTPS

### 5.2 Test các trang con
- ✅ `https://dohystudio.com/thu-vien`
- ✅ `https://dohystudio.com/dashboard`
- ✅ `https://dohystudio.com/du-an`

## 🛠️ Troubleshooting

### Lỗi thường gặp:

#### **1. "Domain not verified"**
- **Nguyên nhân**: DNS chưa propagate
- **Giải pháp**: Đợi thêm 30 phút và refresh

#### **2. "SSL Certificate Error"**
- **Nguyên nhân**: Domain mới setup
- **Giải pháp**: Đợi 5-10 phút để Vercel tạo SSL

#### **3. "404 Not Found"**
- **Nguyên nhân**: DNS trỏ sai
- **Giải pháp**: Kiểm tra lại A record và CNAME

### Công cụ debug:
- [DNS Checker](https://dnschecker.org/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Vercel Domain Debug](https://vercel.com/docs/concepts/projects/domains)

## ✅ Xác nhận thành công

Khi setup thành công, bạn sẽ thấy:

1. **Vercel Dashboard**: ✅ Domain verified
2. **Browser**: `https://dohystudio.com` load website
3. **SSL**: 🔒 Secure connection
4. **Redirects**: www → non-www hoạt động

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra DNS records tại domain provider
2. Đợi DNS propagation (tối đa 48h)
3. Contact Vercel support nếu cần
4. Kiểm tra Vercel deployment logs

---

**🎉 Hoàn tất!** Website Step V Studio giờ đã có custom domain **dohystudio.com**
