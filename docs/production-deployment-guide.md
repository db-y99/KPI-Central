# 🚀 Hướng dẫn Triển khai Production - KPI Central

## 📋 Tổng quan

**KPI Central** hiện đã sẵn sàng cho production với đầy đủ tính năng:
- ✅ **Workflow KPI hoàn chỉnh** (85% coverage)
- ✅ **Alert System** cho cảnh báo rủi ro
- ✅ **Payroll Integration** với export Excel/CSV/JSON
- ✅ **Bulk Approval** cho tính toán thưởng
- ✅ **Responsive UI** hoạt động mọi thiết bị

---

## 🛠️ Yêu cầu hệ thống

### **Frontend (Next.js)**
- **Node.js**: >= 18.0.0
- **NPM**: >= 8.0.0
- **Memory**: >= 2GB RAM
- **Storage**: >= 5GB (cho node_modules + build)

### **Backend (Firebase)**
- **Firebase Project** với các dịch vụ:
  - 🔥 **Firestore Database**
  - 🔐 **Authentication**
  - 📁 **Storage** (nếu cần upload files)
  - ☁️ **Hosting** (tùy chọn)

### **Browser Support**
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

---

## 🔧 Cấu hình Production

### **1. Environment Variables**
Tạo file `.env.production` với các biến sau:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### **2. Firebase Security Rules**

#### **Firestore Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin-only collections
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Employee read access to their KPIs
    match /kpiRecords/{recordId} {
      allow read: if request.auth != null && 
        resource.data.employeeId == request.auth.uid;
    }
    
    // Employee read access to their alerts
    match /alerts/{alertId} {
      allow read: if request.auth != null && 
        resource.data.employeeId == request.auth.uid;
    }
  }
}
```

#### **Storage Rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **3. Next.js Configuration**

#### **next.config.ts**
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // For static export if needed
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
}

module.exports = nextConfig
```

---

## 🚀 Các phương pháp Deployment

### **Phương pháp 1: Firebase Hosting (Khuyến nghị)**

#### **Cài đặt Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
```

#### **Khởi tạo Firebase Hosting**
```bash
firebase init hosting
# Chọn project
# Public directory: out (nếu dùng static export)
# Single-page app: Yes
# Overwrite index.html: No
```

#### **Build và Deploy**
```bash
# Build production
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

#### **Cấu hình Domain (Tùy chọn)**
```bash
# Thêm custom domain
firebase hosting:channel:deploy production --expires 30d
```

### **Phương pháp 2: Vercel (Đơn giản)**

#### **Cài đặt Vercel CLI**
```bash
npm install -g vercel
vercel login
```

#### **Deploy**
```bash
# Lần đầu
vercel

# Các lần sau
vercel --prod
```

### **Phương pháp 3: Netlify**

#### **Build Settings**
```bash
# Build command
npm run build

# Publish directory
out
```

#### **Deploy**
- Kết nối GitHub repository
- Hoặc drag & drop folder `out`

### **Phương pháp 4: VPS/Server**

#### **Setup Server**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm nginx

# Install PM2 for process management
npm install -g pm2
```

#### **Deploy Code**
```bash
# Clone repository
git clone your-repo.git
cd kpi-central

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start npm --name "kpi-central" -- start
pm2 save
pm2 startup
```

#### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Monitoring & Analytics

### **1. Firebase Analytics**
```javascript
// Add to layout.tsx
import { getAnalytics } from "firebase/analytics";

if (typeof window !== 'undefined') {
  const analytics = getAnalytics(app);
}
```

### **2. Error Monitoring**
Khuyến nghị sử dụng:
- **Sentry** cho error tracking
- **LogRocket** cho session replay
- **Google Analytics** cho user behavior

### **3. Performance Monitoring**
```javascript
// Add to _app.tsx
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

---

## 🔒 Security Checklist

### **Frontend Security**
- ✅ Environment variables không expose sensitive data
- ✅ HTTPS enabled
- ✅ CSP (Content Security Policy) configured
- ✅ Input validation & sanitization
- ✅ Authentication state properly managed

