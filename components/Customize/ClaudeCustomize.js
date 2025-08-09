import React, { useState, useRef, useCallback } from 'react';
import { Upload, Type, Download, Send, Trash2, RotateCcw, Move, ZoomIn } from 'lucide-react';

const TShirtDesigner = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const tshirtColors = [
    { color: '#000000', previewImage: '/preview-images/Black.png', name: 'Black' },
    { color: '#4CAF50', previewImage: '/preview-images/Green.png', name: 'Green' },
    { color: '#E6E6FA', previewImage: '/preview-images/Levender.png', name: 'Lavender' },
    { color: '#800000', previewImage: '/preview-images/Maroon.png', name: 'Maroon' },
    { color: '#000080', previewImage: '/preview-images/Navy Blue.png', name: 'Navy Blue' },
    { color: '#FF0000', previewImage: '/preview-images/Red.png', name: 'Red' },
    { color: '#87CEEB', previewImage: '/preview-images/Sky Blue.png', name: 'Sky Blue' },
    { color: '#FFFFFF', previewImage: '/preview-images/White.png', name: 'White' },
  ];

  const [selectedColor, setSelectedColor] = useState(tshirtColors[0]);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newText, setNewText] = useState('');
  const [textStyle, setTextStyle] = useState({
    fontSize: 24,
    color: '#000000',
    fontWeight: 'normal',
    fontFamily: 'Arial'
  });

  // Add text element
  const addText = () => {
    if (!newText.trim()) return;
    
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: newText,
      x: 150,
      y: 200,
      width: 200,
      height: 40,
      style: { ...textStyle }
    };
    
    setElements([...elements, newElement]);
    setNewText('');
    setSelectedElement(newElement.id);
  };

  // Add image element
  const addImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newElement = {
          id: Date.now(),
          type: 'image',
          content: e.target.result,
          x: 150,
          y: 200,
          width: Math.min(img.width, 200),
          height: Math.min(img.height, 200),
          originalWidth: img.width,
          originalHeight: img.height
        };
        
        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Mouse event handlers
  const handleMouseDown = (e, element) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDraggedElement(element.id);
    setSelectedElement(element.id);
    setDragOffset({
      x: x - element.x,
      y: y - element.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedElement) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setElements(elements.map(el => 
      el.id === draggedElement 
        ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
        : el
    ));
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
  };

  // Delete element
  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  // Update element properties
  const updateElement = (id, updates) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  // Download design
  const downloadDesign = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    try {
      // Draw t-shirt background image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      
      // Wait for background image to load
      await new Promise((resolve, reject) => {
        bgImg.onload = () => {
          // Draw the t-shirt image as background
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        bgImg.onerror = () => {
          // Fallback to solid color if image fails to load
          console.warn('T-shirt image failed to load, using solid color');
          ctx.fillStyle = selectedColor.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add t-shirt shape outline as fallback
          ctx.strokeStyle = selectedColor.color === '#FFFFFF' ? '#E5E7EB' : 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
          resolve();
        };
        
        // Set a timeout for image loading
        setTimeout(() => {
          reject(new Error('Image loading timeout'));
        }, 5000);
        
        bgImg.src = selectedColor.previewImage;
      });
      
      // Draw all design elements on top of the t-shirt
      for (const element of elements) {
        if (element.type === 'text') {
          ctx.font = `${element.style.fontWeight} ${element.style.fontSize}px ${element.style.fontFamily}`;
          ctx.fillStyle = element.style.color;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          
          // Add text shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          
          ctx.fillText(element.content, element.x, element.y);
          
          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else if (element.type === 'image') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, element.x, element.y, element.width, element.height);
              resolve();
            };
            img.onerror = () => {
              console.warn('Design image failed to load');
              resolve();
            };
            img.src = element.content;
          });
        }
      }
    } catch (error) {
      console.error('Error creating design:', error);
      // Fallback rendering
      ctx.fillStyle = selectedColor.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Download the final design
    const link = document.createElement('a');
    link.download = `tshirt-design-${selectedColor.name.toLowerCase().replace(' ', '-')}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  // Send request
  const sendRequest = () => {
    const designData = {
      color: selectedColor.name,
      elements: elements,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, you'd send this to your backend
    console.log('Design request:', designData);
    alert('Your design request has been sent! We will contact you soon.');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">T-Shirt Designer</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Tools */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Design Tools</h2>
            
            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-600">T-Shirt Color</h3>
              <div className="grid grid-cols-4 gap-2">
                {tshirtColors.map((colorOption) => (
                  <button
                    key={colorOption.color}
                    onClick={() => setSelectedColor(colorOption)}
                    className={`w-12 h-12 rounded-full border-2 ${
                      selectedColor.color === colorOption.color 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>
            
            {/* Add Text */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-600">Add Text</h3>
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter text..."
                className="w-full p-2 border rounded-md mb-2"
              />
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="number"
                  value={textStyle.fontSize}
                  onChange={(e) => setTextStyle({...textStyle, fontSize: parseInt(e.target.value)})}
                  min="10"
                  max="72"
                  className="p-2 border rounded-md"
                  placeholder="Size"
                />
                <input
                  type="color"
                  value={textStyle.color}
                  onChange={(e) => setTextStyle({...textStyle, color: e.target.value})}
                  className="p-1 border rounded-md h-10"
                />
              </div>
              
              <select
                value={textStyle.fontWeight}
                onChange={(e) => setTextStyle({...textStyle, fontWeight: e.target.value})}
                className="w-full p-2 border rounded-md mb-2"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
              
              <button
                onClick={addText}
                disabled={!newText.trim()}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Type size={16} />
                Add Text
              </button>
            </div>
            
            {/* Add Image */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-600">Add Image</h3>
              <input
                type="file"
                ref={fileInputRef}
                onChange={addImage}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                Upload Image
              </button>
            </div>
            
            {/* Element List */}
            {elements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-600">Elements</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      className={`p-2 border rounded-md cursor-pointer ${
                        selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {element.type === 'text' 
                            ? `Text: ${element.content.substring(0, 20)}${element.content.length > 20 ? '...' : ''}` 
                            : 'Image'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={downloadDesign}
                disabled={elements.length === 0}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download Design
              </button>
              
              <button
                onClick={sendRequest}
                disabled={elements.length === 0}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Send Print Request
              </button>
            </div>
          </div>
          
          {/* Center Panel - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">Design Preview</h2>
              
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
                    backgroundColor: selectedColor.color
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* T-shirt outline - now more subtle since we have the actual image */}
                  <div 
                    className="absolute inset-4 border border-dashed rounded-lg opacity-30"
                    style={{ 
                      borderColor: selectedColor.color === '#FFFFFF' ? '#9CA3AF' : 'rgba(255,255,255,0.6)' 
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
                            whiteSpace: 'nowrap',
                            userSelect: 'none'
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
          
          {/* Right Panel - Properties */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Properties</h2>
            
            {selectedElement ? (
              <div className="space-y-4">
                {(() => {
                  const element = elements.find(el => el.id === selectedElement);
                  if (!element) return null;
                  
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500">X</label>
                            <input
                              type="number"
                              value={Math.round(element.x)}
                              onChange={(e) => updateElement(element.id, { x: parseInt(e.target.value) })}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Y</label>
                            <input
                              type="number"
                              value={Math.round(element.y)}
                              onChange={(e) => updateElement(element.id, { y: parseInt(e.target.value) })}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Size
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500">Width</label>
                            <input
                              type="number"
                              value={Math.round(element.width)}
                              onChange={(e) => updateElement(element.id, { width: parseInt(e.target.value) })}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Height</label>
                            <input
                              type="number"
                              value={Math.round(element.height)}
                              onChange={(e) => updateElement(element.id, { height: parseInt(e.target.value) })}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {element.type === 'text' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Text Content
                            </label>
                            <input
                              type="text"
                              value={element.content}
                              onChange={(e) => updateElement(element.id, { content: e.target.value })}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Text Style
                            </label>
                            <div className="space-y-2">
                              <input
                                type="number"
                                value={element.style.fontSize}
                                onChange={(e) => updateElement(element.id, { 
                                  style: { ...element.style, fontSize: parseInt(e.target.value) }
                                })}
                                placeholder="Font Size"
                                className="w-full p-2 border rounded-md"
                                min="8"
                                max="72"
                              />
                              <input
                                type="color"
                                value={element.style.color}
                                onChange={(e) => updateElement(element.id, { 
                                  style: { ...element.style, color: e.target.value }
                                })}
                                className="w-full p-1 border rounded-md h-10"
                              />
                              <select
                                value={element.style.fontWeight}
                                onChange={(e) => updateElement(element.id, { 
                                  style: { ...element.style, fontWeight: e.target.value }
                                })}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <button
                        onClick={() => deleteElement(element.id)}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete Element
                      </button>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Select an element to edit its properties</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TShirtDesigner;