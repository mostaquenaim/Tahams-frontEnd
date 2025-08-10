import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Type, ImageIcon, RotateCcw, Move, ZoomIn, ZoomOut } from 'lucide-react';

const TShirtCustomizer = () => {
  const [currentView, setCurrentView] = useState('front');
  const [elements, setElements] = useState({
    front: [],
    back: []
  });
  const [selectedElement, setSelectedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Default t-shirt images
  const tshirtImages = {
    front: 'preview-images/Black.png',
    back: 'preview-images/black-back.png'
  };

  // Add text element
  const addText = () => {
    const newText = {
      id: Date.now(),
      type: 'text',
      content: 'Your Text Here',
      x: 150,
      y: 200,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      rotation: 0,
      scale: 1
    };
    setElements(prev => ({
      ...prev,
      [currentView]: [...prev[currentView], newText]
    }));
  };

  // Add image element
  const addImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        id: Date.now(),
        type: 'image',
        src: e.target.result,
        x: 150,
        y: 200,
        width: 100,
        height: 100,
        rotation: 0,
        scale: 1
      };
      setElements(prev => ({
        ...prev,
        [currentView]: [...prev[currentView], newImage]
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      addImage(file);
    }
  };

  // Update element properties
  const updateElement = (id, updates) => {
    setElements(prev => ({
      ...prev,
      [currentView]: prev[currentView].map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  };

  // Delete element
  const deleteElement = (id) => {
    setElements(prev => ({
      ...prev,
      [currentView]: prev[currentView].filter(el => el.id !== id)
    }));
    setSelectedElement(null);
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e, element) => {
    e.preventDefault();
    setSelectedElement(element);
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedElement) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;
      
      updateElement(selectedElement.id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate canvas for download
  const generateCanvas = async (view, includeBackground = true) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 500;

    if (includeBackground) {
      // Load and draw t-shirt background
      const tshirtImg = new Image();
      tshirtImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        tshirtImg.onload = resolve;
        tshirtImg.src = tshirtImages[view];
      });
      ctx.drawImage(tshirtImg, 0, 0, canvas.width, canvas.height);
    }

    // Draw elements
    for (const element of elements[view]) {
      ctx.save();
      ctx.translate(element.x + (element.width || 0) / 2, element.y + (element.fontSize || 0) / 2);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.scale(element.scale, element.scale);

      if (element.type === 'text') {
        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = 'center';
        ctx.fillText(element.content, 0, 0);
      } else if (element.type === 'image') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = element.src;
        });
        ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
      }
      ctx.restore();
    }

    return canvas;
  };

  // Download designs as zip
  const downloadDesigns = async () => {
    try {
      // Create JSZip instance (we'll simulate this functionality)
      const files = [];

      // Generate front side with background
      const frontCanvas = await generateCanvas('front', true);
      const frontBlob = await new Promise(resolve => frontCanvas.toBlob(resolve, 'image/png'));
      files.push({ name: 'front-design.png', blob: frontBlob });

      // Generate back side with background
      const backCanvas = await generateCanvas('back', true);
      const backBlob = await new Promise(resolve => backCanvas.toBlob(resolve, 'image/png'));
      files.push({ name: 'back-design.png', blob: backBlob });

      // Generate designs only (without t-shirt background)
      const frontDesignCanvas = await generateCanvas('front', false);
      const frontDesignBlob = await new Promise(resolve => frontDesignCanvas.toBlob(resolve, 'image/png'));
      files.push({ name: 'front-elements-only.png', blob: frontDesignBlob });

      const backDesignCanvas = await generateCanvas('back', false);
      const backDesignBlob = await new Promise(resolve => backDesignCanvas.toBlob(resolve, 'image/png'));
      files.push({ name: 'back-elements-only.png', blob: backDesignBlob });

      // Since we can't use JSZip, we'll download files individually
      // In a real implementation, you would use JSZip library
      files.forEach((file, index) => {
        setTimeout(() => {
          const url = URL.createObjectURL(file.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }, index * 500); // Stagger downloads
      });

      alert('Design files are being downloaded individually. In a production environment, these would be packaged in a ZIP file.');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          T-Shirt Designer
        </h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Design Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              {/* View Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-700 rounded-lg p-1 flex">
                  <button
                    onClick={() => setCurrentView('front')}
                    className={`px-6 py-2 rounded-md transition-colors ${
                      currentView === 'front' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setCurrentView('back')}
                    className={`px-6 py-2 rounded-md transition-colors ${
                      currentView === 'back' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Back
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex justify-center">
                <div 
                  ref={canvasRef}
                  className="relative w-96 h-[500px] bg-gray-700 rounded-lg overflow-hidden cursor-crosshair"
                  style={{
                    backgroundImage: `url(${tshirtImages[currentView]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {elements[currentView].map((element) => (
                    <div
                      key={element.id}
                      className={`absolute cursor-move select-none ${
                        selectedElement?.id === element.id ? 'ring-2 ring-blue-400' : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        transform: `rotate(${element.rotation}deg) scale(${element.scale})`,
                        transformOrigin: 'center'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element)}
                    >
                      {element.type === 'text' ? (
                        <span
                          style={{
                            fontSize: `${element.fontSize}px`,
                            fontFamily: element.fontFamily,
                            color: element.color,
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                          }}
                        >
                          {element.content}
                        </span>
                      ) : (
                        <img
                          src={element.src}
                          alt="Design element"
                          style={{
                            width: element.width,
                            height: element.height,
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                          }}
                          draggable={false}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Add Elements */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Add Elements</h3>
              <div className="space-y-3">
                <button
                  onClick={addText}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Type size={20} />
                  Add Text
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ImageIcon size={20} />
                  Add Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Element Properties */}
            {selectedElement && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Element Properties</h3>
                
                {selectedElement.type === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Text</label>
                      <input
                        type="text"
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Font Size</label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={selectedElement.fontSize}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-400">{selectedElement.fontSize}px</span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <input
                        type="color"
                        value={selectedElement.color}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Font Family</label>
                      <select
                        value={selectedElement.fontFamily}
                        onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
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

                {selectedElement.type === 'image' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Width</label>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        value={selectedElement.width}
                        onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-400">{selectedElement.width}px</span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Height</label>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        value={selectedElement.height}
                        onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-400">{selectedElement.height}px</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rotation</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedElement.rotation}
                      onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-400">{selectedElement.rotation}°</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Scale</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={selectedElement.scale}
                      onChange={(e) => updateElement(selectedElement.id, { scale: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-400">{selectedElement.scale}x</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg mt-4 transition-colors"
                >
                  Delete Element
                </button>
              </div>
            )}

            {/* Download Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Download</h3>
              <button
                onClick={downloadDesigns}
                className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={20} />
                Download All Designs
              </button>
              <p className="text-sm text-gray-400 mt-2">
                Downloads front, back, and element-only versions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TShirtCustomizer;