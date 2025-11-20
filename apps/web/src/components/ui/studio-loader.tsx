import { cn } from '@/lib/utils';

interface AppleDotsLoaderProps {
  variant?: 'fullscreen' | 'inline' | 'minimal';
  text?: string;
  className?: string;
}

export const AppleDotsLoader = ({
  variant = 'inline',
  text = 'Đang tải',
  className,
}: AppleDotsLoaderProps) => {
  const dotClasses = `
    @keyframes apple-dot-bounce {
      0%, 80%, 100% {
        transform: translateY(0);
        opacity: 0.5;
      }
      40% {
        transform: translateY(-12px);
        opacity: 1;
      }
    }
  `;

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black to-black/95">
        <style>{dotClasses}</style>
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-2">
            <div
              className="size-3 rounded-full bg-white"
              style={{
                animation: 'apple-dot-bounce 1.4s infinite',
                animationDelay: '0s',
              }}
            />
            <div
              className="size-3 rounded-full bg-white"
              style={{
                animation: 'apple-dot-bounce 1.4s infinite',
                animationDelay: '0.2s',
              }}
            />
            <div
              className="size-3 rounded-full bg-white"
              style={{
                animation: 'apple-dot-bounce 1.4s infinite',
                animationDelay: '0.4s',
              }}
            />
          </div>
          {text && (
            <p className="text-sm font-medium text-white/70 tracking-wide">{text}</p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center gap-1.5', className)}>
        <style>{dotClasses}</style>
        <div
          className="size-2 rounded-full bg-current"
          style={{
            animation: 'apple-dot-bounce 1.4s infinite',
            animationDelay: '0s',
          }}
        />
        <div
          className="size-2 rounded-full bg-current"
          style={{
            animation: 'apple-dot-bounce 1.4s infinite',
            animationDelay: '0.2s',
          }}
        />
        <div
          className="size-2 rounded-full bg-current"
          style={{
            animation: 'apple-dot-bounce 1.4s infinite',
            animationDelay: '0.4s',
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <style>{dotClasses}</style>
      <div className="flex items-center justify-center gap-2">
        <div
          className="size-3 rounded-full bg-white/80"
          style={{
            animation: 'apple-dot-bounce 1.4s infinite',
            animationDelay: '0s',
          }}
        />
        <div
          className="size-3 rounded-full bg-white/80"
          style={{
            animation: 'apple-dot-bounce 1.4s infinite',
            animationDelay: '0.2s',
          }}
        />
        <div
          className="size-3 rounded-full bg-white/80"
          style={{
            animation: 'apple-dot-bounce 1.4s infinite',
            animationDelay: '0.4s',
          }}
        />
      </div>
      {text && (
        <p className="text-xs font-medium text-white/60 tracking-wide uppercase">{text}</p>
      )}
    </div>
  );
};

// Alias for backward compatibility
export const StudioLoader = AppleDotsLoader;

export default AppleDotsLoader;
