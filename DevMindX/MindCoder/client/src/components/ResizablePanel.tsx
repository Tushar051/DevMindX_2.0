import { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  direction: 'horizontal' | 'vertical';
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  storageKey?: string;
  className?: string;
}

export function ResizablePanel({
  children,
  direction,
  initialSize = 300,
  minSize = 100,
  maxSize = 800,
  storageKey,
  className = ''
}: ResizablePanelProps) {
  const [size, setSize] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseInt(saved) : initialSize;
    }
    return initialSize;
  });

  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, size.toString());
    }
  }, [size, storageKey]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const container = panelRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      let newSize: number;
      if (direction === 'horizontal') {
        // For right sidebar
        newSize = containerRect.right - e.clientX;
      } else {
        // For bottom panel
        newSize = containerRect.bottom - e.clientY;
      }

      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, direction, minSize, maxSize]);

  const style = direction === 'horizontal'
    ? { width: `${size}px`, minWidth: `${size}px`, maxWidth: `${size}px` }
    : { height: `${size}px`, minHeight: `${size}px`, maxHeight: `${size}px` };

  return (
    <div
      ref={panelRef}
      className={`relative ${className}`}
      style={style}
    >
      {/* Resize Handle */}
      <div
        className={`absolute ${
          direction === 'horizontal'
            ? 'left-0 top-0 bottom-0 w-1 hover:w-2 cursor-ew-resize hover:bg-blue-500/50'
            : 'top-0 left-0 right-0 h-1 hover:h-2 cursor-ns-resize hover:bg-blue-500/50'
        } bg-gray-700 transition-all z-10`}
        onMouseDown={startResize}
        onDoubleClick={() => setSize(initialSize)}
        title={direction === 'horizontal' ? 'Drag to resize width' : 'Drag to resize height'}
      />
      
      {/* Content */}
      <div className="w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
