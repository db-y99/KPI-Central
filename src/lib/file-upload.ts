import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
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
      name: file.name,
      url: downloadURL,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    onProgress?.({ progress: 0, status: 'error', error: errorMessage });
    throw new Error(`File upload failed: ${errorMessage}`);
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  path: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadedFile[]> {
  const uploadPromises = files.map(async (file, index) => {
    try {
      return await uploadFile(file, path, (progress) => {
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
 * Delete a file from Firebase Storage
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw new Error('Failed to delete file');
  }
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
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
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
