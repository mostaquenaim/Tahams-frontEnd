import { FolderPlus, Save } from 'lucide-react';
import React from 'react';

const TopElements = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          T-Shirt Design Studio
        </h1>
        <p className="text-gray-500 mt-1">
          Create custom apparel designs for your business
        </p>
      </div>
      <div className="flex gap-3 mt-4 md:mt-0">
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Save size={16} />
          Save Draft
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <FolderPlus size={16} />
          New Design
        </button>
      </div>
    </div>
  );
};

export default TopElements;
