"use client";

import { useState, useRef, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from "@heroicons/react/24/outline";

interface ImagePreviewProps {
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

export default function ImagePreview({ imageUrl, alt, onClose }: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Center image when it loads
  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.onload = () => {
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;
          const imageWidth = image.naturalWidth;
          const imageHeight = image.naturalHeight;

          // Calculate position to center the image
          const x = (containerWidth - imageWidth) / 2;
          const y = (containerHeight - imageHeight) / 2;
          setPosition({ x, y });
        }
      };
    }
  }, [imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => {
    setScale(prev => {
      const newScale = Math.min(prev + 0.25, 3);
      handleZoomPosition(newScale);
      return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.25, 0.5);
      handleZoomPosition(newScale);
      return newScale;
    });
  };

  const handleZoomPosition = (newScale: number) => {
    if (containerRef.current && imageRef.current) {
      const container = containerRef.current;
      const image = imageRef.current;
      
      // Calculate the center point of the container
      const containerCenterX = container.clientWidth / 2;
      const containerCenterY = container.clientHeight / 2;
      
      // Calculate the new position to keep the image centered during zoom
      const imageWidth = image.naturalWidth * newScale;
      const imageHeight = image.naturalHeight * newScale;
      const x = containerCenterX - (imageWidth / 2);
      const y = containerCenterY - (imageHeight / 2);
      
      setPosition({ x, y });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    setScale(newScale);
    handleZoomPosition(newScale);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <MagnifyingGlassMinusIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <MagnifyingGlassPlusIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-[90vw] h-[90vh] overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt={alt}
          className="absolute transition-transform duration-200"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "top left",
            maxWidth: "none",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
} 