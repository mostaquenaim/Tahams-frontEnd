import { Download, Package, Repeat, Settings2, Trash2 } from 'lucide-react';
import React from 'react';

const RightPanel = ({
  panelStyle = 'bg-white rounded-xl shadow-lg border border-gray-200 p-6',
  headingTitle = 'flex items-center gap-3 text-lg font-semibold text-black mb-6',
  selectedElement,
  elements,
  viewSide,
  generatePreview,
  buttonStyle = 'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black',
  updateElement,
  deleteElement,
  handleReset,
  instructions,
  setInstructions,
  fonts,
}) => {
  const element = elements[viewSide]?.find((el) => el.id === selectedElement);
  const inputStyle =
    'w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all hover:border-gray-400';

  return (
    <div className="lg:col-span-3 space-y-6">
      {/* Element Properties Panel */}
      <div className={panelStyle}>
        <h2 className={headingTitle}>
          <Settings2 className="text-black" size={20} />
          Element Properties
        </h2>

        {element ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-800 mb-4">
                {element.type.charAt(0).toUpperCase() + element.type.slice(1)}{' '}
                Settings
              </h3>

              {element.type === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                      className={inputStyle}
                    />
                  </div>

                  {/* font size  */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Font Size
                      </label>
                      <span className="text-xs text-gray-600">
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
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                        className="w-9 h-9 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-black transition-all duration-200 hover:scale-105"
                      />
                      <span className="text-xs font-mono text-gray-600">
                        {element.style.color.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Font Family
                    </label>
                    <select
                      value={element.style.fontFamily || 'Arial'}
                      onChange={(e) =>
                        updateElement(element.id, {
                          style: {
                            ...element.style,
                            fontFamily: e.target.value,
                          },
                        })
                      }
                      className={inputStyle}
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
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Resize
                      </label>
                      <span className="text-xs text-gray-600">
                        {element.width}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      value={element.width}
                      onChange={(e) => {
                        const newWidth = parseFloat(e.target.value);
                        const aspectRatio =
                          element.originalWidth / element.originalHeight;
                        const newHeight = newWidth / aspectRatio;

                        updateElement(element.id, {
                          width: newWidth,
                          height: newHeight,
                        });
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  {/* <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Height
        </label>
        <span className="text-xs text-gray-600">
          {element.height}px
        </span>
      </div>
      <input
        type="range"
        min="50"
        max="300"
        value={element.height}
        onChange={(e) => {
          const newHeight = parseFloat(e.target.value);
          const aspectRatio = element.originalWidth / element.originalHeight;
          const newWidth = newHeight * aspectRatio;
          
          updateElement(element.id, {
            width: newWidth,
            height: newHeight
          });
        }}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
      />
    </div> */}

                  {/* <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="lockAspectRatio"
        defaultChecked
        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
      />
      <label htmlFor="lockAspectRatio" className="text-sm text-gray-700">
        Lock aspect ratio
      </label>
    </div> */}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-base font-medium text-gray-800 mb-4">
                Transform Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Rotation
                    </label>
                    <span className="text-xs text-gray-600">
                      {element.style.rotation || 0}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={element.style.rotation || 0}
                    onChange={(e) =>
                      updateElement(element.id, {
                        style: {
                          ...element.style,
                          rotation: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleReset(element.id)}
              className={`${buttonStyle} bg-gray-100  hover:bg-gray-200  transition-all duration-300 hover:-translate-y-0.5`}
            >
              <Repeat
                size={16}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <span className="relative overflow-hidden">
                <span className="block transition-transform duration-300 hover:translate-x-1">
                  Reset
                </span>
              </span>
            </button>

            <button
              onClick={() => deleteElement(element.id)}
              className={`${buttonStyle} bg-gray-100 text-red-600 hover:bg-gray-200 hover:text-red-700 transition-all duration-300 hover:-translate-y-0.5`}
            >
              <Trash2
                size={16}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <span className="relative overflow-hidden">
                <span className="block transition-transform duration-300 hover:translate-x-1">
                  Delete Element
                </span>
              </span>
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto bg-gray-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 hover:scale-105">
              <Settings2 className="text-gray-500" size={24} />
            </div>
            <p className="text-gray-600 font-medium">No element selected</p>
            <p className="text-sm text-gray-500 mt-1.5">
              Select an element to edit its properties
            </p>
          </div>
        )}
      </div>

      {/* Order Actions Panel */}
      <div className={panelStyle}>
        <h2 className={headingTitle}>
          <Package className="text-black" size={20} />
          Order Actions
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Special Instructions
          </label>
          <textarea
            value={instructions || ''}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Add any special instructions..."
            className={`${inputStyle} resize-none`}
            rows={3}
          />
        </div>
        <div className="space-y-3">
          <button
            onClick={generatePreview}
            disabled={!elements[viewSide]?.length}
            className={`${buttonStyle} bg-gradient-to-r from-black via-gray-900 to-black text-white hover:from-black hover:to-black shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${
              !elements[viewSide]?.length ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Download size={16} className="" />
            <span className="relative overflow-hidden">
              <span className="block ">Preview Design</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
