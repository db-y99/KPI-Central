import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink?: string;
  size: number;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  thumbnailLink?: string;
}

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private drive: any;
  private oauth2Client: OAuth2Client;

  private constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_DRIVE_REDIRECT_URI || process.env.GOOGLE_OAUTH_REDIRECT_URI
    );

    // Set credentials if refresh token is available
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
    if (refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });
    }

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(
    file: File,
    folderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DriveFile> {
    try {
      onProgress?.({ progress: 0, status: 'uploading' });

      // Convert File to Buffer
      const buffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(buffer);

      onProgress?.({ progress: 30, status: 'uploading' });

      // Upload file to Google Drive
      const response = await this.drive.files.create({
        requestBody: {
          name: `${Date.now()}_${file.name}`,
          parents: [folderId],
          mimeType: file.type,
        },
        media: {
          mimeType: file.type,
          body: fileBuffer,
        },
        fields: 'id,name,webViewLink,webContentLink,size,mimeType,createdTime,modifiedTime,thumbnailLink',
      });

      onProgress?.({ progress: 100, status: 'completed' });

      return {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        size: parseInt(response.data.size || '0'),
        mimeType: response.data.mimeType,
        createdTime: response.data.createdTime,
        modifiedTime: response.data.modifiedTime,
        thumbnailLink: response.data.thumbnailLink,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onProgress?.({ progress: 0, status: 'error', error: errorMessage });
      throw new Error(`Google Drive upload failed: ${errorMessage}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    folderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root',
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<DriveFile[]> {
    const uploadPromises = files.map(async (file, index) => {
      try {
        return await this.uploadFile(file, folderId, (progress) => {
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
   * Get file by ID
   */
  async getFile(fileId: string): Promise<DriveFile> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id,name,webViewLink,webContentLink,size,mimeType,createdTime,modifiedTime,thumbnailLink',
      });

      return {
        id: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        size: parseInt(response.data.size || '0'),
        mimeType: response.data.mimeType,
        createdTime: response.data.createdTime,
        modifiedTime: response.data.modifiedTime,
        thumbnailLink: response.data.thumbnailLink,
      };
    } catch (error) {
      throw new Error(`Failed to get file: ${error}`);
    }
  }

  /**
   * Delete file by ID
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId,
      });
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * List files in folder
   */
  async listFiles(folderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'): Promise<DriveFile[]> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,webViewLink,webContentLink,size,mimeType,createdTime,modifiedTime,thumbnailLink)',
        orderBy: 'createdTime desc',
      });

      return response.data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        size: parseInt(file.size || '0'),
        mimeType: file.mimeType,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        thumbnailLink: file.thumbnailLink,
      }));
    } catch (error) {
      throw new Error(`Failed to list files: ${error}`);
    }
  }

  /**
   * Create folder
   */
  async createFolder(name: string, parentFolderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'): Promise<string> {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId],
        },
        fields: 'id',
      });

      return response.data.id;
    } catch (error) {
      throw new Error(`Failed to create folder: ${error}`);
    }
  }

  /**
   * Get download URL for file
   */
  async getDownloadUrl(fileId: string): Promise<string> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'webContentLink',
      });

      return response.data.webContentLink || '';
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error}`);
    }
  }

  /**
   * Set file permissions (make public)
   */
  async makeFilePublic(fileId: string): Promise<void> {
    try {
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (error) {
      throw new Error(`Failed to make file public: ${error}`);
    }
  }

  /**
   * Get folder by name
   */
  async getFolderByName(folderName: string, parentFolderId: string = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'): Promise<string | null> {
    try {
      const response = await this.drive.files.list({
        q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id)',
      });

      return response.data.files.length > 0 ? response.data.files[0].id : null;
    } catch (error) {
      throw new Error(`Failed to get folder: ${error}`);
    }
  }

  /**
   * Get or create folder for KPI reports
   */
  async getOrCreateKPIFolder(): Promise<string> {
    const folderName = 'KPI-Central-Reports';
    const existingFolder = await this.getFolderByName(folderName);
    
    if (existingFolder) {
      return existingFolder;
    }

    return await this.createFolder(folderName);
  }
}

export const googleDriveService = GoogleDriveService.getInstance();
