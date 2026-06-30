'use client';

import React from 'react';

interface SwanLogoProps {
  className?: string;
  width?: string | number;
}

export default function SwanLogo({ className = 'h-10 w-10', width }: SwanLogoProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-xl flex items-center justify-center shrink-0 ${className}`} 
      style={{ 
        aspectRatio: '1 / 1', 
        width: width || 'auto',
      }}
    >
      <img 
        src="/swan_square_logo.png" 
        alt="SWAN Logo" 
        className="w-full h-full object-cover rounded-xl"
      />
    </div>
  );
}
