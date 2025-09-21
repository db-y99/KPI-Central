import Image from 'next/image';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  iconClassName?: string; // Thêm prop riêng cho icon
}

export default function Logo({ className, size = 'md', showText = true, iconClassName }: LogoProps) {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7', 
    lg: 'w-32 h-32',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  };

  // Thử sử dụng hình ảnh từ URL trước, nếu không thành công thì fallback về icon
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <Image
          src="https://y99.vn/logo.png"
          alt={t.ui.logoAlt}
          width={size === 'sm' ? 20 : size === 'md' ? 28 : size === 'lg' ? 128 : size === 'xl' ? 48 : 64}
          height={size === 'sm' ? 20 : size === 'md' ? 28 : size === 'lg' ? 128 : size === 'xl' ? 48 : 64}
          className="object-contain"
          onError={(e) => {
            // Nếu không tải được hình ảnh, ẩn nó và hiển thị icon fallback
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'block';
            }
          }}
        />
        {/* Fallback icon - ẩn ban đầu */}
        <Award 
          className={cn(sizeClasses[size], 'hidden', iconClassName || 'text-primary')} 
          style={{ display: 'none' }}
        />
      </div>
      {showText && (
        <span className={cn('font-semibold', textSizeClasses[size])}>
          {t.ui.logoText}
        </span>
      )}
    </div>
  );
}