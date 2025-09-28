# HƯỚNG DẪN CẤU HÌNH GOOGLE DRIVE CHO FILE UPLOAD

## 📋 TRẠNG THÁI HIỆN TẠI

**File upload đang chạy ở chế độ SIMULATED (giả lập)**
- ✅ File upload UI hoạt động
- ✅ Validation hoạt động
- ❌ File chưa được lưu vào Google Drive thực sự
- ❌ Chỉ trả về mock data

## 🔧 CÁCH KÍCH HOẠT GOOGLE DRIVE

### Bước 1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable **Google Drive API**

### Bước 2: Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Chọn **Web application**
4. Thêm **Authorized redirect URIs**: `http://localhost:9001/api/google-drive/callback`
5. Lưu **Client ID** và **Client Secret**

### Bước 3: Lấy Refresh Token
1. Chạy script: `node scripts/get-google-drive-token.js`
2. Follow hướng dẫn để lấy refresh token
3. Lưu refresh token

### Bước 4: Tạo Folder trên Google Drive
1. Tạo folder trên Google Drive
2. Copy folder ID từ URL
3. Lưu folder ID

### Bước 5: Cấu hình Environment Variables
Tạo file `.env.local` với nội dung:

```bash
# Google Drive Configuration
GOOGLE_DRIVE_CLIENT_ID=your_actual_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:9001/api/google-drive/callback
GOOGLE_DRIVE_REFRESH_TOKEN=your_actual_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_actual_folder_id
```

### Bước 6: Restart Server
```bash
npm run dev
```

## 🧪 KIỂM TRA CẤU HÌNH

Sau khi cấu hình xong, chạy:
```bash
node scripts/test-google-drive-integration.js
```

## 📊 KẾT QUẢ MONG ĐỢI

**Trước khi cấu hình:**
```
storageType: 'simulated'
url: 'https://example.com/files/filename.pdf'
message: 'File upload simulated successfully (storage not configured)'
```

**Sau khi cấu hình:**
```
storageType: 'google-drive'
url: 'https://drive.google.com/file/d/actual_file_id/view'
message: 'File uploaded to Google Drive successfully'
```

## 🔧 TROUBLESHOOTING

### Lỗi thường gặp:
1. **"Invalid credentials"**: Kiểm tra Client ID và Client Secret
2. **"Invalid refresh token"**: Lấy lại refresh token
3. **"Folder not found"**: Kiểm tra Folder ID
4. **"Permission denied"**: Đảm bảo API được enable

### Debug steps:
1. Check console logs trong terminal
2. Verify environment variables
3. Test với Google Drive API trực tiếp
4. Check folder permissions

## 💡 LƯU Ý QUAN TRỌNG

- **Development**: Sử dụng `http://localhost:9001`
- **Production**: Cập nhật redirect URI cho domain thực
- **Security**: Không commit `.env.local` vào git
- **Backup**: Lưu trữ credentials an toàn

---
*Hướng dẫn được tạo tự động bởi hệ thống KPI Central - 27/09/2025*

