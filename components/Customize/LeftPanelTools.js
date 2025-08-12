import { Droplet, Layers, Plus, Sliders, Trash2, Type, Upload } from 'lucide-react';
import React from 'react';

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
  panelStyle = "bg-white rounded-xl shadow-sm p-6",
  headingTitle = "flex items-center gap-2 text-lg font-semibold text-gray-800 mb-6",
  selectedElement,
  deleteElement,
  setSelectedElement
}) => {

  // console.log(elements,'ekff');
  const sectionTitle = 'text-sm font-medium text-gray-700 mb-3 flex items-center gap-2';
  const buttonStyle = 'w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

  return (
    <div className="lg:col-span-3">
      <div className={panelStyle}>
        <h2 className={headingTitle}>
          <Sliders className="text-gray-500" size={18} />
          Design Tools
        </h2>

        {/* Color Selection */}
        <div className="mb-8">
          <h3 className={sectionTitle}>
            <Droplet size={16} className="text-gray-500" />
            T-Shirt Color
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {tshirtColors.map((colorOption) => (
              <button
                key={colorOption.color}
                onClick={() => setSelectedColor(colorOption)}
                className={`w-10 h-10 rounded-lg border-2 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  selectedColor.color === colorOption.color
                    ? 'border-blue-600 shadow-md scale-105 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: colorOption.color }}
                aria-label={`Select ${colorOption.name} color`}
                title={colorOption.name}
              />
            ))}
          </div>
        </div>

        {/* Add Text Section */}
        <div className="mb-8">
          <h3 className={sectionTitle}>
            <Type size={16} className="text-gray-500" />
            Add Text
          </h3>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            aria-label="Text input for design"
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                aria-label="Font size"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textStyle.color}
                  onChange={(e) =>
                    setTextStyle({ ...textStyle, color: e.target.value })
                  }
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Text color picker"
                />
                <span className="text-xs text-gray-500">
                  {textStyle.color.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Font Style
            </label>
            <select
              value={textStyle.fontWeight}
              onChange={(e) =>
                setTextStyle({ ...textStyle, fontWeight: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              aria-label="Font weight"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="600">Semibold</option>
              <option value="800">Extrabold</option>
            </select>
          </div>

          <button
            onClick={addText}
            disabled={!newText.trim()}
            className={`${buttonStyle} ${
              !newText.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Add text element"
          >
            <Plus size={16} />
            Add Text Element
          </button>
        </div>

        {/* Add Image Section */}
        <div className="mb-8">
          <h3 className={sectionTitle}>
            <Upload size={16} className="text-gray-500" />
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
            className={`${buttonStyle} bg-green-600 text-white hover:bg-green-700`}
            aria-label="Upload image"
          >
            <Upload size={16} />
            Upload Image
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Supports JPG, PNG, SVG (Max 5MB)
          </p>
        </div>

        {/* Element List Section */}
        {elements.length > 0 && (
          <div className="mb-4">
            <h3 className={sectionTitle}>
              <Layers size={16} className="text-gray-500" />
              Design Elements ({elements.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedElement === element.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                  aria-label={`Select ${element.type} element`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {element.type === 'text'
                          ? `"${element.content.substring(0, 15)}${
                              element.content.length > 15 ? '...' : ''
                            }"`
                          : `Image: ${element.id}`}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-200"
                      aria-label={`Delete ${element.type} element`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanelTools;