import React from 'react';

const CentralPanelPreview = ({
  panelStyle,
  headingTitle,
  canvasRef,
  selectedColor,
  handleMouseMove,
  handleMouseUp,
  elements,
  selectedElement,
  handleMouseDown,
}) => {
  return (
    <div className="lg:col-span-6">
      <div className={panelStyle}>
        <h2 className={`${headingTitle} text-center`}>Design Preview</h2>

        <div className="flex justify-center">
          <div
            ref={canvasRef}
            className="relative border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair"
            style={{
              width: '400px',
              height: '500px',
              backgroundImage: `url(${selectedColor.previewImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: selectedColor.color,
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* T-shirt outline - now more subtle since we have the actual image */}
            <div
              className="absolute inset-4 border border-dashed rounded-lg opacity-30"
              style={{
                borderColor:
                  selectedColor.color === '#FFFFFF'
                    ? '#9CA3AF'
                    : 'rgba(255,255,255,0.6)',
              }}
            />

            {/* Design Elements */}
            {elements.map((element) => (
              <div
                key={element.id}
                className={`absolute cursor-move ${
                  selectedElement === element.id ? 'ring-2 ring-blue-400' : ''
                }`}
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                }}
                onMouseDown={(e) => handleMouseDown(e, element)}
              >
                {element.type === 'text' ? (
                  <div
                    style={{
                      fontSize: element.style.fontSize,
                      color: element.style.color,
                      fontWeight: element.style.fontWeight,
                      fontFamily: element.style.fontFamily,
                      transform: `rotate(${element.style.rotation || 0}deg)`, // Add rotation here
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
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>• Click and drag elements to move them</p>
          <p>• Click on elements to select them</p>
          <p>• Use the tools on the left to add text and images</p>
        </div>
      </div>
    </div>
  );
};

export default CentralPanelPreview;
