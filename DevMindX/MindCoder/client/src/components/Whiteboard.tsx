import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PenToolIcon, EraserIcon, TrashIcon, DownloadIcon, XIcon } from 'lucide-react';

interface WhiteboardProps {
  sessionId: string | null;
  socket: any;
  onClose: () => void;
  onDrawingChange?: (data: string) => void;
}

export function Whiteboard({ sessionId, socket, onClose, onDrawingChange }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#8B5CF6');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const lastUpdateRef = useRef<number>(0);
  const [remoteDrawing, setRemoteDrawing] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Listen for remote whiteboard updates
  useEffect(() => {
    if (!socket || !sessionId) return;

    const handleWhiteboardUpdate = (data: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Show who's drawing
      setRemoteDrawing(data.username);
      setTimeout(() => setRemoteDrawing(null), 2000);

      // Load the image data from other user
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = data.data;
    };

    socket.on('whiteboard-update', handleWhiteboardUpdate);

    return () => {
      socket.off('whiteboard-update', handleWhiteboardUpdate);
    };
  }, [socket, sessionId]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#1e1e1e' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();

    // Throttle updates to collaborators (every 100ms)
    const now = Date.now();
    if (onDrawingChange && sessionId && now - lastUpdateRef.current > 100) {
      const imageData = canvas.toDataURL();
      onDrawingChange(imageData);
      lastUpdateRef.current = now;
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Notify collaborators about clear
    if (onDrawingChange && sessionId) {
      const imageData = canvas.toDataURL();
      onDrawingChange(imageData);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#000000', '#FFFFFF'];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] rounded-lg w-full max-w-6xl h-[80vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenToolIcon className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">Collaborative Whiteboard</span>
            {sessionId && (
              <span className="text-xs text-gray-400 ml-2">• Synced with session</span>
            )}
            {remoteDrawing && (
              <span className="text-xs text-green-400 ml-2 animate-pulse">
                ✏️ {remoteDrawing} is drawing...
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-gray-700 flex items-center gap-4">
          {/* Tools */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tool === 'pen' ? 'default' : 'outline'}
              onClick={() => setTool('pen')}
              className={tool === 'pen' ? 'bg-purple-600' : 'border-gray-600'}
            >
              <PenToolIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === 'eraser' ? 'default' : 'outline'}
              onClick={() => setTool('eraser')}
              className={tool === 'eraser' ? 'bg-purple-600' : 'border-gray-600'}
            >
              <EraserIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Colors */}
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${
                  color === c ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Line Width */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-400 w-8">{lineWidth}px</span>
          </div>

          {/* Actions */}
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={clearCanvas} className="border-gray-600">
              <TrashIcon className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button size="sm" variant="outline" onClick={downloadCanvas} className="border-gray-600">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4 overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full bg-[#1e1e1e] border border-gray-700 rounded cursor-crosshair"
          />
        </div>
      </div>
    </div>
  );
}
