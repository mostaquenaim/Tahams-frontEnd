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
  panelStyle,
  headingTitle,
  selectedElement,
  deleteElement,
  setSelectedElement
}) => {
  const sectionTitle =
    'text-md font-medium mb-3 text-gray-700 flex items-center gap-2';
  const buttonStyle =
    'w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200';

  return (
    <div className="lg:col-span-3">
      <div className={panelStyle}>
        <h2 className={headingTitle}>
          <Sliders size={18} />
          Design Tools
        </h2>

        {/* Color Selection */}
        <div className="mb-6">
          <h3 className={sectionTitle}>
            <Droplet size={16} />
            T-Shirt Color
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {tshirtColors.map((colorOption) => (
              <button
                key={colorOption.color}
                onClick={() => setSelectedColor(colorOption)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  selectedColor.color === colorOption.color
                    ? 'border-blue-600 shadow-md scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: colorOption.color }}
                title={colorOption.name}
              />
            ))}
          </div>
        </div>

        {/* Add Text */}
        <div className="mb-6">
          <h3 className={sectionTitle}>
            <Type size={16} />
            Add Text
          </h3>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Size
              </label>
              <input
                type="number"
                value={textStyle.fontSize}
                onChange={(e) =>
                  setTextStyle({
                    ...textStyle,
                    fontSize: parseInt(e.target.value),
                  })
                }
                min="10"
                max="72"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Color
              </label>
              <input
                type="color"
                value={textStyle.color}
                onChange={(e) =>
                  setTextStyle({ ...textStyle, color: e.target.value })
                }
                className="w-full p-1 border border-gray-300 rounded-lg h-10"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Font Weight
            </label>
            <select
              value={textStyle.fontWeight}
              onChange={(e) =>
                setTextStyle({ ...textStyle, fontWeight: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
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
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Plus size={16} />
            Add Text Element
          </button>
        </div>

        {/* Add Image */}
        <div className="mb-6">
          <h3 className={sectionTitle}>
            {/* <Image size={16} /> */}
            Add Image
          </h3>
          <input
            type="file"
            ref={fileInputRef}
            onChange={addImage}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`${buttonStyle} bg-green-600 text-white hover:bg-green-700`}
          >
            <Upload size={16} />
            Upload Image
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Supports JPG, PNG, SVG (Max 5MB)
          </p>
        </div>

        {/* Element List */}
        {elements.length > 0 && (
          <div className="mb-6">
            <h3 className={sectionTitle}>
              <Layers size={16} />
              Design Elements
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedElement === element.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {element.type === 'text'
                          ? `Text: ${element.content.substring(0, 15)}${
                              element.content.length > 15 ? '...' : ''
                            }`
                          : 'Image'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
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
