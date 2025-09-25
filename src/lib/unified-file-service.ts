import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { googleDriveService, DriveFile } from './google-drive-service';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  storageType: 'firebase' | 'google-drive';
  driveFileId?: string; // Google Drive file ID
  thumbnailUrl?: string; // For images
}

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export type StorageProvider = 'firebase' | 'google-drive' | 'auto';

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileServiceConfig {
  defaultProvider: StorageProvider;
  maxFileSize: number;
  allowedTypes: string[];
  googleDriveFolderId?: string;
}

class UnifiedFileService {
  private static instance: UnifiedFileService;
  private config: FileServiceConfig;

  private constructor() {
    this.config = {
      defaultProvider: this.getDefaultStorageProvider(),
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ],
      googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID
    };
  }

  public static getInstance(): UnifiedFileService {
    if (!UnifiedFileService.instance) {
      UnifiedFileService.instance = new UnifiedFileService();
    }
    return UnifiedFileService.instance;
  }

  /**
   * Upload file to selected storage provider
   */
  async uploadFile(
    file: File,
    path: string,
    provider: StorageProvider = 'auto',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> {
    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Choose storage provider
      const storageProvider = provider === 'auto' ? this.config.defaultProvider : provider;

      if (storageProvider === 'google-drive') {
        return await this.uploadToGoogleDrive(file, path, onProgress);
      } else {
        return await this.uploadToFirebase(file, path, onProgress);
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
  private async uploadToGoogleDrive(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> {
    try {
      // Get or create folder for the path
      const folderId = await this.getOrCreateFolder(path);
      
      // Upload file to Google Drive
      const driveFile = await googleDriveService.uploadFile(file, folderId, onProgress);
      
      // Make file public for easy access
      await googleDriveService.makeFilePublic(driveFile.id);
      
      return {
        id: driveFile.id,
        name: file.name,
        url: driveFile.webViewLink,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        storageType: 'google-drive',
        driveFileId: driveFile.id,
        thumbnailUrl: driveFile.thumbnailLink
      };
    } catch (error) {
      throw new Error(`Google Drive upload failed: ${error}`);
    }
  }

  /**
   * Upload file to Firebase Storage
   */
  private async uploadToFirebase(
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
  async uploadMultipleFiles(
    files: File[],
    path: string,
    provider: StorageProvider = 'auto',
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(async (file, index) => {
      try {
        return await this.uploadFile(file, path, provider, (progress) => {
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
  async deleteFile(file: UploadedFile): Promise<void> {
    try {
      if (file.storageType === 'google-drive' && file.driveFileId) {
        await googleDriveService.deleteFile(file.driveFileId);
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
  private async getOrCreateFolder(path: string): Promise<string> {
    try {
      // Split path into folder hierarchy
      const folders = path.split('/').filter(folder => folder.trim() !== '');
      
      let currentFolderId = this.config.googleDriveFolderId || 'root';
      
      for (const folderName of folders) {
        let folderId = await googleDriveService.getFolderByName(folderName, currentFolderId);
        
        if (!folderId) {
          folderId = await googleDriveService.createFolder(folderName, currentFolderId);
        }
        
        currentFolderId = folderId;
      }
      
      return currentFolderId;
    } catch (error) {
      console.error('Error creating folder structure:', error);
      return this.config.googleDriveFolderId || 'root';
    }
  }

  /**
   * Get default storage provider based on environment
   */
  private getDefaultStorageProvider(): StorageProvider {
    // Check if Google Drive is configured
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
  validateFile(file: File, options?: FileValidationOptions): { isValid: boolean; error?: string } {
    const { 
      maxSize = this.config.maxFileSize, 
      allowedTypes = this.config.allowedTypes,
      allowedExtensions = []
    } = options || {};

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

    // Check file extension
    if (allowedExtensions.length > 0) {
      const fileExtension = this.getFileExtension(file.name);
      if (!allowedExtensions.includes(fileExtension)) {
        return {
          isValid: false,
          error: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  /**
   * Check if file is an image
   */
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Check if file is a document
   */
  isDocumentFile(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];
    
    return documentTypes.includes(file.type);
  }

  /**
   * Get file icon based on type
   */
  getFileIcon(file: UploadedFile): string {
    if (this.isImageFile({ type: file.type } as File)) {
      return '🖼️';
    } else if (this.isDocumentFile({ type: file.type } as File)) {
      return '📄';
    } else if (file.type.includes('video')) {
      return '🎥';
    } else if (file.type.includes('audio')) {
      return '🎵';
    } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
      return '📊';
    } else if (file.type.includes('pdf')) {
      return '📕';
    } else {
      return '📁';
    }
  }

  /**
   * Get storage provider info
   */
  getStorageProviderInfo(provider: StorageProvider): {
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

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<FileServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): FileServiceConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const fileService = UnifiedFileService.getInstance();

// Export convenience functions for backward compatibility
export const uploadFile = (file: File, path: string, provider: StorageProvider = 'auto', onProgress?: (progress: UploadProgress) => void) =>
  fileService.uploadFile(file, path, provider, onProgress);

export const uploadMultipleFiles = (files: File[], path: string, provider: StorageProvider = 'auto', onProgress?: (fileIndex: number, progress: UploadProgress) => void) =>
  fileService.uploadMultipleFiles(files, path, provider, onProgress);

export const deleteFile = (file: UploadedFile) =>
  fileService.deleteFile(file);

export const validateFile = (file: File, options?: FileValidationOptions) =>
  fileService.validateFile(file, options);

export const formatFileSize = (bytes: number) =>
  fileService.formatFileSize(bytes);

export const getFileExtension = (filename: string) =>
  fileService.getFileExtension(filename);

export const isImageFile = (file: File) =>
  fileService.isImageFile(file);

export const isDocumentFile = (file: File) =>
  fileService.isDocumentFile(file);

export const getFileIcon = (file: UploadedFile) =>
  fileService.getFileIcon(file);

export const getStorageProviderInfo = (provider: StorageProvider) =>
  fileService.getStorageProviderInfo(provider);
