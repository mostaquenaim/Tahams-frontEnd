import {
  Droplet,
  Layers,
  Plus,
  Sliders,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import React, { useState } from 'react';

const LeftPanelTools = ({
  tshirtColors,
  setSelectedColor,
  selectedColor,
  newText,
  setNewText,
  textStyle,
  setTextStyle,
  addText,
  fileInputRef,
  addImage,
  elements,
  viewSide,
  panelStyle = 'bg-white rounded-xl shadow-lg border border-gray-200 p-6',
  headingTitle = 'flex items-center gap-3 text-lg font-semibold text-black mb-6',
  selectedElement,
  deleteElement,
  setSelectedElement,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
}) => {
  const sectionTitle =
    'text-sm font-medium text-gray-800 mb-3 flex items-center gap-2';
  const buttonStyle =
    'w-full px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  const inputStyle =
    'w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-400';

  return (
    <div className="lg:col-span-3 h-full">
      <div className={panelStyle + ' h-full flex flex-col'}>
        <h2 className={headingTitle}>
          <Sliders className="text-black" size={20} />
          Design Tools
        </h2>

        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">
          {/* Color Selection */}
          <section className="mb-6">
            <h3 className={sectionTitle}>
              <Droplet size={18} className="text-black" />
              T-Shirt Color
            </h3>
            <div className="grid grid-cols-5 gap-2.5">
              {tshirtColors.map((colorOption) => (
                <button
                  key={colorOption.color}
                  onClick={() => setSelectedColor(colorOption)}
                  className={`w-9 h-9 rounded-lg border-2 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                    selectedColor.color === colorOption.color
                      ? 'border-black shadow-md scale-110 ring-2 ring-gray-300'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: colorOption.color }}
                  aria-label={`Select ${colorOption.name} color`}
                  title={colorOption.name}
                />
              ))}
            </div>
          </section>

          {/* Size Selection */}
          <section className="mb-6">
            <h3 className={sectionTitle}>
              <Layers size={18} className="text-black" />
              Size
            </h3>
            <div className="grid grid-cols-5 gap-2.5">
              {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all 
          ${
            selectedSize === size
              ? 'border-black bg-gray-900 text-white shadow-md'
              : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
          }`}
                  aria-label={`Select ${size} size`}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>

          {/* Quantity Selection */}
          <section className="mb-6">
            <h3 className={sectionTitle}>
              <Layers size={18} className="text-black" />
              Quantity
            </h3>
            <input
              type="number"
              min="1"
              max="20"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className={`${inputStyle} w-24`}
              aria-label="Select quantity"
            />
          </section>

          <h1 className="font-bold text-3xl">Designs</h1>
          {/* Add Text Section */}
          <section className="mb-6">
            {/* <h3 className={sectionTitle}>
              <Type size={18} className="text-black" />
              Add Text
            </h3>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Enter your text here..."
              className={`${inputStyle} mb-3`}
              aria-label="Text input for design"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Font Size
                </label>
                <input
                  type="number"
                  value={textStyle.fontSize}
                  onChange={(e) =>
                    setTextStyle({
                      ...textStyle,
                      fontSize: parseInt(e.target.value) || 16,
                    })
                  }
                  min="10"
                  max="72"
                  className={inputStyle}
                  aria-label="Font size"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textStyle.color}
                    onChange={(e) =>
                      setTextStyle({ ...textStyle, color: e.target.value })
                    }
                    className="w-9 h-9 border border-gray-200 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500"
                    aria-label="Text color picker"
                  />
                  <span className="text-xs font-mono text-gray-600">
                    {textStyle.color.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Font Style
              </label>
              <select
                value={textStyle.fontWeight}
                onChange={(e) =>
                  setTextStyle({ ...textStyle, fontWeight: e.target.value })
                }
                className={inputStyle}
                aria-label="Font weight"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="600">Semibold</option>
                <option value="800">Extrabold</option>
              </select>
            </div> */}

            <button
              onClick={addText}
              disabled={!newText.trim()}
              className={`${buttonStyle} ${
                !newText.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-black via-gray-900 to-black text-white hover:from-black hover:to-black shadow-lg'
              }`}
              aria-label="Add text element"
            >
              <Plus size={16} />
              Add Text Element
            </button>
          </section>

          {/* Add Image Section */}
          <section className="mb-6">
            <h3 className={sectionTitle}>
              <Upload size={18} className="text-black" />
              Add Image
            </h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={addImage}
              accept="image/*"
              className="hidden"
              aria-label="Image upload"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`${buttonStyle} bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:from-black hover:to-black shadow-lg`}
              aria-label="Upload image"
            >
              <Upload size={16} />
              Upload Image
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Supports JPG, PNG, SVG (Max 5MB)
            </p>
          </section>

          {/* Element List Section */}
          {elements.length > 0 && (
            <section className="mb-2">
              <h3 className={sectionTitle}>
                <Layers size={18} className="text-black" />
                Design Elements ({elements.length})
              </h3>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors group ${
                      selectedElement === element.id
                        ? 'border-black bg-gray-100 ring-1 ring-gray-200'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                    aria-label={`Select ${element.type} element`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`text-sm font-medium ${
                            element.type === 'text'
                              ? 'text-gray-800'
                              : 'text-gray-700'
                          } truncate`}
                        >
                          {element.type === 'text'
                            ? `"${element.content.substring(0, 15)}${
                                element.content.length > 15 ? '...' : ''
                              }"`
                            : `Image: ${element.id.slice(0, 4)}...`}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-200"
                        aria-label={`Delete ${element.type} element`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftPanelTools;
