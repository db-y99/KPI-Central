'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Building2,
  Gift,
  Target,
  Users
} from 'lucide-react';

interface InitResult {
  success: boolean;
  departments?: number;
  rewardPrograms?: number;
  kpis?: number;
  error?: string;
}

export default function CompanyPoliciesInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initResult, setInitResult] = useState<InitResult | null>(null);
  const { toast } = useToast();

  const initializePolicies = async () => {
    setIsInitializing(true);
    setInitResult(null);

    try {
      // Import và chạy function khởi tạo
      const { initializeCompanyPolicies } = await import('@/lib/init-company-policies');
      const result = await initializeCompanyPolicies();

      setInitResult(result);

      if (result.success) {
        toast({
          title: 'Khởi tạo thành công!',
          description: `Đã tạo ${result.departments} phòng ban, ${result.rewardPrograms} chương trình thưởng và ${result.kpis} KPI definitions.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Khởi tạo thất bại',
          description: result.error || 'Có lỗi xảy ra trong quá trình khởi tạo.',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setInitResult({
        success: false,
        error: errorMessage
      });
      
      toast({
        variant: 'destructive',
        title: 'Lỗi khởi tạo',
        description: errorMessage,
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Khởi tạo chính sách công ty</h1>
          <p className="text-muted-foreground">
            Khởi tạo dữ liệu phòng ban, chương trình thưởng và KPI definitions theo chính sách của công ty
          </p>
        </div>
        <Button 
          onClick={initializePolicies}
          disabled={isInitializing}
          className="flex items-center gap-2"
        >
          {isInitializing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {isInitializing ? 'Đang khởi tạo...' : 'Khởi tạo dữ liệu'}
        </Button>
      </div>

      {/* Chính sách sẽ được tạo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Chính sách sẽ được khởi tạo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Phòng ban</span>
                <Badge variant="outline">6 phòng ban</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• IT</li>
                <li>• Marketing</li>
                <li>• Customer Service</li>
                <li>• Credit</li>
                <li>• HR/Admin</li>
                <li>• Accounting</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="font-medium">Chương trình thưởng</span>
                <Badge variant="outline">7 chương trình</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• IT Staff</li>
                <li>• Head of Marketing</li>
                <li>• Marketing Assistant</li>
                <li>• Customer Service Officer</li>
                <li>• Credit Appraisal Staff</li>
                <li>• HR/Admin Staff</li>
                <li>• Accountant</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="font-medium">KPI Definitions</span>
                <Badge variant="outline">18 KPI</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Thời gian hoạt động hệ thống</li>
                <li>• Sao lưu dữ liệu</li>
                <li>• Công việc sửa chữa</li>
                <li>• Khách hàng tiềm năng</li>
                <li>• Khoản vay xử lý</li>
                <li>• Và nhiều KPI khác...</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kết quả khởi tạo */}
      {initResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {initResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              Kết quả khởi tạo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {initResult.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Khởi tạo thành công!</span>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Phòng ban: </span>
                    <Badge variant="outline">{initResult.departments}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span>Chương trình thưởng: </span>
                    <Badge variant="outline">{initResult.rewardPrograms}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span>KPI definitions: </span>
                    <Badge variant="outline">{initResult.kpis}</Badge>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Tất cả dữ liệu chính sách công ty đã được khởi tạo thành công vào Firebase Firestore.
                    Bạn có thể bắt đầu sử dụng hệ thống KPI và chương trình thưởng ngay bây giờ.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Khởi tạo thất bại</span>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    ❌ {initResult.error || 'Có lỗi xảy ra trong quá trình khởi tạo dữ liệu.'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hướng dẫn sử dụng */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Hướng dẫn sử dụng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">1.</span>
              <span>Nhấn nút "Khởi tạo dữ liệu" để tạo tất cả phòng ban, chương trình thưởng và KPI definitions.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">2.</span>
              <span>Sau khi khởi tạo thành công, bạn có thể:</span>
            </div>
            <ul className="ml-6 space-y-1 text-muted-foreground">
              <li>• Xem và chỉnh sửa KPI definitions tại <code>/admin/kpi-definitions</code></li>
              <li>• Quản lý chương trình thưởng tại <code>/admin/reward-programs</code></li>
              <li>• Gán KPI cho nhân viên tại <code>/admin/kpi-assignment</code></li>
              <li>• Theo dõi hiệu suất tại <code>/admin/kpi-tracking</code></li>
            </ul>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">3.</span>
              <span>Tất cả dữ liệu sẽ được lưu trữ trong Firebase Firestore và có thể truy cập từ mọi nơi trong hệ thống.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
