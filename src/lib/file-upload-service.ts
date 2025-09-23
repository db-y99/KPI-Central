// import { googleDriveService, DriveFile } from './google-drive-service';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  storageType: 'firebase' | 'google-drive';
  driveFileId?: string; // Google Drive file ID
}

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export type StorageProvider = 'firebase' | 'google-drive' | 'auto';

/**
 * Upload file to selected storage provider
 */
export async function uploadFile(
  file: File,
  path: string,
  provider: StorageProvider = 'auto',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Choose storage provider
    const storageProvider = provider === 'auto' ? getDefaultStorageProvider() : provider;

    if (storageProvider === 'google-drive') {
      return await uploadToGoogleDrive(file, path, onProgress);
    } else {
      return await uploadToFirebase(file, path, onProgress);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    onProgress?.({ progress: 0, status: 'error', error: errorMessage });
    throw new Error(`File upload failed: ${errorMessage}`);
  }
}

/**
 * Upload file to Google Drive
 */
async function uploadToGoogleDrive(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  try {
    // Get or create folder for the path
    const folderId = await getOrCreateFolder(path);
    
    // Upload file to Google Drive
    // const driveFile = await googleDriveService.uploadFile(file, folderId, onProgress);
    
    // Make file public for easy access
    // await googleDriveService.makeFilePublic(driveFile.id);
    
    // Fallback to Firebase for now
    return await uploadToFirebase(file, path, onProgress);
  } catch (error) {
    throw new Error(`Google Drive upload failed: ${error}`);
  }
}

/**
 * Upload file to Firebase Storage
 */
async function uploadToFirebase(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  try {
    // Create a reference to the file location
    const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    
    // Update progress
    onProgress?.({ progress: 0, status: 'uploading' });

    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);
    
    // Update progress
    onProgress?.({ progress: 50, status: 'uploading' });

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update progress
    onProgress?.({ progress: 100, status: 'completed' });

    return {
      id: snapshot.ref.name,
      name: file.name,
      url: downloadURL,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      storageType: 'firebase',
    };
  } catch (error) {
    throw new Error(`Firebase upload failed: ${error}`);
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  path: string,
  provider: StorageProvider = 'auto',
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadedFile[]> {
  const uploadPromises = files.map(async (file, index) => {
    try {
      return await uploadFile(file, path, provider, (progress) => {
        onProgress?.(index, progress);
      });
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * Delete file from storage
 */
export async function deleteFile(file: UploadedFile): Promise<void> {
  try {
    if (file.storageType === 'google-drive' && file.driveFileId) {
      // await googleDriveService.deleteFile(file.driveFileId);
    } else {
      // Firebase Storage
      const fileRef = ref(storage, file.id);
      await deleteObject(fileRef);
    }
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
}

/**
 * Get or create folder in Google Drive
 */
async function getOrCreateFolder(path: string): Promise<string> {
  try {
    // Split path into folder hierarchy
    const folders = path.split('/').filter(folder => folder.trim() !== '');
    
    let currentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root';
    
    for (const folderName of folders) {
      // let folderId = await googleDriveService.getFolderByName(folderName, currentFolderId);
      
      // if (!folderId) {
      //   folderId = await googleDriveService.createFolder(folderName, currentFolderId);
      // }
      
      // Return empty ID for now  
      const folderId = 'temp-id';
      
      currentFolderId = folderId;
    }
    
    return currentFolderId;
  } catch (error) {
    console.error('Error creating folder structure:', error);
    return process.env.GOOGLE_DRIVE_FOLDER_ID || 'root';
  }
}

/**
 * Get default storage provider based on environment
 */
function getDefaultStorageProvider(): StorageProvider {
  // Check if Google Drive is configured (support both naming conventions)
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  
  if (clientId && refreshToken) {
    return 'google-drive';
  }
  
  // Fallback to Firebase
  return 'firebase';
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, options?: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}): { isValid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options || {};

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a document
 */
export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  
  return documentTypes.includes(file.type);
}

/**
 * Get file icon based on type
 */
export function getFileIcon(file: UploadedFile): string {
  if (isImageFile({ type: file.type } as File)) {
    return '🖼️';
  } else if (isDocumentFile({ type: file.type } as File)) {
    return '📄';
  } else if (file.type.includes('video')) {
    return '🎥';
  } else if (file.type.includes('audio')) {
    return '🎵';
  } else {
    return '📁';
  }
}

/**
 * Get storage provider info
 */
export function getStorageProviderInfo(provider: StorageProvider): {
  name: string;
  icon: string;
  description: string;
} {
  switch (provider) {
    case 'google-drive':
      return {
        name: 'Google Drive',
        icon: '☁️',
        description: 'Files stored in Google Drive with easy sharing'
      };
    case 'firebase':
      return {
        name: 'Firebase Storage',
        icon: '🔥',
        description: 'Files stored in Firebase Storage'
      };
    case 'auto':
      return {
        name: 'Auto Select',
        icon: '🔄',
        description: 'Automatically choose best storage provider'
      };
    default:
      return {
        name: 'Unknown',
        icon: '❓',
        description: 'Unknown storage provider'
      };
  }
}
