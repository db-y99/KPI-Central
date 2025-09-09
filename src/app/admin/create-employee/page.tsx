'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Building2, Users } from 'lucide-react';
import AddEmployeeForm from '@/components/add-employee-form';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import Loading from '@/app/loading';

export default function CreateEmployeePage() {
  const { departments, employees, loading } = useContext(DataContext);
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveEmployee = async () => {
    setIsSubmitting(true);
    try {
      toast({
        title: 'Thành công!',
        description: 'Nhân viên đã được tạo thành công.',
      });
      
      // Redirect to employees page after successful creation
      setTimeout(() => {
        router.push('/admin/employees');
      }, 1500);
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo nhân viên. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    router.push('/admin/employees');
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/employees')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-primary" />
              Tạo nhân viên mới
            </h1>
            <p className="text-muted-foreground mt-1">
              Thêm nhân viên mới vào hệ thống KPI
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng nhân viên</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phòng ban</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang tạo</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Form Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Thông tin nhân viên
          </CardTitle>
          <CardDescription>
            Điền đầy đủ thông tin để tạo tài khoản nhân viên mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddEmployeeForm 
            onSave={handleSaveEmployee} 
            onClose={handleClose}
          />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Hướng dẫn tạo tài khoản nhân viên
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Thông tin bắt buộc
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Họ và tên đầy đủ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Mã nhân viên (duy nhất)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Email hợp lệ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Tên đăng nhập (3-20 ký tự)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Mật khẩu (tối thiểu 6 ký tự)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Chức vụ và phòng ban</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Ngày bắt đầu làm việc</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Thông tin tùy chọn
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Số điện thoại liên hệ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Địa chỉ nơi ở</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Lưu ý quan trọng
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Email và tên đăng nhập phải duy nhất</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Mã nhân viên không được trùng lặp</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Nhân viên có thể đăng nhập ngay sau khi tạo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Vai trò Admin có quyền quản lý toàn bộ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Vai trò Employee chỉ xem KPI được phân quyền</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Thông tin đăng nhập */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Thông tin đăng nhập cho nhân viên
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• <strong>Email:</strong> Sử dụng email đã nhập để đăng nhập</p>
              <p>• <strong>Tên đăng nhập:</strong> Có thể sử dụng tên đăng nhập thay cho email</p>
              <p>• <strong>Mật khẩu:</strong> Nhân viên có thể đổi mật khẩu sau khi đăng nhập lần đầu</p>
              <p>• <strong>Trang đăng nhập:</strong> Truy cập <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/login</code> để đăng nhập</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
