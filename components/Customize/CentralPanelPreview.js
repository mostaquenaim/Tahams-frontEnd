import { FlipHorizontal, Shirt } from 'lucide-react';
import React, { useState } from 'react';

const CentralPanelPreview = ({
  panelStyle,
  headingTitle,
  canvasRef,
  selectedColor,
  handleMouseMove,
  handleMouseUp,
  elements,
  viewSide,
  selectedElement,
  handleMouseDown,
  setViewSide,
  handleTouchMove,
  handleTouchEnd,
  handleTouchStart,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDownEnhanced = (e, element) => {
    setIsDragging(true);
    handleMouseDown(e, element);
  };

  const handleMouseUpEnhanced = () => {
    setIsDragging(false);
    handleMouseUp();
  };

  return (
    <div className="lg:col-span-6">
      <div className={panelStyle}>
        {/* heading and switch sides  */}
        <div className="flex justify-between items-center mb-4">
          <h2 className={headingTitle}>Design Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setViewSide(viewSide === 'front' ? 'back' : 'front')
              }
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              aria-label={`Switch to ${
                viewSide === 'front' ? 'back' : 'front'
              } view`}
            >
              <FlipHorizontal size={16} />
              {viewSide === 'front' ? 'Back View' : 'Front View'}
            </button>
          </div>
        </div>

        {/* t shirt and elements  */}
        <div className="flex justify-center">
          <div
            ref={canvasRef}
            className={`relative border-2 border-gray-300 rounded-lg overflow-hidden ${
              isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
            }`}
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'calc(100vw * 1.25)', // 5:4 aspect ratio
              maxHeight: '500px',
              backgroundImage: `url(${selectedColor.previewImages[viewSide]})`,
              backgroundSize: 'cover',
              touchAction: 'none', // Prevent scrolling/zooming
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpEnhanced}
            onMouseLeave={handleMouseUpEnhanced}
          >
            {/* T-shirt outline - now more subtle since we have the actual image */}
            <div
              className="absolute inset-4 border border-dashed rounded-lg opacity-30 pointer-events-none"
              style={{
                borderColor:
                  selectedColor.color === '#FFFFFF'
                    ? '#9CA3AF'
                    : 'rgba(255,255,255,0.6)',
              }}
            />

            {/* Design Elements */}
            {elements[viewSide].map((element) => (
              <div
                key={element.id}
                className={`absolute cursor-move touch-none ${
                  selectedElement === element.id ? 'ring-2 ring-blue-400' : ''
                }`}
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  padding: '8px', // Increased touch area
                  transform: `rotate(${element.style.rotation || 0}deg)`,
                }}
                onMouseDown={(e) => handleMouseDownEnhanced(e, element)}
                onTouchStart={(e) => handleTouchStart(e, element)}
              >
                {element.type === 'text' ? (
                  <div
                    style={{
                      fontSize: element.style.fontSize,
                      color: element.style.color,
                      fontWeight: element.style.fontWeight,
                      fontFamily: element.style.fontFamily,
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                    }}
                  >
                    {element.content}
                  </div>
                ) : (
                  <img
                    src={element.content}
                    alt="Design element"
                    className="w-full h-full pointer-events-none transition"
                    draggable={false}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* front and back switch  */}
        <div className="mt-6 text-center">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewSide('front')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewSide === 'front'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shirt size={16} />
                Front View
              </div>
            </button>
            <button
              onClick={() => setViewSide('back')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewSide === 'back'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shirt size={16} className="transform scale-x-[-1]" />
                Back View
              </div>
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-2">
            <p className="flex items-center justify-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              Click and drag to move
            </p>
            <p className="flex items-center justify-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              Click to select elements
            </p>
            <p className="flex items-center justify-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              Use side panels to edit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralPanelPreview;