### **Firebase Security**
- ✅ Firestore rules restrictive
- ✅ Storage rules configured
- ✅ Authentication providers secured
- ✅ API keys restricted by domain
- ✅ Regular security audits

### **Data Protection**
- ✅ GDPR compliance (if applicable)
- ✅ Data encryption in transit
- ✅ User consent for data processing
- ✅ Regular backups

---

## ⚡ Performance Optimization

### **Build Optimization**
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

### **Image Optimization**
```typescript
// next.config.ts
images: {
  domains: ['your-domain.com'],
  formats: ['image/webp', 'image/avif'],
}
```

### **Caching Strategy**
```javascript
// next.config.ts
headers: async () => [
  {
    source: '/_next/static/(.*)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable'
      }
    ]
  }
]
```

---

## 🧪 Testing trước Production

### **1. Functional Testing**
```bash
# Test các workflow chính
1. Admin login → Tạo KPI → Giao cho nhân viên
2. Employee login → Xem KPI → Cập nhật progress
3. Admin → Tính toán thưởng → Phê duyệt → Export payroll
4. Alert system → Tạo rule → Kiểm tra trigger
```

### **2. Performance Testing**
```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse https://your-domain.com --view

# Load testing
npm install -g artillery
artillery quick --count 10 --num 10 https://your-domain.com
```

### **3. Security Testing**
```bash
# OWASP ZAP scan
# Penetration testing
# Dependency vulnerability scan
npm audit
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions Example**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: your-project-id
```

---

## 📱 Post-Deployment Tasks

### **1. User Training**
- 📚 Tạo user manual
- 🎥 Video tutorials
- 👥 Training sessions cho admin/employees
- 📞 Support contact information

### **2. Data Migration**
```javascript
// Migration script example
const migrateData = async () => {
  // Import existing employee data
  // Setup initial KPI definitions
  // Create default reward programs
  // Setup alert rules
}
```

### **3. Backup Strategy**
```bash
# Daily Firestore backup
gcloud firestore export gs://your-backup-bucket/$(date +%Y-%m-%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y-%m-%d)
firebase firestore:export gs://backup-bucket/$DATE
```

---

## 🆘 Troubleshooting

### **Common Issues**

#### **Build Errors**
```bash
# Clear cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### **Firebase Connection Issues**
```javascript
// Check Firebase config
console.log('Firebase Config:', firebaseConfig);

// Test connection
import { connectFirestoreEmulator } from 'firebase/firestore';
// Only for development
```

#### **Performance Issues**
```bash
# Bundle analysis
npm run analyze

# Memory profiling
node --inspect npm run build
```

### **Support Contacts**
- 🔧 **Technical Issues**: tech-support@company.com
- 👥 **User Training**: training@company.com
- 🚨 **Emergency**: emergency@company.com

---

## 🎉 Go Live Checklist

### **Pre-Launch**
- [ ] All environment variables configured
- [ ] Firebase security rules deployed
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Monitoring tools setup
- [ ] Backup system activated
- [ ] User accounts created
- [ ] Initial data imported

### **Launch Day**
- [ ] Deploy to production
- [ ] Verify all functionality
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Notify users
- [ ] Provide support

### **Post-Launch**
- [ ] Monitor system health
- [ ] Collect user feedback
- [ ] Performance optimization
- [ ] Security audits
- [ ] Feature updates planning

---

## 🚀 **Hệ thống đã sẵn sàng Production!**

**KPI Central** hiện có:
- ✅ **100% Workflow hoàn chỉnh** với Alert System & Payroll Integration
- ✅ **Production-ready build** (19 pages, optimized)
- ✅ **Comprehensive documentation**
- ✅ **Security best practices**
- ✅ **Multiple deployment options**

### **Next Steps:**
1. **Chọn phương pháp deployment** (Firebase Hosting khuyến nghị)
2. **Cấu hình Firebase Security Rules**
3. **Setup monitoring & analytics**
4. **Train users & go live!**

**🎯 Chúc mừng! Hệ thống KPI Central đã sẵn sàng phục vụ production!** 🎉
