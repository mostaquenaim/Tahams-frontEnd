import {
  Edit,
  FlipHorizontal,
  Move,
  RotateCw,
  Shirt,
  ShirtIcon,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

const CentralPanelPreview = ({
  panelStyle,
  headingTitle,
  canvasRef,
  selectedColor,
  elements,
  viewSide,
  selectedElement,
  setSelectedElement,
  setViewSide,
  handleElementStart,
  handleEnd,
  handleMove,
  device,
  tshirtColors,
  setSelectedColor,
  addText,
  buttonStyle,
  newText,
  fileInputRef,
  addImage,
  //new
  updateElement,
  deleteElement,
  handleResizeStart,
  handleRotateStart,
  handleElementClick,
  handleCanvasClick,
  isResizing,
  isRotating,
  draggedElement,
  inputStyle,
  setIsDrawerOpen,
  isDrawerOpen,
  printArea,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // console.log(elements,'dcdsd');

  const handleControl = (element, e) => {
    console.log(selectedElement);
    console.log(element);
    const controlSection = document.getElementById('control');
    if (controlSection) {
      controlSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start', // Aligns the section at the top of the viewport
      });
    }
    console.log(element.id);
    setSelectedElement(element.id);
  };

  // console.log(selectedElement);

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

        {/* elements */}
        <div className="flex flex-wrap gap-5 m-3 justify-start">
          {/* select color */}
          <div className="relative">
            {/* Selected color (acts as toggle) */}
            <button
              onClick={() => setExpanded(!expanded)}
              className={`w-full md:w-12 h-12 p-3 gap-2 rounded-lg border-2 transition-all items-center justify-center text-center flex ${
                expanded
                  ? 'border-gray-400'
                  : 'border-black shadow-md scale-110 ring-2 ring-gray-300'
              }`}
              style={{ backgroundColor: selectedColor.color }}
              aria-label={`Selected ${selectedColor.name}`}
              title={selectedColor.name}
            >
              <span
                className={`md:hidden ${
                  selectedColor.color != '#000000' ? 'text-black' : 'text-white'
                }`}
              >
                Change Color
              </span>
              <ShirtIcon
                className={`${
                  selectedColor.color != '#000000' ? 'text-black' : 'text-white'
                } fill-[${selectedColor.color}]`}
              />
            </button>

            {/* Dropdown list of colors */}
            {expanded && (
              <div className="absolute mt-2 flex flex-col gap-2 z-10 bg-white rounded-lg shadow-lg border w-full max-w-[200px">
                {tshirtColors.map((colorOption) => (
                  <button
                    key={colorOption.color}
                    onClick={() => {
                      setSelectedColor(colorOption);
                      setExpanded(false); // collapse after selecting
                    }}
                    className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none ${
                      selectedColor.color === colorOption.color
                        ? 'border-black shadow-md scale-110 ring-2 ring-gray-300'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    aria-label={`Select ${colorOption.name}`}
                    title={colorOption.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* add text */}
          <button
            onClick={addText}
            disabled={!newText.trim()}
            className={`${
              !newText.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'rounded-lg text-white px-4 py-2 bg-gradient-to-r from-black via-gray-900 to-black hover:from-black hover:to-black shadow-lg'
            } w-full md:w-auto`}
            aria-label="Add text element"
          >
            <span>+ Text</span>
          </button>

          {/* add image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg px-4 py-2 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:from-black hover:to-black shadow-lg w-full md:w-auto"
            aria-label="Upload image"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={addImage}
              accept="image/*"
              className="hidden"
              aria-label="Image upload"
            />
            + Image
          </button>
        </div>

        {/* text edit */}
        <div className="h-24">
          {selectedElement &&
            elements[viewSide]
              .filter(
                (item) => item.id === selectedElement && item.type === 'text',
              )
              .map((item) => (
                <div key={item.id}>
                  <h1>Text Settings</h1>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 overflow-x-auto py-2">
                    {/* Text Color */}
                    <div className="flex-shrink-0 flex items-center gap-1 md:gap-2">
                      <label className="hidden xs:block text-sm font-medium text-gray-700 whitespace-nowrap">
                        Text Color
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={item.style.color}
                          onChange={(e) =>
                            updateElement(item.id, {
                              style: {
                                ...item.style,
                                color: e.target.value,
                              },
                            })
                          }
                          className="w-8 h-8 md:w-10 md:h-10 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-black transition-all duration-200 hover:scale-105"
                        />
                        <span className="text-xs font-mono text-gray-600 whitespace-nowrap hidden sm:block">
                          {item.style.color.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Font Family */}
                    <div className="flex-shrink-0 flex items-center gap-1 md:gap-2">
                      <label className="hidden xs:block text-sm font-medium text-gray-700 whitespace-nowrap">
                        Font Family
                      </label>
                      <select
                        value={item.style.fontFamily || 'Arial'}
                        onChange={(e) =>
                          updateElement(item.id, {
                            style: {
                              ...item.style,
                              fontFamily: e.target.value,
                            },
                          })
                        }
                        className={`w-32 text-xs md:text-lg`}
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Impact">Impact</option>
                      </select>
                    </div>

                    {/* Text Content */}
                    <div className="flex-shrink-0 flex items-center gap-1 md:gap-2 min-w-[120px] flex-1 border-black border-2 px-1 rounded-lg">
                      <label className="hidden xs:block text-sm font-medium text-gray-700 whitespace-nowrap">
                        Text Content
                      </label>
                      <input
                        type="text"
                        value={item.content}
                        onChange={(e) =>
                          updateElement(item.id, {
                            content: e.target.value,
                          })
                        }
                        className={`w-32 text-sm md:text-lg`}
                      />
                    </div>
                  </div>
                </div>
              ))}
          {selectedElement &&
            elements[viewSide]
              .filter(
                (item) => item.id === selectedElement && item.type === 'image',
              )
              .map((item) => (
                <div key={item.id}>
                  <h1>Resize</h1>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 overflow-x-auto py-2">
                    {/* resize image  */}
                    <input
                      type="range"
                      min="50"
                      max="300"
                      value={item.width}
                      onChange={(e) => {
                        const newWidth = parseFloat(e.target.value);
                        const aspectRatio =
                          item.originalWidth / item.originalHeight;
                        const newHeight = newWidth / aspectRatio;

                        updateElement(item.id, {
                          width: parseInt(newWidth),
                          height: parseInt(newHeight),
                        });
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>
                </div>
              ))}
        </div>

        {/* t shirt and elements  */}
        <div className="w-full flex justify-center">
          <div
            ref={canvasRef}
            className={`relative border-2 border-gray-300 rounded-lg overflow-hidden ${
              draggedElement || isResizing || isRotating
                ? 'cursor-grabbing'
                : 'cursor-crosshair'
            }`}
            style={{
              width: '100%',
              maxWidth: device === 'mobile' ? '200px' : '400px',
              height: 'calc(100vw * 1.25)', // 5:4 aspect ratio
              maxHeight: device === 'mobile' ? '250px' : '500px',
              backgroundImage: `url(${selectedColor.previewImages[viewSide]})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              touchAction: 'none', // Prevent scrolling/zooming
            }}
            onClick={handleCanvasClick}
            onTouchMove={(e) => handleMove(e, selectedElement)}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
            onMouseMove={(e) => handleMove(e, selectedElement)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
          >
            {/* T-shirt outline */}
            <div
              className="absolute inset-4 border border-dashed rounded-lg opacity-30 pointer-events-none"
              style={{
                borderColor:
                  selectedColor.color === '#FFFFFF'
                    ? '#9CA3AF'
                    : 'rgba(255,255,255,0.6)',
              }}
            />

            {/* Print Area Limit Box */}
            <div
              className="absolute pointer-events-none z-5"
              style={{
                left: '27%',
                top: viewSide == 'back' ? '20%' : '25%',
                width: device === 'mobile' ? `90px` : `180px`,
                height: device === 'mobile' ? `135px` : `270px`,
                border: '2px solid #ef4444',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                boxShadow: 'inset 0 0 0 1px rgba(239, 68, 68, 0.2)',
              }}
            >
              {/* Print Area Label */}
              {/* <div
                className="hidden md:absolute -top-6 left-0 text-xs font-medium text-red-500 bg-white px-2 py-1 rounded shadow-sm border border-red-200"
                style={{ fontSize: '10px' }}
              >
                Print Area
              </div> */}
            </div>

            {/* Design Elements with Clipping */}
            {elements[viewSide].map((element) => {
              // Calculate print area boundaries
              // const printArea = {
              //   left: canvasRef.current && viewSide === 'front'
              //       ? canvasRef.current.offsetWidth * 0.27
              //       : canvasRef.current && viewSide === 'back'
              //       ? canvasRef.current.offsetWidth * 0.27
              //     : 80,
              //   top:
              //     canvasRef.current && viewSide === 'front'
              //       ? canvasRef.current.offsetHeight * 0.25
              //       : canvasRef.current && viewSide === 'back'
              //       ? canvasRef.current.offsetHeight * 0.20
              //       : 125,
              //   right: canvasRef.current && viewSide === 'front'
              //       ? canvasRef.current.offsetWidth * 0.71
              //       : canvasRef.current && viewSide === 'back'
              //       ? canvasRef.current.offsetWidth * 0.71
              //     : 320,
              //   bottom: canvasRef.current && viewSide === 'front'
              //       ? canvasRef.current.offsetHeight * 0.78
              //       : canvasRef.current && viewSide === 'back'
              //       ? canvasRef.current.offsetHeight * 0.74
              //     : 375,
              // };

              // Check if element is outside print area
              // const isOutsidePrintArea =
              //   element.x + element.width < printArea.left ||
              //   element.x > printArea.right ||
              //   element.y + element.height < printArea.top ||
              //   element.y > printArea.bottom;

              // // Check if element is partially outside print area
              // const isPartiallyOutside =
              //   element.x < printArea.left ||
              //   element.y < printArea.top ||
              //   element.x + element.width > printArea.right ||
              //   element.y + element.height > printArea.bottom;

              return (
                <div key={element.id} className="relative">
                  {/* Main Element */}
                  <div
                    className={`absolute cursor-move touch-none select-none transition-opacity ${
                      element.opacity
                    } ${selectedElement === element.id ? 'z-10' : 'z-0'} ${
                      element.opacity === 'isOutsidePrintArea '
                        ? 'opacity-30'
                        : element.opacity === 'isPartiallyOutside'
                        ? 'opacity-60'
                        : 'opacity-100'
                    }`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      transform: `rotate(${element.style?.rotation || 0}deg)`,
                      transformOrigin: 'center center',
                      // Add visual indicator for elements outside print area
                      filter:
                        element.opacity === 'isOutsidePrintArea '
                          ? 'grayscale(50%)'
                          : 'none',
                    }}
                    onClick={(e) => handleElementClick(element, e)}
                    onMouseDown={(e) => handleElementStart(e, element)}
                    onTouchStart={(e) => handleElementStart(e, element)}
                  >
                    {/* Print area clipping mask */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        clipPath:
                          element.opacity === 'isPartiallyOutside'
                            ? `polygon(
                  ${Math.max(
                    0,
                    ((printArea.left - element.x) / element.width) * 100,
                  )}% ${Math.max(
                                0,
                                ((printArea.top - element.y) / element.height) *
                                  100,
                              )}%,
                  ${Math.min(
                    100,
                    ((printArea.right - element.x) / element.width) * 100,
                  )}% ${Math.max(
                                0,
                                ((printArea.top - element.y) / element.height) *
                                  100,
                              )}%,
                  ${Math.min(
                    100,
                    ((printArea.right - element.x) / element.width) * 100,
                  )}% ${Math.min(
                                100,
                                ((printArea.bottom - element.y) /
                                  element.height) *
                                  100,
                              )}%,
                  ${Math.max(
                    0,
                    ((printArea.left - element.x) / element.width) * 100,
                  )}% ${Math.min(
                                100,
                                ((printArea.bottom - element.y) /
                                  element.height) *
                                  100,
                              )}%
                )`
                            : 'none',
                      }}
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
                            lineHeight: '1',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {element.content}
                        </div>
                      ) : (
                        <img
                          src={element.content}
                          alt="Design element"
                          className="w-full h-full pointer-events-none transition object-cover"
                          draggable={false}
                        />
                      )}
                    </div>

                    {/* Out of bounds indicator */}
                    {/* {(isOutsidePrintArea || isPartiallyOutside) && (
                      <div className="absolute -top-6 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg z-30">
                        {isOutsidePrintArea
                          ? 'Outside Print Area'
                          : 'Partially Outside'}
                      </div>
                    )} */}
                  </div>

                  {/* Control Handles for Selected Element */}
                  {selectedElement === element.id && (
                    <div
                      className="absolute pointer-events-none z-20"
                      style={{
                        left: element.x - 4,
                        top: element.y - 4,
                        width: element.width + 8,
                        height: element.height + 8,
                        transform: `rotate(${element.style?.rotation || 0}deg)`,
                        transformOrigin: `${(element.width + 8) / 2}px ${
                          (element.height + 8) / 2
                        }px`,
                      }}
                    >
                      {/* Selection Border - Red if outside print area */}
                      <div
                        className={`absolute inset-0 border-2 border-dashed rounded opacity-80 ${
                          element.opacity === 'isOutsidePrintArea ' ||
                          element.opacity === 'isPartiallyOutside'
                            ? 'border-red-500'
                            : 'border-blue-400'
                        }`}
                      ></div>

                      {/* Corner Handles */}
                      <div
                        className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-sm"
                        onMouseDown={(e) => handleResizeStart(e, element)}
                        onTouchStart={(e) => handleResizeStart(e, element)}
                      ></div>
                      <div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-sm"
                        onMouseDown={(e) => handleResizeStart(e, element)}
                        onTouchStart={(e) => handleResizeStart(e, element)}
                      ></div>
                      <div
                        className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-sm cursor-se-resize pointer-events-auto hover:bg-blue-600 transition-colors hover:scale-110"
                        onMouseDown={(e) => handleResizeStart(e, element)}
                        onTouchStart={(e) => handleResizeStart(e, element)}
                      ></div>

                      {/* Resize Handle */}
                      <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md cursor-se-resize pointer-events-auto hover:bg-green-600 transition-colors hover:scale-110"
                        onMouseDown={(e) => handleResizeStart(e, element)}
                        onTouchStart={(e) => handleResizeStart(e, element)}
                        title="Resize"
                      ></div>

                      {/* Rotation Handle */}
                      <div
                        className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-md cursor-grab pointer-events-auto hover:bg-purple-600 transition-colors hover:scale-110 flex items-center justify-center"
                        onMouseDown={(e) => handleRotateStart(e, element)}
                        onTouchStart={(e) => handleRotateStart(e, element)}
                        title="Rotate"
                      >
                        <RotateCw size={12} className="text-white" />
                      </div>

                      {/* Delete Handle */}
                      <div
                        className="absolute -top-7 -right-7 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-md cursor-pointer pointer-events-auto hover:bg-red-600 transition-colors hover:scale-110 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        title="Delete"
                      >
                        <X size={12} className="text-white" />
                      </div>

                      {/* Move Handle */}
                      {/* <div
                        className="absolute top-1/2 -left-7 transform -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-move pointer-events-auto hover:bg-blue-600 transition-colors hover:scale-110 flex items-center justify-center"
                        title="Move"
                      >
                        <Edit size={12} className="text-white" />
                      </div> */}

                      {/* Snap to Print Area Button - only show if outside */}
                      {/* {(element.opacity === 'isOutsidePrintArea ' ||
                        element.opacity === 'isPartiallyOutside') && (
                        <div
                          className="absolute top-1/2 -right-12 transform -translate-y-1/2 w-8 h-6 bg-orange-500 rounded border-2 border-white shadow-md cursor-pointer pointer-events-auto hover:bg-orange-600 transition-colors text-xs text-white flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Snap element to fit within print area
                            const newX = Math.max(
                              printArea.left,
                              Math.min(
                                element.x,
                                printArea.right - element.width,
                              ),
                            );
                            const newY = Math.max(
                              printArea.top,
                              Math.min(
                                element.y,
                                printArea.bottom - element.height,
                              ),
                            );

                            // Update element position (you'll need to implement this function)
                            // updateElementPosition(element.id, newX, newY);
                          }}
                          title="Snap to Print Area"
                        >
                          ↩
                        </div>
                      )} */}
                    </div>
                  )}
                </div>
              );
            })}
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
