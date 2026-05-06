'use client';

import React, { useRef, useState } from 'react';

type Position = {
  x: number;
  y: number;
};

export default function DragBox() {
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

  const offsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    console.log('pointer down');

    const rect = e.currentTarget.getBoundingClientRect();

    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    console.log('pointer move');
    setPosition({
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="relative h-screen w-full">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute h-24 w-24 cursor-grab select-none bg-blue-500 text-white flex items-center justify-center"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        Drag me
      </div>
    </div>
  );
}
