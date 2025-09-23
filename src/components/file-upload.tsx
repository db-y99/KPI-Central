'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  X, 
  Download, 
  Eye,
  Cloud,
  Database,
  Settings
} from 'lucide-react';
import { 
  uploadFile, 
  uploadMultipleFiles, 
  deleteFile, 
  formatFileSize, 
  getFileIcon,
  getStorageProviderInfo,
  type UploadedFile,
  type UploadProgress,
  type StorageProvider
} from '@/lib/file-upload-service';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onFilesRemoved: (fileIds: string[]) => void;
  uploadedFiles?: UploadedFile[];
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
  storageProvider?: StorageProvider;
  folderPath?: string;
  className?: string;
}

export default function FileUpload({
  onFilesUploaded,
  onFilesRemoved,
  uploadedFiles = [],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = [],
  storageProvider = 'auto',
  folderPath = 'uploads',
  className = ''
}: FileUploadProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, UploadProgress>>({});
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file, index) => {
      if (uploadedFiles.length + validFiles.length >= maxFiles) {
        errors.push(t.fileUpload.maxFilesError.replace('{max}', maxFiles.toString()));
        return;
      }

      if (file.size > maxSize) {
        errors.push(t.fileUpload.fileTooLargeError.replace('{name}', file.name).replace('{size}', formatFileSize(maxSize)));
        return;
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        errors.push(t.fileUpload.fileTypeError.replace('{name}', file.name));
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast({
        title: t.fileUpload.uploadError,
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress({});

    try {
      const uploadedFiles = await uploadMultipleFiles(
        validFiles,
        folderPath,
        storageProvider,
        (fileIndex, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileIndex]: progress
          }));
        }
      );

      onFilesUploaded(uploadedFiles);
      
      toast({
        title: t.fileUpload.uploadSuccess,
        description: t.fileUpload.filesUploaded.replace('{count}', uploadedFiles.length.toString()),
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t.fileUpload.uploadError,
        description: error instanceof Error ? error.message : t.fileUpload.cannotDelete,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileRemove = async (fileId: string) => {
    try {
      const file = uploadedFiles.find(f => f.id === fileId);
      if (file) {
        await deleteFile(file);
        onFilesRemoved([fileId]);
        
        toast({
          title: t.fileUpload.deleteSuccess,
          description: `Đã xóa file "${file.name}"`,
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: t.fileUpload.deleteError,
        description: error instanceof Error ? error.message : t.fileUpload.cannotDelete,
        variant: "destructive"
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const getStorageProviderIcon = () => {
    const info = getStorageProviderInfo(storageProvider);
    return info.icon;
  };

  const getStorageProviderName = () => {
    const info = getStorageProviderInfo(storageProvider);
    return info.name;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Storage Provider Info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Settings className="w-4 h-4" />
        <span>Storage: {getStorageProviderName()}</span>
        <span className="text-lg">{getStorageProviderIcon()}</span>
      </div>

      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Upload Files</h3>
              <p className="text-sm text-muted-foreground">
                Kéo thả file vào đây hoặc click để chọn file
              </p>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Max {maxFiles} files, {formatFileSize(maxSize)} per file</p>
              {allowedTypes.length > 0 && (
                <p>Types: {allowedTypes.join(', ')}</p>
              )}
            </div>

            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || uploadedFiles.length >= maxFiles}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Upload Progress</h4>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([index, progress]) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>File {parseInt(index) + 1}</span>
                    <span>{progress.progress}%</span>
                  </div>
                  <Progress value={progress.progress} className="h-2" />
                  {progress.status === 'error' && (
                    <p className="text-xs text-destructive">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg">{getFileIcon(file)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.storageType === 'google-drive' ? (
                            <>
                              <Cloud className="w-3 h-3 mr-1" />
                              Drive
                            </>
                          ) : (
                            <>
                              <Database className="w-3 h-3 mr-1" />
                              Firebase
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileRemove(file.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}