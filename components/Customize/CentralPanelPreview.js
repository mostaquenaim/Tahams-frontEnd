"use client";
import {
  Edit,
  FlipHorizontal,
  Move,
  RotateCw,
  Shirt,
  ShirtIcon,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { IoIosResize } from "react-icons/io";

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
  isElementOutOfBounds,
  printHeight,
  printWidth,
  //refs
  inputRefs,
  setIsDoubleClicked,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fillColor, setFillColor] = useState("fill-[#000000]");
  // console.log(selectedColor.color, 'dcdsd');

  const [textFieldBlink, setTextFieldBlink] = useState(false);
  // const [isEditing, setIsEditing] = useState({
  //   id: 0,
  // });
  const [rotationSnapLines, setRotationSnapLines] = useState([]);

  useEffect(() => {
    setFillColor(`fill-[${selectedColor.color}]`);
  }, [selectedColor]);

  // Function to check if rotation is near snap angles and show lines
  const updateRotationSnapLines = (
    rotation,
    elementX,
    elementY,
    elementWidth,
    elementHeight
  ) => {
    const snapAngles = [0, 90, 180, -90, -180];
    const snapTolerance = 5; // degrees
    const lines = [];

    snapAngles.forEach((angle) => {
      const normalizedRotation = ((rotation % 360) + 360) % 360;
      const distance = Math.min(
        Math.abs(normalizedRotation - angle),
        Math.abs(normalizedRotation - (angle + 360)),
        Math.abs(normalizedRotation - (angle - 360))
      );

      if (distance <= snapTolerance) {
        const centerX = elementX + elementWidth / 2;
        const centerY = elementY + elementHeight / 2;

        // Create snap lines based on the angle
        if (angle === 0 || angle === 180 || angle === -180) {
          // Horizontal line
          lines.push({
            type: "horizontal",
            y: centerY,
            angle: angle,
          });
        }
        if (angle === 90 || angle === -90) {
          // Vertical line
          lines.push({
            type: "vertical",
            x: centerX,
            angle: angle,
          });
        }
      }
    });

    setRotationSnapLines(lines);
  };

  // Enhanced handleMove to update snap lines during rotation
  const enhancedHandleMove = (e, elementId) => {
    if (isRotating && selectedElement) {
      const selectedEl = elements[viewSide].find(
        (el) => el.id === selectedElement
      );
      if (selectedEl) {
        updateRotationSnapLines(
          selectedEl.style?.rotation || 0,
          selectedEl.x,
          selectedEl.y,
          selectedEl.width,
          selectedEl.height
        );
      }
    }
    handleMove(e, elementId);
  };

  const [showRotateInfo, setShowRotateInfo] = useState(false);

  const handleRotateInfo = () => {
    setShowRotateInfo(true);
    setTimeout(() => {
      setShowRotateInfo(false);
    }, 2000);
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
                setViewSide(viewSide === "front" ? "back" : "front")
              }
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              aria-label={`Switch to ${
                viewSide === "front" ? "back" : "front"
              } view`}
            >
              <FlipHorizontal size={16} />
              {viewSide === "front" ? "Back View" : "Front View"}
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
              className={`w-full  h-12 p-3 gap-2 rounded-lg border-2 transition-all items-center justify-center text-center flex ${
                expanded
                  ? "border-gray-400"
                  : "border-black shadow-md scale-110 ring-2 ring-gray-300"
              }`}
              // style={{ backgroundColor: selectedColor.color }}
              aria-label={`Selected ${selectedColor.name}`}
              title={selectedColor.name}
            >
              <span className={`text-black`}>Color</span>
              <ShirtIcon
                className={`${
                  selectedColor.color != "#000000" ? "text-black" : "text-white"
                }`}
                style={{ fill: selectedColor.color.toLowerCase() }}
              />
              {/* <div
                className="h-5 w-5 rounded-full"
                style={{ backgroundColor: selectedColor.color.toLowerCase() }}
              ></div> */}
            </button>

            {/* Dropdown list of colors */}
            {expanded && (
              <div className="absolute mt-2 flex flex-col gap-2 z-10 bg-white rounded-lg shadow-lg border ">
                {tshirtColors.map((colorOption) => (
                  <button
                    key={colorOption.color}
                    onClick={() => {
                      setSelectedColor(colorOption);
                      setExpanded(false); // collapse after selecting
                    }}
                    className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none ${
                      selectedColor.color === colorOption.color
                        ? "border-black shadow-md scale-110 ring-2 ring-gray-300"
                        : "border-gray-300 hover:border-gray-400"
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
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "rounded-lg text-white px-4 py-2 bg-gradient-to-r from-black via-gray-900 to-black hover:from-black hover:to-black shadow-lg"
            } w-full md:w-auto`}
            aria-label="Add text element"
          >
            <span>+ Add Text</span>
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
            + Add Image
          </button>
        </div>

        {/* edit elements  */}
        <div className="h-40 md:h-24">
          {/* text edit */}
          {!selectedElement && (
            <div className="text-gray-600">
              Element properties go here. You can adjust settings, styles, and
              behaviors.
            </div>
          )}{" "}
          {selectedElement &&
            elements[viewSide]
              .filter(
                (item) => item.id === selectedElement && item.type === "text"
              )
              .map((item) => (
                <div key={item.id}>
                  <h1>Text Settings</h1>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-5 overflow-x-auto py-3 px-1">
                    {/* Text Color */}
                    <div className="flex-shrink-0 flex items-center gap-2 md:gap-3 bg-gray-50 rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                      <label className="text-xs font-medium text-gray-600 whitespace-nowrap hidden xs:block">
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative group">
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
                            className="w-8 h-8 md:w-9 md:h-9 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-md"
                            title="Select text color"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            <svg
                              className="w-4 h-4 text-white mix-blend-difference"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM15 5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4h-4"
                              />
                            </svg>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-gray-600 whitespace-nowrap hidden sm:block bg-gray-100 px-2 py-1 rounded-md">
                          {item.style.color.toUpperCase()}
                        </span>
                      </div>
                      {/* </div> */}

                      {/* Font Family */}
                      {/* <div className="flex-shrink-0 flex items-center gap-2 md:gap-3 bg-gray-50 rounded-lg px-3 py-2 shadow-sm border border-gray-200"> */}
                      <label className="text-xs font-medium text-gray-600 whitespace-nowrap hidden xs:block">
                        Font
                      </label>
                      <div className="relative">
                        <select
                          value={item.style.fontFamily || "Arial"}
                          onChange={(e) =>
                            updateElement(item.id, {
                              style: {
                                ...item.style,
                                fontFamily: e.target.value,
                              },
                            })
                          }
                          className="w-32 text-sm bg-white border border-gray-300 rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          style={{
                            fontFamily: item.style.fontFamily || "Arial",
                          }}
                        >
                          <option value="Arial" style={{ fontFamily: "Arial" }}>
                            Arial
                          </option>
                          <option
                            value="Helvetica"
                            style={{ fontFamily: "Helvetica" }}
                          >
                            Helvetica
                          </option>
                          <option
                            value="Times New Roman"
                            style={{ fontFamily: "Times New Roman" }}
                          >
                            Times New Roman
                          </option>
                          <option
                            value="Georgia"
                            style={{ fontFamily: "Georgia" }}
                          >
                            Georgia
                          </option>
                          <option
                            value="Verdana"
                            style={{ fontFamily: "Verdana" }}
                          >
                            Verdana
                          </option>
                          <option
                            value="Impact"
                            style={{ fontFamily: "Impact" }}
                          >
                            Impact
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Text Content */}
                    <div
                      className={`${
                        textFieldBlink && "border-blue-500 border-2"
                      } flex-shrink-0 flex items-center gap-2 md:gap-3 bg-gray-50 rounded-lg px-3 py-2 shadow-sm border border-gray-200 flex-1 min-w-[180px]`}
                    >
                      <label className="text-xs font-medium text-gray-600 whitespace-nowrap hidden xs:block">
                        Content
                      </label>
                      <input
                        type="text"
                        ref={(el) => (inputRefs.current[item.id] = el)} // assign ref per element
                        value={item.content}
                        onChange={(e) =>
                          updateElement(item.id, {
                            content: e.target.value,
                          })
                        }
                        className={`${
                          textFieldBlink && "border-3 border-red-700"
                        } flex-1 min-w-0 text-sm bg-white border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                        placeholder="Enter text content..."
                      />
                    </div>
                  </div>
                </div>
              ))}
          {/* image edit */}
          {selectedElement &&
            elements[viewSide]
              .filter(
                (item) => item.id === selectedElement && item.type === "image"
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
                ? "cursor-grabbing"
                : "cursor-crosshair"
            }`}
            style={{
              width: "100%",
              maxWidth: device === "mobile" ? "240px" : "400px",
              height: "calc(100vw * 1.25)", // 5:4 aspect ratio
              maxHeight: device === "mobile" ? "300px" : "500px",
              backgroundImage: `url(${selectedColor.previewImages[viewSide]})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              touchAction: selectedElement ? "none" : "auto",
            }}
            onClick={handleCanvasClick}
            onTouchMove={(e) => enhancedHandleMove(e, selectedElement)}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
            onMouseMove={(e) => enhancedHandleMove(e, selectedElement)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
          >
            {/* T-shirt outline */}
            <div
              className="absolute inset-4 border border-dashed rounded-lg opacity-30 pointer-events-none"
              style={{
                borderColor:
                  selectedColor.color === "#FFFFFF"
                    ? "#9CA3AF"
                    : "rgba(255,255,255,0.6)",
              }}
            />

            {/* Print Area Limit Box */}
            <div
              className="absolute pointer-events-none z-5"
              style={{
                left: "27%",
                top: viewSide == "back" ? "20%" : "25%",
                width: `${printWidth}px`,
                height: `${printHeight}px`,
                border: "2px solid #ef4444",
                borderRadius: "8px",
                backgroundColor: "rgba(239, 68, 68, 0.05)",
                boxShadow: "inset 0 0 0 1px rgba(239, 68, 68, 0.2)",
              }}
            ></div>

            {/* Rotation Snap Lines */}
            {selectedElement &&
              rotationSnapLines.map((line, index) => (
                <div
                  key={index}
                  className="absolute pointer-events-none z-30"
                  style={{
                    ...(line.type === "horizontal"
                      ? {
                          left: "0",
                          right: "0",
                          top: `${line.y}px`,
                          height: "2px",
                          background:
                            "linear-gradient(90deg, transparent 0%, #3b82f6 20%, #3b82f6 80%, transparent 100%)",
                        }
                      : {
                          top: "0",
                          bottom: "0",
                          left: `${line.x}px`,
                          width: "2px",
                          background:
                            "linear-gradient(180deg, transparent 0%, #3b82f6 20%, #3b82f6 80%, transparent 100%)",
                        }),
                    boxShadow: "0 0 4px rgba(59, 130, 246, 0.5)",
                    animation: "pulse 1s ease-in-out infinite alternate",
                  }}
                >
                  {/* Angle indicator */}
                  <div
                    className="absolute bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-lg"
                    style={{
                      ...(line.type === "horizontal"
                        ? {
                            top: "-30px",
                            left: "50%",
                            transform: "translateX(-50%)",
                          }
                        : {
                            left: "-45px",
                            top: "50%",
                            transform: "translateY(-50%)",
                          }),
                    }}
                  >
                    {line.angle}°
                  </div>
                </div>
              ))}

            {/* Design Elements with Clipping */}
            {elements[viewSide].map((element) => {
              return (
                <div key={element.id} className="relative">
                  {/* out of print range warning  */}
                  <div className="absolute right-0">
                    {isElementOutOfBounds && (
                      <span
                        className="text-red-600 font-semibold text-sm 
                      animate-pulse transition-opacity duration-700 ease-in-out
                      px-2 py-1 bg-red-100 border border-red-400 rounded-md shadow-sm"
                      >
                        ⚠ Out of print range
                      </span>
                    )}
                  </div>

                  {/* rotation info warning  */}
                  <div className="absolute left-0">
                    {showRotateInfo && (
                      <span
                        className="text-yellow-600 font-semibold text-sm 
                      animate-pulse transition-opacity duration-500 ease-in-out
                      px-2 py-1 bg-red-100 border border-red-400 rounded-md shadow-sm"
                      >
                        ⚠ Hold the rotate icon and rotate
                      </span>
                    )}
                  </div>

                  {/* Main Element */}
                  <div
                    className={`absolute cursor-move touch-none select-none transition-opacity 
                    ${selectedElement === element.id ? "z-10" : "z-0"} ${
                      isElementOutOfBounds && "opacity-30"
                    }`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      transform:
                        parseInt((element?.style?.rotation + 365) / 90) >
                        parseInt((element?.style?.rotation + 360) / 90)
                          ? `rotate(${
                              90 *
                              parseInt((element.style?.rotation + 365) / 90)
                            }deg)`
                          : parseInt((element?.style?.rotation + 445) / 90) ===
                            parseInt((element?.style?.rotation + 360) / 90)
                          ? `rotate(${
                              90 *
                              parseInt((element.style?.rotation - 365) / 90)
                            }deg)`
                          : `rotate(${element.style?.rotation || 0}deg)`,

                      transformOrigin: "center center",
                    }}
                    onClick={(e) => handleElementClick(element, e)}
                    onMouseDown={(e) => handleElementStart(e, element)}
                    onTouchStart={(e) => handleElementStart(e, element)}
                    onDoubleClick={() => setIsDoubleClicked(true)}
                  >
                    {/* Print area clipping mask */}
                    <div className="absolute inset-0 overflow-hidden">
                      {element.type === "text" ? (
                        <div
                          // onDoubleClick={handleDoubleClick}
                          style={{
                            fontSize: element.style.fontSize,
                            color: element.style.color,
                            fontWeight: element.style.fontWeight,
                            fontFamily: element.style.fontFamily,
                            whiteSpace: "nowrap",
                            userSelect: "none",
                            lineHeight: "1",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {/* {isEditing.id === element.id ? (
                            <input
                              type="text"
                              value={element.content}
                              onChange={(e) =>
                                updateElement(element.id, {
                                  content: e.target.value,
                                })
                              }
                              className={`flex-1 min-w-0 text-sm border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                              placeholder="Enter text content..."
                            />
                          ) : ( */}
                          {element.content}
                          {/* )} */}
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
                        transform:
                          parseInt((element?.style?.rotation + 365) / 90) >
                          parseInt((element?.style?.rotation + 360) / 90)
                            ? `rotate(${
                                90 *
                                parseInt((element.style?.rotation + 365) / 90)
                              }deg)`
                            : parseInt(
                                (element?.style?.rotation + 445) / 90
                              ) ===
                              parseInt((element?.style?.rotation + 360) / 90)
                            ? `rotate(${
                                90 *
                                parseInt((element.style?.rotation - 365) / 90)
                              }deg)`
                            : `rotate(${element.style?.rotation || 0}deg)`,
                        transformOrigin: `${(element.width + 8) / 2}px ${
                          (element.height + 8) / 2
                        }px`,
                      }}
                    >
                      {/* Selection Border - Red if outside print area */}
                      <div
                        className={`absolute inset-0 border-2 border-dashed rounded opacity-80 ${
                          isElementOutOfBounds
                            ? "border-red-500"
                            : "border-blue-400"
                        }`}
                      ></div>

                      {/* Resize Handle */}

                      <IoIosResize
                        className="bg-black text-lg rotate-90 text-white font-semibold absolute -bottom-4 -right-4 w-5 h-5 rounded-full shadow-md cursor-se-resize pointer-events-auto transition-colors hover:scale-110"
                        onMouseDown={(e) => handleResizeStart(e, element)}
                        onTouchStart={(e) => handleResizeStart(e, element)}
                        title="Resize"
                      />

                      {/* Rotation Handle */}
                      <div
                        className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-md cursor-grab pointer-events-auto hover:bg-purple-600 transition-colors hover:scale-110 flex items-center justify-center"
                        onMouseDown={(e) => handleRotateStart(e, element)}
                        onTouchStart={(e) => handleRotateStart(e, element)}
                        title="Rotate"
                      >
                        <RotateCw
                          onClick={handleRotateInfo}
                          size={12}
                          className="text-white"
                        />
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* front and back toggle  */}
        <div className="mt-6 text-center">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewSide("front")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewSide === "front"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shirt size={16} />
                Front View
              </div>
            </button>
            <button
              onClick={() => setViewSide("back")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewSide === "back"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-800"
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
