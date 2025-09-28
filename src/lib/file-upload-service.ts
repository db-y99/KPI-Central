import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface FileUploadResult {
  name: string;
  url: string;
  size: string;
  type: string;
  uploadedAt: string;
}

export class FileUploadService {
  /**
   * Validate file before upload
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
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

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Upload file to Firebase Storage
   */
  static async uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    try {
      // Create a reference to the file location
      const fileRef = ref(storage, `${path}/${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(fileRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Format file size
      const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
      
      return {
        name: file.name,
        url: downloadURL,
        size: formatFileSize(file.size),
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Không thể upload file. Vui lòng thử lại.');
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(
    files: File[], 
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, path, onProgress));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from Firebase Storage
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Không thể xóa file. Vui lòng thử lại.');
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File ${file.name} quá lớn. Kích thước tối đa là 10MB.`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File ${file.name} không được hỗ trợ. Chỉ chấp nhận PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF.`
      };
    }

    return { isValid: true };
  }

  /**
   * Generate file path for KPI records
   */
  static generateKpiRecordPath(employeeId: string, kpiRecordId: string): string {
    return `kpi-records/${employeeId}/${kpiRecordId}`;
  }
}
