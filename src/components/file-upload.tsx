'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';
import { 
  uploadFile, 
  uploadMultipleFiles, 
  validateFile, 
  formatFileSize, 
  isImageFile, 
  isDocumentFile,
  type UploadedFile,
  type UploadProgress 
} from '@/lib/file-upload';

interface FileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  onFileRemoved?: (fileUrl: string) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  path: string; // Firebase Storage path
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

interface FileItem {
  file: File;
  progress: UploadProgress;
  uploadedFile?: UploadedFile;
}

export default function FileUpload({
  onFilesUploaded,
  onFileRemoved,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ],
  path,
  multiple = true,
  className,
  disabled = false
}: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      alert(`Chỉ được upload tối đa ${maxFiles} file`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const validation = validateFile(file, { maxSize, allowedTypes });
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        alert(`File ${file.name}: ${validation.error}`);
      }
    }

    if (validFiles.length === 0) return;

    // Add files to state
    const newFileItems: FileItem[] = validFiles.map(file => ({
      file,
      progress: { progress: 0, status: 'uploading' }
    }));

    setFiles(prev => [...prev, ...newFileItems]);
    setIsUploading(true);

    try {
      // Upload files
      const uploadedFiles = await uploadMultipleFiles(
        validFiles,
        path,
        (fileIndex, progress) => {
          setFiles(prev => prev.map((item, index) => {
            const globalIndex = prev.length - validFiles.length + fileIndex;
            if (index === globalIndex) {
              return { ...item, progress };
            }
            return item;
          }));
        }
      );

      // Update files with uploaded data
      setFiles(prev => prev.map((item, index) => {
        const uploadedIndex = index - (prev.length - validFiles.length);
        if (uploadedIndex >= 0 && uploadedIndex < uploadedFiles.length) {
          return { ...item, uploadedFile: uploadedFiles[uploadedIndex] };
        }
        return item;
      }));

      // Notify parent component
      onFilesUploaded?.(uploadedFiles);
    } catch (error) {
      console.error('Upload failed:', error);
      // Update error status
      setFiles(prev => prev.map(item => ({
        ...item,
        progress: { progress: 0, status: 'error', error: 'Upload failed' }
      })));
    } finally {
      setIsUploading(false);
    }
  }, [files.length, maxFiles, maxSize, allowedTypes, path, onFilesUploaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove.uploadedFile) {
      onFileRemoved?.(fileToRemove.uploadedFile.url);
    }
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, [files, onFileRemoved]);

  const getFileIcon = (file: File) => {
    if (isImageFile(file)) return <Image className="w-4 h-4" />;
    if (isDocumentFile(file)) return <File className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getStatusIcon = (progress: UploadProgress) => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-1">
          {dragActive ? "Thả file vào đây" : "Kéo thả file hoặc click để chọn file"}
        </p>
        <p className="text-xs text-muted-foreground">
          {allowedTypes.includes('image/') ? 'Hình ảnh, ' : ''}
          PDF, Word, Excel, PowerPoint (tối đa {formatFileSize(maxSize)})
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Tối đa {maxFiles} file
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                {getFileIcon(fileItem.file)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(fileItem.file.size)}
                </p>
                
                {fileItem.progress.status === 'uploading' && (
                  <div className="mt-2">
                    <Progress value={fileItem.progress.progress} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {fileItem.progress.progress}% - Đang upload...
                    </p>
                  </div>
                )}
                
                {fileItem.progress.status === 'error' && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {fileItem.progress.error || 'Upload failed'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(fileItem.progress)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Đang upload {files.filter(f => f.progress.status === 'uploading').length} file...
          </p>
        </div>
      )}
    </div>
  );
}
