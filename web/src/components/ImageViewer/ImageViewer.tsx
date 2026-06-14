import { useRef, useEffect, useCallback, useState } from 'react';

interface ImageViewerProps {
  imageUrl?: string;
  title?: string;
  className?: string;
}

export function ImageViewer({ imageUrl, title, className = '' }: ImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.1, Math.min(10, z * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Load image onto canvas when imageUrl changes
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <div className={`flex flex-col bg-surface rounded-lg overflow-hidden ${className}`}>
      <div className="px-3 py-2 border-b border-gray-700 flex justify-between items-center">
        <span className="text-xs text-gray-400">{title ?? 'Image Viewer'}</span>
        <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
      </div>
      <div
        className="flex-1 overflow-hidden cursor-grab"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ background: 'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 20px 20px' }}
      >
        {imageUrl ? (
          <canvas
            ref={canvasRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              imageRendering: 'pixelated',
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-sm">Run pipeline to see output</p>
          </div>
        )}
      </div>
    </div>
  );
}
