# Hướng dẫn thiết lập Firebase Admin SDK

## Vấn đề hiện tại
Lỗi "Firebase Admin SDK chưa được cấu hình" xảy ra vì thiếu các biến môi trường cần thiết.

## Giải pháp tạm thời (Development Mode)
Tôi đã cập nhật code để hoạt động trong chế độ development mà không cần Firebase Admin SDK. Hệ thống sẽ:
- Tạo employee document trong Firestore
- Lưu password tạm thời trong document
- Hiển thị thông báo "Chế độ phát triển"

## Giải pháp đầy đủ (Production)

### Bước 1: Tạo Service Account
1. Vào Firebase Console: https://console.firebase.google.com/
2. Chọn project "kpi-central-1kjf8"
3. Vào Settings > Service accounts
4. Click "Generate new private key"
5. Tải file JSON về máy

### Bước 2: Tạo file .env.local
Tạo file `.env.local` trong thư mục gốc với nội dung:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAaw3qMdPZD-C2qH9Ik-nTwNKVp-4x0scs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kpi-central-1kjf8.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kpi-central-1kjf8
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kpi-central-1kjf8.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=852984596237
NEXT_PUBLIC_FIREBASE_APP_ID=1:852984596237:web:b47d9c1694189fe1319244

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=kpi-central-1kjf8
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@kpi-central-1kjf8.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# App Configuration
NEXT_PUBLIC_APP_NAME=KPI Central
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=production

# Security
NEXTAUTH_SECRET=your-super-secret-jwt-key-change-in-production
NEXTAUTH_URL=http://localhost:9001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

### Bước 3: Cập nhật thông tin Service Account
Thay thế các giá trị sau từ file JSON đã tải:
- `FIREBASE_CLIENT_EMAIL`: Lấy từ field "client_email"
- `FIREBASE_PRIVATE_KEY`: Lấy từ field "private_key" (giữ nguyên dấu ngoặc kép và \n)

### Bước 4: Restart server
```bash
npm run dev
```

## Kiểm tra hoạt động
1. Vào http://localhost:9001/admin/hr-management
2. Click "Thêm nhân viên"
3. Điền thông tin và tạo tài khoản
4. Kiểm tra trong Firebase Console > Authentication để thấy user mới

## Lưu ý bảo mật
- Không commit file .env.local vào git
- Thay đổi các secret key trong production
- Sử dụng Firebase Security Rules để bảo vệ dữ liệu
