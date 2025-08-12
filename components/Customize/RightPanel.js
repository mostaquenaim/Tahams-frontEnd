import { Download, HelpCircle, Package, Settings2, Trash2 } from 'lucide-react';
import React from 'react';

const RightPanel = ({
  panelStyle = "bg-white rounded-xl shadow-sm p-6",
  headingTitle = "flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4",
  selectedElement,
  elements,
  viewSide,
  generatePreview,
  buttonStyle = "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors",
  updateElement,
  deleteElement,
}) => {
  const element = elements[viewSide].find((el) => el.id === selectedElement);

  return (
    <div className="lg:col-span-3 space-y-6">
      {/* Element Properties Panel */}
      <div className={panelStyle}>
        <h2 className={headingTitle}>
          <Settings2 className="text-gray-500" size={18} />
          Element Properties
        </h2>

        {element ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-700 mb-4">
                {element.type.charAt(0).toUpperCase() + element.type.slice(1)} Settings
              </h3>

              {element.type === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Content
                    </label>
                    <input
                      type="text"
                      value={element.content}
                      onChange={(e) =>
                        updateElement(element.id, {
                          content: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Font Size
                      </label>
                      <span className="text-xs text-gray-500">
                        {element.style.fontSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={element.style.fontSize}
                      onChange={(e) =>
                        updateElement(element.id, {
                          style: {
                            ...element.style,
                            fontSize: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={element.style.color}
                        onChange={(e) =>
                          updateElement(element.id, {
                            style: {
                              ...element.style,
                              color: e.target.value,
                            },
                          })
                        }
                        className="w-10 h-10 bg-gray-50 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <span className="text-sm text-gray-500">
                        {element.style.color}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <select
                      value={element.style.fontFamily}
                      onChange={(e) =>
                        updateElement(element.id, {
                          style: {
                            ...element.style,
                            fontFamily: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Impact">Impact</option>
                    </select>
                  </div>
                </div>
              )}

              {element.type === 'image' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Width
                      </label>
                      <span className="text-xs text-gray-500">
                        {element.width}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      value={element.width}
                      onChange={(e) =>
                        updateElement(element.id, {
                          width: parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Height
                      </label>
                      <span className="text-xs text-gray-500">
                        {element.height}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      value={element.height}
                      onChange={(e) =>
                        updateElement(element.id, {
                          height: parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-base font-medium text-gray-700 mb-4">
                Transform Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Rotation
                    </label>
                    <span className="text-xs text-gray-500">
                      {element.style.rotation}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={element.style.rotation}
                    onChange={(e) =>
                      updateElement(element.id, {
                        style: {
                          ...element.style,
                          rotation: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Scale
                    </label>
                    <span className="text-xs text-gray-500">
                      {element.style.scale}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={element.style.scale}
                    onChange={(e) =>
                      updateElement(element.id, {
                        style: {
                          ...element.style,
                          scale: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div> */}
              </div>
            </div>

            <button
              onClick={() => deleteElement(element.id)}
              className={`${buttonStyle} bg-red-50 text-red-700 hover:bg-red-100`}
            >
              <Trash2 size={16} />
              Delete Element
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <Settings2 className="text-gray-400" size={20} />
            </div>
            <p className="text-gray-500 font-medium">No element selected</p>
            <p className="text-sm text-gray-400 mt-1">
              Select an element to edit its properties
            </p>
          </div>
        )}
      </div>

      {/* Order Actions Panel */}
      <div className={panelStyle}>
        <h2 className={headingTitle}>
          <Package className="text-gray-500" size={18} />
          Order Actions
        </h2>
        <div className="space-y-4">
          <button
            onClick={generatePreview}
            disabled={elements[viewSide].length === 0}
            className={`${buttonStyle} bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed`}
          >
            <Download size={16} />
            Preview Design
          </button>

          <div className="pt-4 border-t border-gray-200">
            <button
              className={`${buttonStyle} bg-gray-50 text-gray-700 hover:bg-gray-100`}
            >
              <HelpCircle size={16} />
              Design Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;