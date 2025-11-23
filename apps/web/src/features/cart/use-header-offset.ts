import { useEffect, useState } from 'react';

export function useHeaderOffset(initial = 120) {
  const [offset, setOffset] = useState(initial);

  useEffect(() => {
    const update = () => {
      const header = document.getElementById('site-header');
      const h = header?.getBoundingClientRect().height ?? 0;
      setOffset((prev) => {
        const pad = h > 0 ? h + 16 : initial;
        return Math.abs(prev - pad) > 0.5 ? pad : prev;
      });
    };

    update();
    const header = document.getElementById('site-header');
    const observer =
      header && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    window.addEventListener('resize', update);
    if (observer && header) observer.observe(header);

    return () => {
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [initial]);

  return offset;
}
