'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  TestTube,
  FolderPlus,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoogleDriveConfig {
  clientId: boolean;
  clientSecret: boolean;
  redirectUri: boolean;
  refreshToken: boolean;
  folderId: boolean;
}

interface TestResult {
  filesCount: number;
  files: any[];
}

export default function GoogleDriveConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<GoogleDriveConfig | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/google-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'check-config' }),
      });

      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      } else {
        toast({
          title: "Lỗi kiểm tra cấu hình",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kiểm tra cấu hình Google Drive",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/google-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test-connection' }),
      });

      const data = await response.json();
      if (data.success) {
        setTestResult(data.data);
        toast({
          title: "Kết nối thành công",
          description: `Tìm thấy ${data.data.filesCount} file trong Google Drive`,
        });
      } else {
        toast({
          title: "Lỗi kết nối",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến Google Drive",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const createKPIFolder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/google-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'create-folder',
          folderName: 'KPI-Central-Reports'
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Tạo folder thành công",
          description: `Folder "${data.data.name}" đã được tạo`,
        });
        // Refresh configuration
        await checkConfiguration();
      } else {
        toast({
          title: "Lỗi tạo folder",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Lỗi tạo folder",
        description: "Không thể tạo folder trong Google Drive",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConfigStatus = (isConfigured: boolean) => {
    return isConfigured ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Đã cấu hình
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Chưa cấu hình
      </Badge>
    );
  };

  const allConfigured = config ? Object.values(config).every(Boolean) : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Google Drive Configuration</h1>
          <p className="text-muted-foreground">
            Cấu hình tích hợp Google Drive cho hệ thống KPI Central
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="w-8 h-8 text-blue-500" />
          <Badge variant={allConfigured ? "default" : "destructive"}>
            {allConfigured ? "Sẵn sàng" : "Cần cấu hình"}
          </Badge>
        </div>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Trạng thái cấu hình
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang kiểm tra cấu hình...</span>
            </div>
          ) : config ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span>Client ID</span>
                {getConfigStatus(config.clientId)}
              </div>
              <div className="flex items-center justify-between">
                <span>Client Secret</span>
                {getConfigStatus(config.clientSecret)}
              </div>
              <div className="flex items-center justify-between">
                <span>Redirect URI</span>
                {getConfigStatus(config.redirectUri)}
              </div>
              <div className="flex items-center justify-between">
                <span>Refresh Token</span>
                {getConfigStatus(config.refreshToken)}
              </div>
              <div className="flex items-center justify-between">
                <span>Folder ID</span>
                {getConfigStatus(config.folderId)}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Không thể tải cấu hình</p>
          )}

          <div className="flex gap-2">
            <Button onClick={checkConfiguration} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Kiểm tra lại
            </Button>
            {allConfigured && (
              <Button onClick={testConnection} disabled={isTesting}>
                <TestTube className="w-4 h-4 mr-2" />
                {isTesting ? "Đang test..." : "Test kết nối"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Kết quả test kết nối
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Kết nối thành công!</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Tìm thấy <strong>{testResult.filesCount}</strong> file trong Google Drive</p>
                {testResult.files.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Files gần đây:</p>
                    <ul className="list-disc list-inside mt-1">
                      {testResult.files.slice(0, 3).map((file, index) => (
                        <li key={index} className="text-xs">
                          {file.name} ({file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown size'})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={createKPIFolder} 
              disabled={!allConfigured || isLoading}
              className="w-full"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Tạo folder KPI-Central-Reports
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://drive.google.com', '_blank')}
              className="w-full"
            >
              <Cloud className="w-4 h-4 mr-2" />
              Mở Google Drive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn cấu hình</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p><strong>1. Client ID & Secret:</strong> Đã được cấu hình từ Google Cloud Console</p>
            <p><strong>2. Redirect URI:</strong> Sử dụng OAuth Playground để lấy refresh token</p>
            <p><strong>3. Refresh Token:</strong> Đã được lấy từ OAuth Playground</p>
            <p><strong>4. Folder ID:</strong> ID của folder gốc trong Google Drive</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Thông tin cấu hình hiện tại:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Client ID:</strong> 813460150899-94r9dg320n14090n4m5f7je98hpuupv6.apps.googleusercontent.com</p>
              <p><strong>Folder ID:</strong> 0AJrEp6oxHLuBUk9PVA</p>
              <p><strong>Status:</strong> {allConfigured ? "✅ Đã cấu hình đầy đủ" : "❌ Cần cấu hình thêm"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
