import React, { useState, useRef } from 'react';
import {
  Save,
  FolderPlus,
  Sliders,
  Droplet,
  Plus,
  Upload,
  Download,
  Trash2,
  Settings2,
  Package,
  HelpCircle,
  Type,
  Printer,
  Layers,
} from 'lucide-react';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import toast from 'react-hot-toast';

const CustomizeYourTee = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const tshirtColors = [
    {
      color: '#000000',
      previewImage: '/preview-images/Black.png',
      name: 'Black',
    },
    {
      color: '#4CAF50',
      previewImage: '/preview-images/Green.png',
      name: 'Green',
    },
    {
      color: '#E6E6FA',
      previewImage: '/preview-images/Levender.png',
      name: 'Lavender',
    },
    {
      color: '#800000',
      previewImage: '/preview-images/Maroon.png',
      name: 'Maroon',
    },
    {
      color: '#000080',
      previewImage: '/preview-images/Navy Blue.png',
      name: 'Navy Blue',
    },
    { color: '#FF0000', previewImage: '/preview-images/Red.png', name: 'Red' },
    {
      color: '#87CEEB',
      previewImage: '/preview-images/Sky Blue.png',
      name: 'Sky Blue',
    },
    {
      color: '#FFFFFF',
      previewImage: '/preview-images/White.png',
      name: 'White',
    },
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
    fontFamily: 'Arial',
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // New state for controlling the modal visibility
  const [previewCanvas, setPreviewCanvas] = useState(null); // Store the preview canvas for download
  const [previewImage, setPreviewImage] = useState(null); // Store the preview canvas for download

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
      style: { ...textStyle },
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
          originalHeight: img.height,
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
      y: y - element.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setElements(
      elements.map((el) =>
        el.id === draggedElement
          ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
          : el,
      ),
    );
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
  };

  // Delete element
  const deleteElement = (id) => {
    setElements(elements.filter((el) => el.id !== id));
    setSelectedElement(null);
  };

  // Update element properties
  const updateElement = (id, updates) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    );
  };

  // Generate preview and show modal
  const generatePreview = async () => {
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
          ctx.strokeStyle =
            selectedColor.color === '#FFFFFF'
              ? '#E5E7EB'
              : 'rgba(255,255,255,0.2)';
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
              ctx.drawImage(
                img,
                element.x,
                element.y,
                element.width,
                element.height,
              );
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

      const imageUrl = canvas.toDataURL('image/jpeg', 0.8); // quality between 0–1

      setPreviewImage(imageUrl);
      setPreviewCanvas(canvas); // Store the preview canvas
      setIsPreviewOpen(true); // Open the preview modal
    } catch (error) {
      console.error('Error creating preview:', error);
    }
  };

  // Download the previewed design
  const downloadDesign = () => {
    if (!previewCanvas) return;

    previewCanvas.toBlob(
      (blob) => {
        const link = document.createElement('a');
        link.download = `tshirt-design-${selectedColor.name.toLowerCase()}-${Date.now()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href); // cleanup memory
      },
      'image/png',
      1.0,
    );

    setIsPreviewOpen(false);
  };

  const axiosPublic = useAxiosPublic();

  const dataURLToBlob = (dataURL) => {
    // console.log(dataURL)
    const byteString = atob(dataURL.split(',')[1]); // Decode the base64 part of the dataURL
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const mimeType = dataURL.split(';')[0].split(':')[1]; // Get MIME type (e.g., image/jpeg)

    return new Blob([uint8Array], { type: mimeType });
  };

  const sendRequest = async () => {
    const formData = new FormData();

    // Append design data to the form
    formData.append('color', selectedColor.name);
    formData.append('timestamp', new Date().toISOString());

    // console.log('previewImage',previewImage);
    // Append the preview image as a Blob
    const previewImageBlob = dataURLToBlob(previewImage);
    formData.append('previewImage', previewImageBlob, 'design-image.png'); // Add filename if needed

    // Optionally, add other elements like text, images, etc.
    formData.append('elements', JSON.stringify(elements));

    try {
      // Send the request
      const res = await axiosPublic.post(
        '/admin/send-customize-tee-request',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', 
          },
        },
      );

      // Handle the response
      toast.success(
        'Your design request has been sent! We will contact you soon.',
      );
    } catch (error) {
      console.error('Error while sending request:', error);
      toast.error('Failed to send your design request.');
    }
  };

  const panelStyle = 'bg-white rounded-xl shadow-md p-6 border border-gray-100';
  const headingTitle = 'text-xl font-semibold mb-4 text-gray-800 border-b pb-3';
  const sectionTitle =
    'text-md font-medium mb-3 text-gray-700 flex items-center gap-2';
  const buttonStyle =
    'w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              T-Shirt Design Studio
            </h1>
            <p className="text-gray-500 mt-1">
              Create custom apparel designs for your business
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Save size={16} />
              Save Draft
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <FolderPlus size={16} />
              New Design
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Tools */}
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
                            {/* {element.type === 'text' ? (
                              <Type size={14} className="text-gray-500" />
                            ) : (
                              <Image size={14} className="text-gray-500" />
                            )} */}
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

          {/* Center Panel - Preview */}
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
                        selectedElement === element.id
                          ? 'ring-2 ring-blue-400'
                          : ''
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

          {/* Right Panel - Properties & Actions */}
          <div className="lg:col-span-3 space-y-6">
            <div className={panelStyle}>
              <h2 className={headingTitle}>
                <Settings2 size={18} />
                Element Properties
              </h2>

              {selectedElement ? (
                <div className="space-y-5">
                  {(() => {
                    const element = elements.find(
                      (el) => el.id === selectedElement,
                    );
                    if (!element) return null;

                    return (
                      <>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Position & Size
                          </h4>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                X Position
                              </label>
                              <input
                                type="number"
                                value={Math.round(element.x)}
                                onChange={(e) =>
                                  updateElement(element.id, {
                                    x: parseInt(e.target.value),
                                  })
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Y Position
                              </label>
                              <input
                                type="number"
                                value={Math.round(element.y)}
                                onChange={(e) =>
                                  updateElement(element.id, {
                                    y: parseInt(e.target.value),
                                  })
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Width
                              </label>
                              <input
                                type="number"
                                value={Math.round(element.width)}
                                onChange={(e) =>
                                  updateElement(element.id, {
                                    width: parseInt(e.target.value),
                                  })
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Height
                              </label>
                              <input
                                type="number"
                                value={Math.round(element.height)}
                                onChange={(e) =>
                                  updateElement(element.id, {
                                    height: parseInt(e.target.value),
                                  })
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>

                        {element.type === 'text' && (
                          <>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Text Content
                              </h4>
                              <textarea
                                value={element.content}
                                onChange={(e) =>
                                  updateElement(element.id, {
                                    content: e.target.value,
                                  })
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg h-20"
                                placeholder="Enter your text here..."
                              />
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Text Styling
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Font Size
                                  </label>
                                  <input
                                    type="number"
                                    value={element.style.fontSize}
                                    onChange={(e) =>
                                      updateElement(element.id, {
                                        style: {
                                          ...element.style,
                                          fontSize: parseInt(e.target.value),
                                        },
                                      })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    min="8"
                                    max="72"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Text Color
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
                                    className="w-full p-1 border border-gray-300 rounded-lg h-10"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Font Weight
                                  </label>
                                  <select
                                    value={element.style.fontWeight}
                                    onChange={(e) =>
                                      updateElement(element.id, {
                                        style: {
                                          ...element.style,
                                          fontWeight: e.target.value,
                                        },
                                      })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                  >
                                    <option value="normal">Normal</option>
                                    <option value="500">Medium</option>
                                    <option value="bold">Bold</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="pt-3 border-t border-gray-200">
                          <button
                            onClick={() => deleteElement(element.id)}
                            className={`${buttonStyle} bg-red-600 text-white hover:bg-red-700`}
                          >
                            <Trash2 size={16} />
                            Delete Element
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  {/* <Select size={24} className="mx-auto text-gray-400 mb-3" /> */}
                  <p className="text-gray-500 font-medium">
                    No element selected
                  </p>
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
        </div>
        {/* is preview open  */}
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Design Preview</h2>
              <div className="mb-4">
                <img
                  src={previewImage} // Use the base64 image URL generated from the canvas
                  alt="T-shirt Design Preview"
                  className="w-full h-auto rounded"
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Close
                </button>

                <button
                  onClick={sendRequest}
                  disabled={elements.length === 0}
                  className={`${buttonStyle} ${
                    elements.length === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  <Printer size={16} />
                  Request Print Quote
                </button>
                
                <button
                  onClick={downloadDesign}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizeYourTee;
