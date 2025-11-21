import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center z-50">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 opacity-70"></div>
        
        {/* Inner Ring */}
        <div className="absolute animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-purple-500 opacity-70 direction-reverse" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        
        {/* Logo or Icon Placeholder */}
        <div className="h-4 w-4 bg-white rounded-full animate-pulse"></div>
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-xl font-bold text-white animate-pulse">Por favor espera</h2>
        <p className="text-sm text-gray-500 mt-2">Cargando...</p>
      </div>
    </div>
  );
}
