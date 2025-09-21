'use client';
import { useContext, useState } from 'react';
import { AuthContext } from '@/context/auth-context';
import { DataContext } from '@/context/data-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Save,
  Edit,
  Camera,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function EditProfilePage() {
  const { user, updateUser } = useContext(AuthContext);
  const { departments, updateEmployee } = useContext(DataContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    position: user?.position || '',
    departmentId: user?.departmentId || '',
    dateOfBirth: user?.dateOfBirth || '',
    avatar: user?.avatar || '',
    bio: user?.bio || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Vui lòng nhập tên của bạn.',
      });
      return;
    }

    try {
      // Update user profile
      await updateUser({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        position: profileData.position,
        departmentId: profileData.departmentId,
        dateOfBirth: profileData.dateOfBirth,
        avatar: profileData.avatar,
        bio: profileData.bio
      });

      // Update employee record
      if (user?.uid) {
        await updateEmployee(user.uid, {
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          position: profileData.position,
          departmentId: profileData.departmentId,
          dateOfBirth: profileData.dateOfBirth,
          avatar: profileData.avatar,
          bio: profileData.bio
        });
      }

      toast({
        title: 'Thành công!',
        description: 'Đã cập nhật thông tin cá nhân.',
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
      });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Vui lòng điền đầy đủ thông tin.',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Mật khẩu mới không khớp.',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Mật khẩu phải có ít nhất 6 ký tự.',
      });
      return;
    }

    try {
      // Here you would typically call a password change API
      // For now, we'll just show a success message
      toast({
        title: 'Thành công!',
        description: 'Đã thay đổi mật khẩu.',
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error as string,
        description: 'Không thể thay đổi mật khẩu. Vui lòng thử lại.',
      });
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here you would typically upload the file to a storage service
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);
      setProfileData({ ...profileData, avatar: url });
    }
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Chưa phân công';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Hồ sơ</h1>
          <p className="text-muted-foreground">
            Cập nhật thông tin cá nhân và cài đặt tài khoản
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-primary">
                    <AvatarImage
                      src={profileData.avatar}
                      alt={profileData.name}
                    />
                    <AvatarFallback className="text-3xl">
                      {profileData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">{profileData.name}</CardTitle>
                  <CardDescription className="text-base">
                    {profileData.position}
                  </CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {getDepartmentName(profileData.departmentId)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{profileData.email}</span>
                </div>
                {profileData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
                {profileData.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{profileData.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin Cá nhân
              </CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Họ và tên *</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                    placeholder={t.auth.email as string}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email không thể thay đổi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Số điện thoại"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Địa chỉ"
                />
              </div>

              <div>
                <Label htmlFor="bio">Giới thiệu bản thân</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Giới thiệu về bản thân..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Thông tin Công việc
              </CardTitle>
              <CardDescription>
                Thông tin về vị trí và phòng ban
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Vị trí</Label>
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Vị trí công việc"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Phòng ban</Label>
                  <Select
                    value={profileData.departmentId}
                    onValueChange={(value) => setProfileData({ ...profileData, departmentId: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Bảo mật
              </CardTitle>
              <CardDescription>
                Quản lý mật khẩu và cài đặt bảo mật
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isChangingPassword ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mật khẩu</p>
                    <p className="text-sm text-muted-foreground">
                      Cập nhật mật khẩu để bảo mật tài khoản
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                    Thay đổi mật khẩu
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleChangePassword}>
                      Cập nhật mật khẩu
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
