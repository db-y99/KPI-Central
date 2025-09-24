'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Users, BarChart3, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { seedSampleData, resetAndSeedAllData } from '@/lib/seed-sample-data';
import { initializeCompanyPolicies } from '@/lib/init-company-policies';
import { getSystemStatus } from '@/lib/init-system';

interface SystemStatus {
  isInitialized: boolean;
  collections: Record<string, number>;
  summary: {
    totalDepartments: number;
    totalEmployees: number;
    totalKpis: number;
    totalKpiRecords: number;
    totalRewardPrograms: number;
    totalPositionConfigs: number;
  };
}

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; error?: string } | null>(null);

  const loadSystemStatus = async () => {
    try {
      const status = await getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Error loading system status:', error);
    }
  };

  const handleSeedSampleData = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await seedSampleData();
      setResult({
        success: response.success,
        message: response.success 
          ? `Đã seed thành công ${response.employees} nhân viên, ${response.kpiRecords} KPI records và ${response.metricData} metric data`
          : 'Có lỗi xảy ra khi seed dữ liệu',
        error: response.error
      });
      
      if (response.success) {
        await loadSystemStatus();
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Có lỗi xảy ra khi seed dữ liệu',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitPolicies = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await initializeCompanyPolicies();
      setResult({
        success: response.success,
        message: response.success 
          ? `Đã khởi tạo thành công ${response.departments} phòng ban, ${response.rewardPrograms} chương trình thưởng và ${response.kpis} KPIs`
          : 'Có lỗi xảy ra khi khởi tạo chính sách',
        error: response.error
      });
      
      if (response.success) {
        await loadSystemStatus();
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Có lỗi xảy ra khi khởi tạo chính sách',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndSeedAll = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await resetAndSeedAllData();
      setResult({
        success: response.success,
        message: response.success 
          ? 'Đã reset và seed lại toàn bộ dữ liệu thành công'
          : 'Có lỗi xảy ra khi reset và seed dữ liệu',
        error: response.error
      });
      
      if (response.success) {
        await loadSystemStatus();
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Có lỗi xảy ra khi reset và seed dữ liệu',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load system status on component mount
  React.useEffect(() => {
    loadSystemStatus();
  }, []);

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seed Data Management</h1>
          <p className="text-muted-foreground">
            Quản lý và khởi tạo dữ liệu mẫu cho hệ thống KPI Central
          </p>
        </div>
        <Button 
          onClick={loadSystemStatus} 
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* System Status */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Trạng thái hiện tại của hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {systemStatus.summary.totalDepartments}
                </div>
                <div className="text-sm text-muted-foreground">Departments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {systemStatus.summary.totalEmployees}
                </div>
                <div className="text-sm text-muted-foreground">Employees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {systemStatus.summary.totalKpis}
                </div>
                <div className="text-sm text-muted-foreground">KPIs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {systemStatus.summary.totalKpiRecords}
                </div>
                <div className="text-sm text-muted-foreground">KPI Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {systemStatus.summary.totalRewardPrograms}
                </div>
                <div className="text-sm text-muted-foreground">Reward Programs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {systemStatus.summary.totalPositionConfigs}
                </div>
                <div className="text-sm text-muted-foreground">Position Configs</div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={systemStatus.isInitialized ? "default" : "secondary"}>
                {systemStatus.isInitialized ? "Initialized" : "Not Initialized"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Initialize Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Initialize Policies
            </CardTitle>
            <CardDescription>
              Khởi tạo phòng ban, chương trình thưởng và định nghĩa KPI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleInitPolicies}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Initialize Policies
            </Button>
          </CardContent>
        </Card>

        {/* Seed Sample Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Seed Sample Data
            </CardTitle>
            <CardDescription>
              Thêm nhân viên mẫu và KPI records để test hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedSampleData}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Seed Sample Data
            </Button>
          </CardContent>
        </Card>

        {/* Reset and Seed All */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Reset & Seed All
            </CardTitle>
            <CardDescription>
              Reset toàn bộ dữ liệu và seed lại từ đầu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleResetAndSeedAll}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Reset & Seed All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Result Alert */}
      {result && (
        <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
              {result.message}
              {result.error && (
                <div className="mt-2 text-sm">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Hướng dẫn sử dụng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Initialize Policies (Khởi tạo chính sách)</h4>
            <p className="text-sm text-muted-foreground">
              Tạo các phòng ban, chương trình thưởng và định nghĩa KPI theo chính sách công ty.
              Chạy bước này trước khi seed dữ liệu mẫu.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">2. Seed Sample Data (Thêm dữ liệu mẫu)</h4>
            <p className="text-sm text-muted-foreground">
              Thêm 13 nhân viên mẫu từ các phòng ban khác nhau và các KPI records để test hệ thống.
              Bao gồm cả metric data để test tính năng tracking.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">3. Reset & Seed All (Reset và seed lại toàn bộ)</h4>
            <p className="text-sm text-muted-foreground">
              Xóa toàn bộ dữ liệu hiện tại và seed lại từ đầu. Sử dụng khi muốn bắt đầu lại hoàn toàn.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800">💡 Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Sau khi seed dữ liệu, bạn có thể đăng nhập với tài khoản admin: db@y99.vn / 123456</li>
              <li>• Dữ liệu mẫu bao gồm các nhân viên từ tất cả phòng ban với KPI records thực tế</li>
              <li>• Có thể test các tính năng: tracking KPI, tính thưởng, báo cáo, v.v.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
