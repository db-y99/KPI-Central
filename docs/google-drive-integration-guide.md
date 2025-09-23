# 📁 Hướng Dẫn Tích Hợp Google Drive vào KPI Central

## 🎯 **Tổng Quan**

Hệ thống KPI Central hiện đã hỗ trợ tích hợp Google Drive để lưu trữ file thay vì Firebase Storage. Điều này mang lại nhiều lợi ích:

- ✅ **Lưu trữ miễn phí**: 15GB miễn phí từ Google
- ✅ **Dễ chia sẻ**: Link chia sẻ trực tiếp từ Google Drive
- ✅ **Tích hợp tốt**: Hoạt động với Google Workspace
- ✅ **Backup tự động**: Google tự động backup
- ✅ **Tìm kiếm mạnh**: Tìm kiếm file bằng Google Search

## 🔧 **Bước 1: Cài Đặt Google Cloud Project**

### **1.1 Tạo Google Cloud Project**
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Đặt tên project: `KPI-Central-Drive`
4. Click "Create"

### **1.2 Enable Google Drive API**
1. Trong Google Cloud Console, chọn project vừa tạo
2. Vào "APIs & Services" → "Library"
3. Tìm kiếm "Google Drive API"
4. Click "Enable"

### **1.3 Tạo OAuth 2.0 Credentials**
1. Vào "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Chọn "Web application"
4. Đặt tên: `KPI Central Web Client`
5. Thêm Authorized redirect URIs:
   ```
   http://localhost:3000/api/google-drive
   https://yourdomain.com/api/google-drive
   ```
6. Click "Create"
7. **Lưu lại Client ID và Client Secret**

## 🔑 **Bước 2: Cấu Hình Environment Variables**

### **2.1 Tạo file `.env.local`**
```env
# Google Drive API Configuration
GOOGLE_DRIVE_CLIENT_ID=your_client_id_here
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret_here
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/google-drive
GOOGLE_DRIVE_REFRESH_TOKEN=

# Optional: Specific folder ID (leave empty to use root)
GOOGLE_DRIVE_FOLDER_ID=

# Service Account (for server-side operations)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

### **2.2 Lấy Refresh Token**
1. Chạy ứng dụng: `npm run dev`
2. Truy cập: `http://localhost:3000/api/google-drive`
3. Copy URL authorization và mở trong browser
4. Đăng nhập Google account và cấp quyền
5. Copy refresh token từ response
6. Thêm vào `.env.local`

## 📁 **Bước 3: Cấu Hình Folder Structure**

### **3.1 Tạo Folder KPI Central**
1. Truy cập [Google Drive](https://drive.google.com/)
2. Tạo folder mới: `KPI-Central-Reports`
3. Copy Folder ID từ URL
4. Thêm vào `GOOGLE_DRIVE_FOLDER_ID` trong `.env.local`

### **3.2 Cấu Hình Permissions**
1. Right-click folder → "Share"
2. Thêm email admin: `admin@yourcompany.com`
3. Set permission: "Editor"
4. Click "Send"

## 🚀 **Bước 4: Test Integration**

### **4.1 Test API Connection**
```bash
# Test Google Drive API
curl -X GET "http://localhost:3000/api/google-drive"
```

### **4.2 Test File Upload**
1. Đăng nhập vào ứng dụng
2. Vào "Employee" → "Reports"
3. Tạo báo cáo mới
4. Upload file và kiểm tra:
   - File được lưu vào Google Drive
   - Link chia sẻ hoạt động
   - Thumbnail hiển thị đúng

## ⚙️ **Bước 5: Cấu Hình Production**

### **5.1 Update Redirect URIs**
1. Vào Google Cloud Console
2. Edit OAuth client
3. Thêm production domain:
   ```
   https://yourdomain.com/api/google-drive
   ```

### **5.2 Environment Variables Production**
```env
# Production Environment
GOOGLE_DRIVE_CLIENT_ID=your_production_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_production_client_secret
GOOGLE_DRIVE_REDIRECT_URI=https://yourdomain.com/api/google-drive
GOOGLE_DRIVE_REFRESH_TOKEN=your_production_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_production_folder_id
```

## 🔄 **Bước 6: Migration từ Firebase Storage**

### **6.1 Backup Existing Files**
```bash
# Export Firebase Storage files
gsutil -m cp -r gs://your-bucket/uploads ./backup/
```

### **6.2 Upload to Google Drive**
```javascript
// Script để migrate files
const migrateFiles = async () => {
  const files = await listFirebaseFiles();
  for (const file of files) {
    await uploadToGoogleDrive(file);
    await updateDatabaseRecord(file.id, {
      storageType: 'google-drive',
      driveFileId: driveFile.id
    });
  }
};
```

## 📊 **Bước 7: Monitoring & Analytics**

### **7.1 Google Drive Usage**
1. Truy cập [Google Drive Storage](https://drive.google.com/settings/storage)
2. Monitor usage và quota
3. Set up alerts khi gần hết quota

### **7.2 Application Logs**
```javascript
// Log file operations
console.log('File uploaded to Google Drive:', {
  fileId: driveFile.id,
  fileName: file.name,
  storageType: 'google-drive',
  timestamp: new Date().toISOString()
});
```

## 🛠️ **Troubleshooting**

### **Lỗi Authentication**
```bash
# Check credentials
curl -X POST "http://localhost:3000/api/google-drive" \
  -H "Content-Type: application/json" \
  -d '{"action": "test-connection", "tokens": {"refresh_token": "your_token"}}'
```

### **Lỗi Upload**
1. Kiểm tra quota Google Drive
2. Kiểm tra file size limits
3. Kiểm tra network connection
4. Check browser console for errors

### **Lỗi Permissions**
1. Kiểm tra OAuth scopes
2. Kiểm tra folder permissions
3. Re-authenticate nếu cần

## 📈 **Performance Optimization**

### **8.1 Batch Upload**
```javascript
// Upload multiple files efficiently
const uploadBatch = async (files) => {
  const batchSize = 5;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(batch.map(file => uploadFile(file)));
  }
};
```

### **8.2 Caching**
```javascript
// Cache file metadata
const fileCache = new Map();
const getCachedFile = (fileId) => {
  if (fileCache.has(fileId)) {
    return fileCache.get(fileId);
  }
  // Fetch from Google Drive
};
```

## 🔒 **Security Best Practices**

### **9.1 Access Control**
- Sử dụng Service Account cho server operations
- Implement proper file permissions
- Regular audit access logs

### **9.2 Data Protection**
- Encrypt sensitive files trước khi upload
- Implement file retention policies
- Regular backup important data

## 📞 **Support**

Nếu gặp vấn đề, hãy kiểm tra:
1. Google Cloud Console logs
2. Application logs
3. Browser network tab
4. Google Drive API documentation

---

**🎉 Chúc mừng! Bạn đã tích hợp thành công Google Drive vào KPI Central!**
