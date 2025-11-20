import { cn } from '@/lib/utils';

interface StudioLoaderProps {
  variant?: 'fullscreen' | 'inline' | 'minimal';
  text?: string;
  showLogo?: boolean;
  className?: string;
}

export const StudioLoader = ({
  variant = 'inline',
  text = 'Đang tải',
  showLogo = true,
  className,
}: StudioLoaderProps) => {
  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-20">
            <div className="absolute inset-0 animate-spin rounded-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-1 rounded-lg bg-black" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 animate-pulse" />
            </div>
          </div>
          {text && <p className="text-sm font-medium text-white uppercase tracking-widest">{text}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <div className="size-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="size-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
        <div className="size-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative size-16">
        <div 
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-60 blur"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        <div className="absolute inset-0 rounded-xl bg-black" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="size-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>
      {text && (
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-white/80">{text}</p>
        </div>
      )}
    </div>
  );
};

export default StudioLoader;
