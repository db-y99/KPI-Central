'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, FileText, Image, File, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadFile, validateFile, formatFileSize, type UploadedFile, type UploadProgress } from '@/lib/file-upload';

interface FileUploadProps {
  path: string;
  onFilesUploaded: (files: UploadedFile[]) => void;
  onFileRemoved: (fileUrl: string) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  className?: string;
}

interface FileUploadState {
  files: File[];
  uploadedFiles: UploadedFile[];
  uploadProgress: { [key: string]: UploadProgress };
  errors: { [key: string]: string };
}

export default function FileUpload({
  path,
  onFilesUploaded,
  onFileRemoved,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = [],
  className = ''
}: FileUploadProps) {
  const [state, setState] = useState<FileUploadState>({
    files: [],
    uploadedFiles: [],
    uploadProgress: {},
    errors: {}
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Check max files limit
    if (state.files.length + selectedFiles.length > maxFiles) {
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          general: `Chỉ được upload tối đa ${maxFiles} file`
        }
      }));
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const errors: { [key: string]: string } = {};

    selectedFiles.forEach((file, index) => {
      const validation = validateFile(file, { maxSize, allowedTypes });
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors[`file-${index}`] = validation.error || 'File không hợp lệ';
      }
    });

    setState(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles],
      errors: { ...prev.errors, ...errors }
    }));

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (state.files.length === 0) return;

    const uploadedFiles: UploadedFile[] = [];
    
    for (let i = 0; i < state.files.length; i++) {
      const file = state.files[i];
      const fileKey = `file-${i}`;
      
      try {
        setState(prev => ({
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            [fileKey]: { progress: 0, status: 'uploading' }
          }
        }));

        const uploadedFile = await uploadFile(file, path, (progress) => {
          setState(prev => ({
            ...prev,
            uploadProgress: {
              ...prev.uploadProgress,
              [fileKey]: progress
            }
          }));
        });

        uploadedFiles.push(uploadedFile);
        
        setState(prev => ({
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            [fileKey]: { progress: 100, status: 'completed' }
          }
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            [fileKey]: { 
              progress: 0, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          },
          errors: {
            ...prev.errors,
            [fileKey]: error instanceof Error ? error.message : 'Upload failed'
          }
        }));
      }
    }

    if (uploadedFiles.length > 0) {
      setState(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles],
        files: []
      }));
      
      onFilesUploaded(uploadedFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      errors: Object.fromEntries(
        Object.entries(prev.errors).filter(([key]) => key !== `file-${index}`)
      )
    }));
  };

  const handleRemoveUploadedFile = (fileUrl: string) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(file => file.url !== fileUrl)
    }));
    
    onFileRemoved(fileUrl);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const getUploadedFileIcon = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Files
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop files here, or click to select files
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mb-2"
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept={allowedTypes.join(',')}
            />
            <p className="text-sm text-gray-400">
              Max {maxFiles} files, {formatFileSize(maxSize)} each
            </p>
          </div>
        </CardContent>
      </Card>

      {/* General Error */}
      {state.errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Selected Files */}
      {state.files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Selected Files ({state.files.length})</h4>
            <div className="space-y-2">
              {state.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {state.errors[`file-${index}`] && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Upload Progress */}
                  {state.uploadProgress[`file-${index}`] && (
                    <div className="w-full mt-2">
                      <Progress 
                        value={state.uploadProgress[`file-${index}`].progress} 
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {state.uploadProgress[`file-${index}`].status === 'uploading' && 'Uploading...'}
                        {state.uploadProgress[`file-${index}`].status === 'completed' && 'Completed'}
                        {state.uploadProgress[`file-${index}`].status === 'error' && 'Error'}
                      </p>
                    </div>
                  )}
                  
                  {/* File Error */}
                  {state.errors[`file-${index}`] && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{state.errors[`file-${index}`]}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={handleUpload} disabled={state.files.length === 0}>
                Upload Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {state.uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Uploaded Files ({state.uploadedFiles.length})</h4>
            <div className="space-y-2">
              {state.uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded bg-green-50">
                  <div className="flex items-center gap-3">
                    {getUploadedFileIcon(file)}
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUploadedFile(file.url)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
