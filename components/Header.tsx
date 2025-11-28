import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 py-4 mb-6">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">✨</span>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Gemini GenAI Studio
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;