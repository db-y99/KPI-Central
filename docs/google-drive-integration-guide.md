# HƯỚNG DẪN TÍCH HỢP GOOGLE DRIVE API

## 📋 TỔNG QUAN

Hệ thống KPI Central đã được tích hợp với Google Drive API để lưu trữ file. Hướng dẫn này sẽ giúp bạn cấu hình Google Drive API để sử dụng chức năng upload file.

## 🔧 CÁC BƯỚC CẤU HÌNH

### Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo một project mới hoặc chọn project hiện có
3. Ghi nhớ Project ID

### Bước 2: Kích hoạt Google Drive API

1. Trong Google Cloud Console, vào **APIs & Services** > **Library**
2. Tìm kiếm "Google Drive API"
3. Click **Enable** để kích hoạt API

### Bước 3: Tạo OAuth 2.0 Credentials

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Chọn **Web application**
4. Đặt tên: "KPI Central Drive Integration"
5. Thêm **Authorized redirect URIs**:
   - `http://localhost:3000/api/google-drive/callback` (development)
   - `https://yourdomain.com/api/google-drive/callback` (production)
6. Click **Create**
7. Lưu **Client ID** và **Client Secret**

### Bước 4: Lấy Refresh Token

#### Cách 1: Sử dụng OAuth Playground (Khuyến nghị)

1. Truy cập [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click **Settings** (gear icon) ở góc phải
3. Check **Use your own OAuth credentials**
4. Nhập **Client ID** và **Client Secret** từ bước 3
5. Trong **Select & authorize APIs**, tìm và chọn:
   - `https://www.googleapis.com/auth/drive`
6. Click **Authorize APIs**
7. Đăng nhập với Google account của bạn
8. Click **Exchange authorization code for tokens**
9. Copy **Refresh token** từ response

#### Cách 2: Sử dụng Script tự động

```bash
# Cài đặt dependencies
npm install googleapis

# Chạy script để lấy refresh token
node scripts/get-google-drive-token.js
```

### Bước 5: Tạo Folder trên Google Drive

1. Truy cập [Google Drive](https://drive.google.com/)
2. Tạo folder mới: "KPI-Central-Files"
3. Click chuột phải vào folder > **Get link**
4. Copy **Folder ID** từ URL (phần sau `/folders/`)

### Bước 6: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc của project:

```env
# Google Drive Configuration
GOOGLE_DRIVE_CLIENT_ID=your_client_id_here
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret_here
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/google-drive/callback
GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

### Bước 7: Test Integration

```bash
# Chạy script test
node scripts/test-google-drive-integration.js
```

## 🔍 KIỂM TRA CẤU HÌNH

### Kiểm tra Environment Variables

```bash
# Kiểm tra các biến môi trường
echo $GOOGLE_DRIVE_CLIENT_ID
echo $GOOGLE_DRIVE_CLIENT_SECRET
echo $GOOGLE_DRIVE_REFRESH_TOKEN
echo $GOOGLE_DRIVE_FOLDER_ID
```

### Test API Endpoint

```bash
# Test API endpoint
curl http://localhost:3000/api/google-drive/status
```

## 🚀 SỬ DỤNG

### Upload File trong Application

1. Khởi động development server: `npm run dev`
2. Đăng nhập vào hệ thống
3. Vào trang upload file (ví dụ: Employee > Self Update Metrics)
4. Chọn file và upload
5. File sẽ được lưu vào Google Drive folder đã cấu hình

### Các Storage Provider

Hệ thống hỗ trợ 3 chế độ lưu trữ:

- **`auto`**: Tự động chọn (Google Drive nếu có cấu hình, Firebase nếu không)
- **`google-drive`**: Luôn sử dụng Google Drive
- **`firebase`**: Luôn sử dụng Firebase Storage

## 🔧 TROUBLESHOOTING

### Lỗi thường gặp

#### 1. "Invalid refresh token"
- **Nguyên nhân**: Refresh token đã hết hạn hoặc không đúng
- **Giải pháp**: Lấy lại refresh token từ OAuth Playground

#### 2. "Insufficient permissions"
- **Nguyên nhân**: OAuth scope không đủ quyền
- **Giải pháp**: Đảm bảo đã chọn `https://www.googleapis.com/auth/drive`

#### 3. "Folder not found"
- **Nguyên nhân**: Folder ID không đúng hoặc không có quyền truy cập
- **Giải pháp**: Kiểm tra lại Folder ID và quyền truy cập

#### 4. "API quota exceeded"
- **Nguyên nhân**: Vượt quá giới hạn API calls
- **Giải pháp**: Đợi reset quota hoặc nâng cấp plan

### Debug Commands

```bash
# Kiểm tra cấu hình
node scripts/test-google-drive-integration.js

# Test upload file
node scripts/test-file-upload.js

# Kiểm tra logs
tail -f logs/app.log
```

## 📊 MONITORING

### Google Cloud Console

1. Vào **APIs & Services** > **Dashboard**
2. Xem **API usage** và **quotas**
3. Monitor **errors** và **requests**

### Application Logs

```bash
# Xem logs real-time
npm run dev | grep -i "google\|drive\|upload"
```

## 🔒 BẢO MẬT

### Best Practices

1. **Không commit** `.env.local` vào Git
2. **Rotate** refresh token định kỳ
3. **Limit** API quotas để tránh abuse
4. **Monitor** file access logs
5. **Use** HTTPS trong production

### Permissions

- **Read/Write**: Upload và download files
- **Share**: Tạo public links cho files
- **Delete**: Xóa files khi cần

## 📈 OPTIMIZATION

### Performance Tips

1. **Batch uploads**: Upload nhiều files cùng lúc
2. **Compress files**: Giảm kích thước trước khi upload
3. **Cache URLs**: Lưu download URLs để tránh regenerate
4. **Async processing**: Upload files trong background

### Cost Optimization

1. **Monitor quotas**: Theo dõi API usage
2. **Optimize file sizes**: Giảm bandwidth usage
3. **Use appropriate storage**: Chọn storage phù hợp với file type
4. **Cleanup old files**: Xóa files không cần thiết

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy:

1. Kiểm tra logs trong console
2. Chạy script test để debug
3. Xem Google Cloud Console để kiểm tra quotas
4. Liên hệ team phát triển với thông tin chi tiết

---
*Hướng dẫn được tạo tự động bởi hệ thống KPI Central*