import { Download, HelpCircle, Package, Settings2, Trash2 } from 'lucide-react';
import React from 'react';

const RightPanel = ({
  panelStyle,
  headingTitle,
  selectedElement,
  elements,
  generatePreview,
  buttonStyle,
  updateElement,
  deleteElement,
}) => {
  //   console.log(selectedElement, 'selectedElement');

  const element = elements.find((el) => el.id === selectedElement);

  return (
    <div className="lg:col-span-3 space-y-6">
      <div className={panelStyle}>
        <h2 className={headingTitle}>
          <Settings2 size={18} />
          Element Properties
        </h2>

        {element ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Element Properties</h3>

            {element.type === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Text</label>
                  <input
                    type="text"
                    value={element.content}
                    onChange={(e) =>
                      updateElement(element.id, {
                        content: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Font Size
                  </label>
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
                    className="w-full "
                  />

                  <span className="text-sm text-gray-400">
                    {element.style.fontSize}px
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color
                  </label>
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
                    className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
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
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
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
                  <label className="block text-sm font-medium mb-2">
                    Width
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={element.width}
                    onChange={(e) =>
                      updateElement(element.id, {
                        width: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">
                    {element.width}px
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Height
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={element.height}
                    onChange={(e) =>
                      updateElement(element.id, {
                        height: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">
                    {element.height}px
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rotation
                </label>
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
                  className="w-full"
                />
                <span className="text-sm text-gray-400">
                  {element.style.rotation}°
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Scale</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={element.scale}
                  onChange={(e) =>
                    updateElement(element.id, {
                      scale: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <span className="text-sm text-gray-400">{element.scale}x</span>
              </div>
            </div>

            <button
              onClick={() => deleteElement(element.id)}
              className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg mt-4 transition-colors"
            >
              Delete Element
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            {/* <Select size={24} className="mx-auto text-gray-400 mb-3" /> */}
            <p className="text-gray-500 font-medium">No element selected</p>
            <p className="text-sm text-gray-400 mt-1">
              Select an element to edit its properties
            </p>
          </div>
        )}
      </div>

      <div className={panelStyle}>
        <h2 className={headingTitle}>
          <Package size={18} />
          Order Actions
        </h2>
        <div className="space-y-3">
          <button
            onClick={generatePreview}
            disabled={elements.length === 0}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Download size={16} />
            Preview Design
          </button>

          <div className="pt-3 border-t border-gray-200 mt-4">
            <button
              className={`${buttonStyle} bg-gray-100 text-gray-800 hover:bg-gray-200`}
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
