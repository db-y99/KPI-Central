const { google } = require('googleapis');
const readline = require('readline');

// Tạo interface để đọc input từ user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function getGoogleDriveToken() {
  console.log('🔑 Google Drive Token Generator\n');
  
  try {
    // 1. Lấy thông tin từ user
    console.log('📝 Nhập thông tin OAuth credentials:');
    const clientId = await askQuestion('Client ID: ');
    const clientSecret = await askQuestion('Client Secret: ');
    const redirectUri = await askQuestion('Redirect URI (default: http://localhost:3000/api/google-drive/callback): ') || 'http://localhost:3000/api/google-drive/callback';
    
    // 2. Tạo OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    
    // 3. Tạo authorization URL
    const scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ];
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force consent screen to get refresh token
    });
    
    console.log('\n🌐 Mở URL này trong browser để authorize:');
    console.log(authUrl);
    console.log('\n📋 Sau khi authorize, bạn sẽ được redirect đến một URL.');
    console.log('📋 Copy toàn bộ URL đó và paste vào đây:');
    
    const authCodeUrl = await askQuestion('Authorization URL: ');
    
    // 4. Extract authorization code từ URL
    const url = new URL(authCodeUrl);
    const authCode = url.searchParams.get('code');
    
    if (!authCode) {
      throw new Error('Không tìm thấy authorization code trong URL');
    }
    
    // 5. Exchange authorization code for tokens
    console.log('\n🔄 Đang lấy tokens...');
    const { tokens } = await oauth2Client.getToken(authCode);
    
    console.log('\n✅ Thành công! Đây là thông tin tokens:');
    console.log('\n📋 Thêm vào file .env.local:');
    console.log('```env');
    console.log(`GOOGLE_DRIVE_CLIENT_ID=${clientId}`);
    console.log(`GOOGLE_DRIVE_CLIENT_SECRET=${clientSecret}`);
    console.log(`GOOGLE_DRIVE_REDIRECT_URI=${redirectUri}`);
    console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('```');
    
    console.log('\n🔑 Access Token (tạm thời):');
    console.log(tokens.access_token);
    
    console.log('\n🔄 Refresh Token (dùng để lấy access token mới):');
    console.log(tokens.refresh_token);
    
    // 6. Test token bằng cách lấy thông tin user
    console.log('\n🧪 Testing token...');
    oauth2Client.setCredentials(tokens);
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const about = await drive.about.get({ fields: 'user' });
    
    console.log(`✅ Token hoạt động! User: ${about.data.user.displayName}`);
    
    // 7. Tạo folder test
    console.log('\n📁 Tạo test folder...');
    const folderResponse = await drive.files.create({
      requestBody: {
        name: 'KPI-Central-Test',
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    });
    
    const folderId = folderResponse.data.id;
    console.log(`✅ Test folder created: ${folderId}`);
    console.log(`📋 Folder ID cho .env.local: ${folderId}`);
    
    console.log('\n📋 Hoàn chỉnh .env.local:');
    console.log('```env');
    console.log(`GOOGLE_DRIVE_CLIENT_ID=${clientId}`);
    console.log(`GOOGLE_DRIVE_CLIENT_SECRET=${clientSecret}`);
    console.log(`GOOGLE_DRIVE_REDIRECT_URI=${redirectUri}`);
    console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GOOGLE_DRIVE_FOLDER_ID=${folderId}`);
    console.log('```');
    
    console.log('\n🎉 Hoàn thành! Bây giờ bạn có thể sử dụng Google Drive integration.');
    
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Kiểm tra lại Client ID và Client Secret');
    console.log('2. Đảm bảo Redirect URI đúng');
    console.log('3. Kiểm tra Google Cloud Console settings');
    console.log('4. Thử lại với browser incognito mode');
  } finally {
    rl.close();
  }
}

// Chạy script
getGoogleDriveToken().then(() => {
  console.log('\n🏁 Token generation completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Token generation failed:', error);
  process.exit(1);
});
