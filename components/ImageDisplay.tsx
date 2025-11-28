import React from 'react';

interface ImageDisplayProps {
  src: string;
  alt: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ src, alt }) => {
  return (
    <div className="relative group rounded-xl overflow-hidden shadow-lg border border-gray-700 bg-gray-900">
      <img src={src} alt={alt} className="w-full h-auto object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <a 
          href={src} 
          download={`generated-${Date.now()}.png`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors"
        >
          Download
        </a>
      </div>
    </div>
  );
};

export default ImageDisplay;