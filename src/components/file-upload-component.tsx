'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  File, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Trash2, 
  Paperclip,
  X,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { FileUploadService, FileUploadResult } from '@/lib/file-upload-service';
import { useToast } from '@/hooks/use-toast';

interface FileUploadComponentProps {
  onFilesChange: (files: FileUploadResult[]) => void;
  existingFiles?: FileUploadResult[];
  disabled?: boolean;
  maxFiles?: number;
  storageProvider?: 'firebase' | 'google-drive' | 'auto';
  folderPath?: string;
}

export default function FileUploadComponent({ 
  onFilesChange, 
  existingFiles = [], 
  disabled = false,
  maxFiles = 5,
  storageProvider = 'auto',
  folderPath = 'kpi-reports'
}: FileUploadComponentProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>(existingFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-4 h-4 text-purple-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (uploadedFiles.length + files.length > maxFiles) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Chỉ được upload tối đa ${maxFiles} file.`,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress({});
    const validFiles: File[] = [];

    // Validate files
    for (const file of files) {
      const validation = FileUploadService.validateFile(file);
      if (!validation.isValid) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: validation.error,
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }

    try {
      // Upload files using API
      const uploadPromises = validFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderPath', folderPath);
        formData.append('storageProvider', storageProvider);

        const response = await fetch('/api/file-upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          let errorMessage = 'Upload failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            // If response is not JSON, get text
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        return result.data;
      });

      const uploadResults = await Promise.all(uploadPromises);
      const newFiles = [...uploadedFiles, ...uploadResults];
      setUploadedFiles(newFiles);
      onFilesChange(newFiles);

      toast({
        title: 'Thành công',
        description: `Đã upload ${uploadResults.length} file thành công.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể upload file.',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const removeFile = async (index: number) => {
    const file = uploadedFiles[index];
    if (file) {
      try {
        // Delete file using API
        const response = await fetch('/api/file-upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileId: file.id || file.name,
            storageType: 'simulated' // Use simulated for now
          }),
        });

        if (!response.ok) {
          let errorMessage = 'Delete failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            // If response is not JSON, get text
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(newFiles);
        onFilesChange(newFiles);
        
        toast({
          title: 'Thành công',
          description: `Đã xóa file "${file.name}"`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể xóa file.',
        });
      }
    }
  };

  const downloadFile = (file: FileUploadResult) => {
    window.open(file.url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="pt-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className={`text-sm mb-2 ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
              {isDragOver ? 'Thả file vào đây' : 'Kéo thả file vào đây hoặc click để chọn file'}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (tối đa 10MB/file)
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              disabled={disabled || isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Đang upload...' : 'Chọn file'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Tài liệu đã nộp ({uploadedFiles.length}/{maxFiles})
              </h4>
              {uploadedFiles.length > 0 && (
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Đã nộp
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.name)}
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.type}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadFile(file)}
                      disabled={disabled}
                      title="Xem/Tải file"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadFile(file)}
                      disabled={disabled}
                      title="Tải xuống"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {!disabled && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Xóa file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
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
