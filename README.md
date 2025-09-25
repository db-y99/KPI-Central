# Y99 KPI Central

![Y99 Logo](https://y99.vn/logo.png)

## 🎯 **Giới thiệu**

**Y99 KPI Central** là hệ thống quản lý và theo dõi KPI (Key Performance Indicators) toàn diện, được phát triển bởi Y99. Hệ thống giúp doanh nghiệp quản lý hiệu quả các chỉ số hiệu suất chính, theo dõi tiến độ và đánh giá thành tích nhân viên.

## ✨ **Tính năng chính**

### 📊 **Quản lý KPI**
- Định nghĩa và cấu hình KPI theo từng vị trí
- Theo dõi tiến độ thực hiện KPI
- Báo cáo và phân tích hiệu suất

### 👥 **Quản lý nhân viên**
- Quản lý thông tin nhân viên và phòng ban
- Phân quyền theo vai trò (Admin/Employee)
- Theo dõi lịch sử hoạt động

### 🏆 **Hệ thống thưởng phạt**
- Tính toán thưởng dựa trên KPI
- Quản lý chương trình khen thưởng
- Theo dõi điểm số và thành tích

### 📈 **Báo cáo và phân tích**
- Dashboard tổng quan
- Báo cáo chi tiết theo thời gian
- Xuất báo cáo PDF/Excel

### 🔔 **Thông báo và cảnh báo**
- Hệ thống thông báo real-time
- Cảnh báo khi KPI không đạt mục tiêu
- Tích hợp email và SMS

## 🚀 **Công nghệ sử dụng**

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Library**: Radix UI, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **State Management**: React Context

## 📦 **Cài đặt**

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn
- Firebase project

### Các bước cài đặt

1. **Clone repository**
```bash
git clone https://github.com/y99/kpi-central.git
cd kpi-central
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment**
```bash
cp env.example .env.local
# Chỉnh sửa các giá trị trong .env.local
```

4. **Chạy development server**
```bash
npm run dev
```

5. **Truy cập ứng dụng**
```
http://localhost:9001
```

## 🔧 **Cấu hình Firebase**

1. Tạo Firebase project tại [Firebase Console](https://console.firebase.google.com)
2. Bật Authentication và Firestore Database
3. Cấu hình Security Rules
4. Thêm cấu hình Firebase vào `.env.local`

## 📱 **Tài khoản mặc định**

- **Admin**: `db@y99.vn` / `123456`
- **Employee**: Tạo tài khoản mới qua giao diện admin

## 🎨 **Giao diện**

### Desktop
- Sidebar navigation với logo Y99
- Dashboard tổng quan với charts
- Responsive design

### Mobile
- Mobile-first approach
- Touch-friendly interface
- Optimized performance

## 📊 **Cấu trúc dự án**

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── context/            # React Context providers
├── lib/                # Utilities và services
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## 🚀 **Deployment**

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Firebase Hosting
```bash
npm i -g firebase-tools
firebase init hosting
npm run build
firebase deploy
```

## 📈 **Performance**

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: Optimized với code splitting

## 🔒 **Bảo mật**

- Firebase Authentication
- Role-based access control
- Input validation với Zod
- XSS protection
- CSRF protection

## 📞 **Hỗ trợ**

- **Email**: support@y99.vn
- **Website**: [y99.vn](https://y99.vn)
- **Documentation**: [docs.y99.vn](https://docs.y99.vn)

## 📄 **License**

© 2025 Y99. All rights reserved.

---

**Phát triển bởi [Y99](https://y99.vn) - Đối tác công nghệ tin cậy**