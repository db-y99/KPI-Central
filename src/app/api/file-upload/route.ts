import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('File upload request received');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderPath = formData.get('folderPath') as string || 'kpi-reports';
    const storageProvider = formData.get('storageProvider') as string || 'auto';
    
    console.log('Form data parsed:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      folderPath,
      storageProvider
    });
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if Google Drive is configured
    const isGoogleDriveConfigured = !!(
      process.env.GOOGLE_DRIVE_CLIENT_ID &&
      process.env.GOOGLE_DRIVE_CLIENT_SECRET &&
      process.env.GOOGLE_DRIVE_REFRESH_TOKEN &&
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    if (!isGoogleDriveConfigured) {
      // Simulate upload when Google Drive is not configured
      console.log('Google Drive not configured, simulating upload...');
      
      const result = {
        success: true,
        data: {
          id: `sim_${Date.now()}_${file.name}`,
          name: file.name,
          url: `https://example.com/files/${file.name}`,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          storageType: 'simulated'
        },
        message: 'File upload simulated successfully (Google Drive not configured)'
      };

      console.log('Simulated upload successful:', result);
      return NextResponse.json(result);
    }

    // Actual Google Drive upload implementation
    console.log('Google Drive is configured, uploading to Google Drive...');
    
    try {
      // Import Google Drive service (server-side only)
      const { googleDriveService } = await import('@/lib/google-drive-service');
      
      // Convert File to Buffer for upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Create a File-like object for the service
      const fileForUpload = {
        name: file.name,
        type: file.type,
        size: file.size,
        arrayBuffer: async () => arrayBuffer
      } as File;
      
      // Determine folder ID based on folderPath
      let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root';
      
      // Upload to Google Drive
      const driveFile = await googleDriveService.uploadFile(
        fileForUpload,
        folderId,
        (progress) => {
          console.log(`Upload progress: ${progress.progress}%`);
        }
      );
      
      // Make file publicly accessible
      await googleDriveService.makeFilePublic(driveFile.id);
      
      const result = {
        success: true,
        data: {
          id: driveFile.id,
          name: file.name,
          url: driveFile.webViewLink || driveFile.webContentLink || `https://drive.google.com/file/d/${driveFile.id}/view`,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          storageType: 'google-drive',
          driveFileId: driveFile.id,
          thumbnailUrl: driveFile.thumbnailLink
        },
        message: 'File uploaded successfully to Google Drive'
      };

      console.log('Google Drive upload successful:', result);
      return NextResponse.json(result);
      
    } catch (uploadError) {
      console.error('Google Drive upload failed:', uploadError);
      
      // Fallback to Firebase Storage if Google Drive fails
      try {
        console.log('Falling back to Firebase Storage...');
        const { storage } = await import('@/lib/firebase');
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const fileRef = ref(storage, `${folderPath}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, buffer);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        const result = {
          success: true,
          data: {
            id: snapshot.ref.name,
            name: file.name,
            url: downloadURL,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            storageType: 'firebase'
          },
          message: 'File uploaded successfully to Firebase Storage (Google Drive fallback)'
        };
        
        console.log('Firebase Storage upload successful:', result);
        return NextResponse.json(result);
        
      } catch (firebaseError) {
        console.error('Firebase Storage fallback also failed:', firebaseError);
        throw new Error('Both Google Drive and Firebase Storage uploads failed');
      }
    }

  } catch (error) {
    console.error('File upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'File upload failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, storageType, driveFileId } = body;
    
    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'No file ID provided' },
        { status: 400 }
      );
    }

    console.log('Deleting file:', { fileId, storageType, driveFileId });

    try {
      if (storageType === 'google-drive' && driveFileId) {
        // Delete from Google Drive
        const { googleDriveService } = await import('@/lib/google-drive-service');
        await googleDriveService.deleteFile(driveFileId);
        
        console.log('File deleted from Google Drive:', driveFileId);
        return NextResponse.json({
          success: true,
          message: 'File deleted successfully from Google Drive'
        });
        
      } else if (storageType === 'firebase') {
        // Delete from Firebase Storage
        const { storage } = await import('@/lib/firebase');
        const { ref, deleteObject } = await import('firebase/storage');
        
        const fileRef = ref(storage, fileId);
        await deleteObject(fileRef);
        
        console.log('File deleted from Firebase Storage:', fileId);
        return NextResponse.json({
          success: true,
          message: 'File deleted successfully from Firebase Storage'
        });
        
      } else if (storageType === 'simulated') {
        // Simulated files don't need deletion
        console.log('Simulated file, no deletion needed:', fileId);
        return NextResponse.json({
          success: true,
          message: 'Simulated file removed'
        });
        
      } else {
        console.warn('Unknown storage type:', storageType);
        return NextResponse.json({
          success: true,
          message: 'File reference removed (unknown storage type)'
        });
      }
      
    } catch (deleteError) {
      console.error('Error deleting file:', deleteError);
      // Even if deletion fails, return success to prevent UI errors
      // The file reference will be removed from database
      return NextResponse.json({
        success: true,
        message: 'File reference removed (deletion error logged)',
        warning: deleteError instanceof Error ? deleteError.message : 'Deletion failed'
      });
    }

  } catch (error) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'File delete failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}