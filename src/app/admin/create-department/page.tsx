'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Users, PlusCircle } from 'lucide-react';
import AddDepartmentForm from '@/components/add-department-form';
import { DataContext } from '@/context/data-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import Loading from '@/app/loading';

export default function CreateDepartmentPage() {
  const { departments, employees, loading } = useContext(DataContext);
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveDepartment = async () => {
    setIsSubmitting(true);
    try {
      toast({
        title: 'Thành công!',
        description: 'Phòng ban đã được tạo thành công.',
      });
      
      // Redirect to setup page after successful creation
      setTimeout(() => {
        router.push('/admin/setup');
      }, 1500);
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo phòng ban. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    router.push('/admin/setup');
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
            onClick={() => router.push('/admin/setup')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Tạo phòng ban mới
            </h1>
            <p className="text-muted-foreground mt-1">
              Thêm phòng ban mới vào cơ cấu tổ chức
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
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng phòng ban</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
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
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <PlusCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
            <Building2 className="h-5 w-5" />
            Thông tin phòng ban
          </CardTitle>
          <CardDescription>
            Điền đầy đủ thông tin để tạo phòng ban mới trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddDepartmentForm 
            onSave={handleSaveDepartment} 
            onClose={handleClose}
          />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Hướng dẫn tạo phòng ban</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Thông tin bắt buộc</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tên phòng ban (duy nhất trong hệ thống)</li>
                <li>• Mô tả chức năng của phòng ban</li>
                <li>• Trạng thái hoạt động (Bật/Tắt)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">Lưu ý quan trọng</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tên phòng ban không được trùng lặp</li>
                <li>• Có thể chỉnh sửa thông tin sau khi tạo</li>
                <li>• Phòng ban tạm ngưng sẽ không hiển thị trong danh sách</li>
                <li>• Cần tạo phòng ban trước khi tạo nhân viên</li>
                <li>• Có thể gán trưởng phòng sau khi tạo</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
            <h4 className="font-medium text-blue-600 mb-2">💡 Mẹo tạo phòng ban hiệu quả</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Đặt tên phòng ban rõ ràng, dễ hiểu</li>
              <li>• Mô tả chi tiết chức năng và nhiệm vụ</li>
              <li>• Cân nhắc cấu trúc tổ chức hiện tại</li>
              <li>• Có thể tạo phòng ban con sau này</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

