'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Building2, 
  Gift, 
  Target, 
  Database,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataStats {
  departments: number;
  rewardPrograms: number;
  kpis: number;
}

export default function PoliciesOverviewPage() {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - trong thực tế bạn sẽ gọi API để lấy số liệu
      // Tạm thời sử dụng số liệu từ script khởi tạo
      setStats({
        departments: 6,
        rewardPrograms: 7,
        kpis: 19
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi tải dữ liệu',
        description: 'Không thể tải thống kê dữ liệu.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const policies = [
    {
      position: 'Nhân viên IT',
      department: 'IT',
      quarterlyRewards: [
        '300k: hệ thống chạy ổn định',
        '200k: sao lưu dữ liệu', 
        '200k: mỗi lần sửa chữa',
        '300k: báo cáo'
      ],
      annualRewards: [
        '2-5 triệu: cải tiến hoạt động',
        '1-2 triệu: kiểm toán, phân tích',
        'Lương tháng 13'
      ],
      penalties: [
        '300k: hệ thống bị downtime',
        '500k: nhật ký không đầy đủ'
      ]
    },
    {
      position: 'Trưởng bộ phận Marketing',
      department: 'Marketing',
      quarterlyRewards: [
        '500k: > 50 khách hàng tiềm năng',
        '100k: mỗi 10 khoản vay',
        '1-3 triệu: chiến dịch viral'
      ],
      annualRewards: [
        '1% dư nợ cho vay (tối đa 6 triệu/quý)',
        'Lương tháng 13'
      ],
      penalties: [
        'Không thưởng nếu < 20 khách hàng tiềm năng',
        '500k: khách hàng giả'
      ]
    },
    {
      position: 'Trợ lý Marketing',
      department: 'Marketing',
      quarterlyRewards: [
        '200k: đủ 50 khách hàng tiềm năng',
        '50k: mỗi 10 khoản vay'
      ],
      annualRewards: [
        '0.5% dư nợ cho vay (tối đa 3 triệu/quý)',
        'Lương tháng 13'
      ],
      penalties: [
        'Không thưởng nếu < 20 khách hàng tiềm năng',
        'Cảnh cáo nếu khách hàng giả'
      ]
    },
    {
      position: 'CSO – Chăm sóc khách hàng',
      department: 'Customer Service',
      quarterlyRewards: [],
      annualRewards: [
        'Tính theo điểm hàng tháng',
        'Lương tháng 13',
        'Thưởng theo lợi nhuận công ty'
      ],
      penalties: [
        '500k: sai chứng từ',
        'Cảnh cáo: bỏ lỡ chăm sóc khách hàng'
      ]
    },
    {
      position: 'CA – Thẩm định tín dụng',
      department: 'Credit',
      quarterlyRewards: [],
      annualRewards: [
        'Tính theo điểm hàng tháng',
        '5-10 triệu: nếu nợ xấu < 5%',
        '5 triệu: top 10 nhân viên xuất sắc',
        'Lương tháng 13'
      ],
      penalties: [
        '500k: nếu nợ xấu > 10%',
        '200k: thiếu nhật ký thu hồi nợ'
      ]
    },
    {
      position: 'HR/Admin – Hành chính nhân sự',
      department: 'HR/Admin',
      quarterlyRewards: [
        '300k: hồ sơ nhân sự',
        '300k: bảng lương',
        '200k: tuân thủ',
        '200k: sáng kiến'
      ],
      annualRewards: [
        '1-2 triệu: không vi phạm tuân thủ',
        '2-5 triệu: cải tiến hệ thống',
        'Lương tháng 13'
      ],
      penalties: [
        '300k: chậm trả lương',
        '200k: nộp hồ sơ muộn'
      ]
    },
    {
      position: 'Kế toán',
      department: 'Accounting',
      quarterlyRewards: [
        '300k: báo cáo',
        '300k: đối chiếu',
        '200k: tiết kiệm chi phí',
        '300k: khai thuế'
      ],
      annualRewards: [
        '2-5 triệu: kiểm toán tốt',
        '1-2 triệu: tiết kiệm dự báo',
        'Lương tháng 13'
      ],
      penalties: [
        '300k: nộp thuế muộn',
        '200k: chênh lệch tiền mặt/ngân hàng'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tổng quan chính sách công ty</h1>
          <p className="text-muted-foreground">
            Dữ liệu chính sách thưởng phạt đã được khởi tạo thành công vào Firebase Firestore
          </p>
        </div>
        <Button onClick={fetchStats} disabled={isLoading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng ban</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.departments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Phòng ban đã được tạo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chương trình thưởng</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.rewardPrograms || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Chương trình thưởng cho các vị trí
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KPI Definitions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.kpis || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Định nghĩa KPI với thưởng/phạt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trạng thái khởi tạo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Trạng thái khởi tạo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">✅ Khởi tạo thành công!</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <p>• Tất cả dữ liệu chính sách công ty đã được lưu vào Firebase Firestore</p>
            <p>• Hệ thống KPI và chương trình thưởng đã sẵn sàng sử dụng</p>
            <p>• Admin có thể quản lý và chỉnh sửa dữ liệu qua giao diện web</p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button asChild>
              <a href="/admin/kpi-definitions">
                <Target className="w-4 h-4 mr-2" />
                Quản lý KPI
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin/reward-programs">
                <Gift className="w-4 h-4 mr-2" />
                Chương trình thưởng
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin/departments">
                <Building2 className="w-4 h-4 mr-2" />
                Phòng ban
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chi tiết chính sách */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết chính sách thưởng phạt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {policies.map((policy, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{policy.department}</Badge>
                  <h4 className="font-semibold">{policy.position}</h4>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {policy.quarterlyRewards.length > 0 && (
                    <div>
                      <h5 className="font-medium text-green-600 mb-2">Thưởng quý:</h5>
                      <ul className="text-sm space-y-1">
                        {policy.quarterlyRewards.map((reward, idx) => (
                          <li key={idx} className="text-muted-foreground">• {reward}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h5 className="font-medium text-blue-600 mb-2">Thưởng năm:</h5>
                    <ul className="text-sm space-y-1">
                      {policy.annualRewards.map((reward, idx) => (
                        <li key={idx} className="text-muted-foreground">• {reward}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-red-600 mb-2">Phạt:</h5>
                    <ul className="text-sm space-y-1">
                      {policy.penalties.map((penalty, idx) => (
                        <li key={idx} className="text-muted-foreground">• {penalty}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hướng dẫn sử dụng */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Hướng dẫn sử dụng hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Quản lý KPI:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <a href="/admin/kpi-definitions" className="text-blue-600 hover:underline">Định nghĩa KPI</a> - Tạo và chỉnh sửa KPI</li>
                  <li>• <a href="/admin/kpi-assignment" className="text-blue-600 hover:underline">Gán KPI</a> - Gán KPI cho nhân viên</li>
                  <li>• <a href="/admin/kpi-tracking" className="text-blue-600 hover:underline">Theo dõi KPI</a> - Xem hiệu suất thực tế</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Quản lý thưởng:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <a href="/admin/reward-programs" className="text-blue-600 hover:underline">Chương trình thưởng</a> - Quản lý chính sách</li>
                  <li>• <a href="/admin/reward-calculations" className="text-blue-600 hover:underline">Tính toán thưởng</a> - Xem báo cáo thưởng</li>
                  <li>• <a href="/admin/reports" className="text-blue-600 hover:underline">Báo cáo</a> - Xuất báo cáo tổng hợp</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Lưu ý:</strong> Tất cả dữ liệu đã được lưu trữ trong Firebase Firestore và có thể truy cập từ mọi nơi trong hệ thống. 
                Bạn có thể bắt đầu sử dụng ngay bây giờ!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
