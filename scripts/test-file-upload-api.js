const fs = require('fs');
const path = require('path');

async function testFileUploadAPI() {
  console.log('🧪 Testing File Upload API...\n');

  try {
    // 1. Check if server is running
    console.log('1. Checking if server is running...');
    const healthResponse = await fetch('http://localhost:9001/api/file-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true })
    });
    
    console.log('   Server status:', healthResponse.status);
    
    // 2. Create a test file
    console.log('\n2. Creating test file...');
    const testContent = 'This is a test file for upload functionality.';
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, testContent);
    console.log('   ✅ Test file created:', testFilePath);

    // 3. Test file upload
    console.log('\n3. Testing file upload...');
    const formData = new FormData();
    const fileBlob = new Blob([testContent], { type: 'text/plain' });
    const file = new File([fileBlob], 'test-file.txt', { type: 'text/plain' });
    
    formData.append('file', file);
    formData.append('folderPath', 'kpi-reports');
    formData.append('storageProvider', 'google-drive');

    const uploadResponse = await fetch('http://localhost:9001/api/file-upload', {
      method: 'POST',
      body: formData,
    });

    console.log('   Upload response status:', uploadResponse.status);
    console.log('   Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

    const responseText = await uploadResponse.text();
    console.log('   Raw response:', responseText);

    if (uploadResponse.ok) {
      try {
        const result = JSON.parse(responseText);
        console.log('   ✅ Upload successful!');
        console.log('   File ID:', result.data?.id);
        console.log('   File URL:', result.data?.url);
        console.log('   Storage Type:', result.data?.storageType);
      } catch (parseError) {
        console.log('   ❌ JSON parse error:', parseError.message);
        console.log('   Response was not valid JSON');
      }
    } else {
      console.log('   ❌ Upload failed');
      console.log('   Error response:', responseText);
    }

    // 4. Test with different file types
    console.log('\n4. Testing with PDF file...');
    const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n';
    const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
    const pdfFile = new File([pdfBlob], 'test.pdf', { type: 'application/pdf' });
    
    const pdfFormData = new FormData();
    pdfFormData.append('file', pdfFile);
    pdfFormData.append('folderPath', 'kpi-reports');
    pdfFormData.append('storageProvider', 'google-drive');

    const pdfResponse = await fetch('http://localhost:9001/api/file-upload', {
      method: 'POST',
      body: pdfFormData,
    });

    console.log('   PDF upload status:', pdfResponse.status);
    const pdfResponseText = await pdfResponse.text();
    
    if (pdfResponse.ok) {
      try {
        const pdfResult = JSON.parse(pdfResponseText);
        console.log('   ✅ PDF upload successful!');
        console.log('   PDF File ID:', pdfResult.data?.id);
      } catch (parseError) {
        console.log('   ❌ PDF JSON parse error:', parseError.message);
      }
    } else {
      console.log('   ❌ PDF upload failed');
      console.log('   PDF Error response:', pdfResponseText);
    }

    // 5. Test error cases
    console.log('\n5. Testing error cases...');
    
    // Test without file
    const noFileResponse = await fetch('http://localhost:9001/api/file-upload', {
      method: 'POST',
      body: new FormData(),
    });
    
    console.log('   No file response status:', noFileResponse.status);
    const noFileText = await noFileResponse.text();
    console.log('   No file response:', noFileText);

    // Test with invalid file type
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-executable' });
    const invalidFormData = new FormData();
    invalidFormData.append('file', invalidFile);
    invalidFormData.append('folderPath', 'kpi-reports');
    invalidFormData.append('storageProvider', 'google-drive');

    const invalidResponse = await fetch('http://localhost:9001/api/file-upload', {
      method: 'POST',
      body: invalidFormData,
    });

    console.log('   Invalid file response status:', invalidResponse.status);
    const invalidText = await invalidResponse.text();
    console.log('   Invalid file response:', invalidText);

    // Cleanup
    console.log('\n6. Cleaning up...');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('   ✅ Test file deleted');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testFileUploadAPI().then(() => {
  console.log('\n🏁 File upload API test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
