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
import TopElements from './TopElements';
import LeftPanelTools from './LeftPanelTools';
import CentralPanelPreview from './CentralPanelPreview';
import RightPanel from './RightPanel';

const CustomizeYourTee = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const tshirtColors = [
    {
      color: '#000000',
      previewImages: {
        front: '/preview-images/Black.png',
        back: '/preview-images/black-back.png',
      },
      name: 'Black',
    },
    {
      color: '#4CAF50',
      previewImages: {
        front: '/preview-images/Green.png',
        back: '/preview-images/green-back.png', // Added back image
      },
      name: 'Green',
    },
    {
      color: '#E6E6FA',
      previewImages: {
        front: '/preview-images/Levender.png',
        back: '/preview-images/levender-back.png', // Added back image
      },
      name: 'Lavender',
    },
    {
      color: '#800000',
      previewImages: {
        front: '/preview-images/Maroon.png',
        back: '/preview-images/maroon-back.png', // Added back image
      },
      name: 'Maroon',
    },
    {
      color: '#000080',
      previewImages: {
        front: '/preview-images/Navy-Blue.png',
        back: '/preview-images/navy-blue-back.png', // Added back image
      },
      name: 'Navy Blue',
    },
    {
      color: '#FF0000',
      previewImages: {
        front: '/preview-images/Red.png',
        back: '/preview-images/red-back.png', // Added back image
      },
      name: 'Red',
    },
    {
      color: '#87CEEB',
      previewImages: {
        front: '/preview-images/Sky-Blue.png',
        back: '/preview-images/sky-blue-back.png', // Added back image
      },
      name: 'Sky Blue',
    },
    {
      color: '#FFFFFF',
      previewImages: {
        front: '/preview-images/White.png',
        back: '/preview-images/white-back.png', // Added back image
      },
      name: 'White',
    },
  ];

  const [viewSide, setViewSide] = useState('front');
  const [selectedColor, setSelectedColor] = useState(tshirtColors[0]);
  const [elements, setElements] = useState({
    front: [],
    back: [],
  });
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
  const [imgStyle, setImgStyle] = useState({
    rotation: 0,
    scale: 1,
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // New state for controlling the modal visibility
  const [previewImages, setPreviewImages] = useState({
    front: null,
    back: null,
  });
  const [previewCanvases, setPreviewCanvases] = useState({
    front: null,
    back: null,
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
      style: { ...textStyle },
    };

    setElements((prevState) => ({
      ...prevState,
      [viewSide]: [...prevState[viewSide], newElement], // Update elements for the current side
    }));
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
        let newWidth = img.width;
        let newHeight = img.height;

        // Check which dimension is larger and scale down the other one to maintain the aspect ratio
        if (img.width > img.height) {
          newWidth = Math.min(img.width, 200);
          newHeight = (newWidth / img.width) * img.height; // Scale height accordingly
        } else {
          newHeight = Math.min(img.height, 200);
          newWidth = (newHeight / img.height) * img.width; // Scale width accordingly
        }

        const newElement = {
          id: Date.now(),
          type: 'image',
          content: e.target.result,
          x: 150,
          y: 200,
          width: newWidth,
          height: newHeight,
          originalWidth: img.width,
          originalHeight: img.height,
          style: { ...imgStyle },
        };

        setElements((prevState) => ({
          ...prevState,
          [viewSide]: [...prevState[viewSide], newElement], // Update elements for the current side
        }));
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

    setElements((prevState) => ({
      ...prevState,
      [viewSide]: elements[viewSide].map((el) =>
        el.id === draggedElement
          ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
          : el,
      ), // Update elements for the current side
    }));
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
  };

  // Delete element
  const deleteElement = (id) => {
    setElements((prevState) => ({
      ...prevState,
      [viewSide]: prevState[viewSide].filter((el) => el.id !== id), // Remove element from the current side
    }));
    setSelectedElement(null);
  };

  // Update element properties
  const updateElement = (id, updates) => {
    setElements((prevState) => ({
      ...prevState,
      [viewSide]: prevState[viewSide].map((el) =>
        el.id === id ? { ...el, ...updates } : el,
      ), // Update the element in the current side
    }));
  };

  const generatePreviews = async () => {
    // Generate front side with background
    const backCanvas = await generatePreview('back');
    const backImageUrl = backCanvas.toDataURL('image/jpeg', 0.8); // quality between 0–1

    // Generate front side with background
    const frontCanvas = await generatePreview('front');
    const frontImageUrl = frontCanvas.toDataURL('image/jpeg', 0.8); // quality between 0–1

    setPreviewImages({
      front: frontImageUrl,
      back: backImageUrl,
    });
    setPreviewCanvases({
      front: frontCanvas,
      back: backCanvas,
    }); // Store the preview canvas

    setIsPreviewOpen(true);
  };

  // Generate front preview
  const generatePreview = async (side) => {
    console.log(side);
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

        bgImg.src = selectedColor.previewImages[viewSide];
      });

      // Draw all design elements on top of the t-shirt
      for (const element of elements[`${side}`]) {
        ctx.save(); // Save the current context
        ctx.translate(
          element.x + element.width / 2,
          element.y + element.height / 2,
        ); // Move to the center of the text
        ctx.rotate((element.style.rotation * Math.PI) / 180); // Rotate by the element's rotation (in radians)
        ctx.translate(
          -element.x - element.width / 2,
          -element.y - element.height / 2,
        ); // Reset back to the original position

        if (element.type === 'text') {
          ctx.font = `${element.style.fontWeight} ${element.style.fontSize}px ${element.style.fontFamily}`;
          ctx.fillStyle = element.style.color;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          ctx.fillText(element.content, element.x, element.y);

          // Restore the context to remove rotation effect
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

              // Restore the context to remove rotation effect
              resolve();
            };
            img.onerror = () => {
              console.warn('Design image failed to load');
              resolve();
            };
            img.src = element.content;
          });
        }
        ctx.restore();
      }

      return canvas;
      // generateBackPreview(); // Open the preview modal
    } catch (error) {
      console.error('Error creating preview:', error);
    }
  };

  // Download the previewed design
  const downloadDesign = () => {
    if (!previewCanvases.front && !previewCanvases.back) return;

    previewCanvases.front.toBlob(
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

    previewCanvases.back.toBlob(
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

    // Append the preview image as a Blob
    const frontPreviewImageBlob = dataURLToBlob(previewImages.front);
    formData.append('previewImage', frontPreviewImageBlob, 'design-image.png'); // Add filename if needed

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

      for (const element of elements.front) {
        if (element.type === 'text') {
          const result = await axiosPublic.post(
            `/admin/customized-text-element/${res.data.id}`,
            element,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
        } else if (element.type === 'image') {
          // Convert image to Blob
          const previewElementBlob = dataURLToBlob(element.content);

          // Create a new FormData for each image element
          const imageFormData = new FormData();
          imageFormData.append(
            'image',
            previewElementBlob,
            'element-image.png',
          ); // Add a filename for the image

          imageFormData.append('height', element.height);
          imageFormData.append('width', element.width);
          imageFormData.append('originalHeight', element.originalHeight);
          imageFormData.append('originalWidth', element.originalWidth);
          imageFormData.append('x', element.x);
          imageFormData.append('y', element.y);

          const result = await axiosPublic.post(
            `/admin/customized-image-element/${res.data.id}`,
            imageFormData, // Send the FormData with image
            {
              headers: {
                'Content-Type': 'multipart/form-data', // For file uploads
              },
            },
          );
        }
      }

      // Append the preview image as a Blob
      const backPreviewImageBlob = dataURLToBlob(previewImages.back);
      formData.append('previewImage', backPreviewImageBlob, 'design-image.png'); // Add filename if needed

      const backRes = await axiosPublic.post(
        '/admin/send-customize-tee-request',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      for (const element of elements.back) {
        if (element.type === 'text') {
          const result = await axiosPublic.post(
            `/admin/customized-text-element/${backRes.data.id}`,
            element,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
        } else if (element.type === 'image') {
          // Convert image to Blob
          const previewElementBlob = dataURLToBlob(element.content);

          // Create a new FormData for each image element
          const imageFormData = new FormData();
          imageFormData.append(
            'image',
            previewElementBlob,
            'element-image.png',
          ); // Add a filename for the image

          imageFormData.append('height', element.height);
          imageFormData.append('width', element.width);
          imageFormData.append('originalHeight', element.originalHeight);
          imageFormData.append('originalWidth', element.originalWidth);
          imageFormData.append('x', element.x);
          imageFormData.append('y', element.y);

          const result = await axiosPublic.post(
            `/admin/customized-image-element/${backRes.data.id}`,
            imageFormData, // Send the FormData with image
            {
              headers: {
                'Content-Type': 'multipart/form-data', // For file uploads
              },
            },
          );
        }
      }

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
        <TopElements></TopElements>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Tools */}
          <LeftPanelTools
            tshirtColors={tshirtColors}
            setSelectedColor={setSelectedColor}
            selectedColor={selectedColor}
            newText={newText}
            setNewText={setNewText}
            textStyle={textStyle}
            imgStyle={imgStyle}
            setTextStyle={setTextStyle}
            addText={addText}
            fileInputRef={fileInputRef}
            addImage={addImage}
            elements={elements}
            viewSide={viewSide}
            panelStyle={panelStyle}
            headingTitle={headingTitle}
            selectedElement={selectedElement}
            deleteElement={deleteElement}
            setSelectedElement={setSelectedElement}
          />

          {/* Center Panel - Preview */}
          <CentralPanelPreview
            panelStyle={panelStyle}
            headingTitle={headingTitle}
            canvasRef={canvasRef}
            selectedColor={selectedColor}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            elements={elements}
            selectedElement={selectedElement}
            handleMouseDown={handleMouseDown}
            viewSide={viewSide}
            setViewSide={setViewSide}
          />

          {/* Right Panel - Properties & Actions */}
          <RightPanel
            panelStyle={panelStyle}
            headingTitle={headingTitle}
            selectedElement={selectedElement}
            elements={elements}
            viewSide={viewSide}
            generatePreview={generatePreviews}
            buttonStyle={buttonStyle}
            updateElement={updateElement}
            deleteElement={deleteElement}
          />
        </div>
        {/* is preview open  */}
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Design Preview</h2>
              <div className="mb-4 flex flex-col md:flex-row items-center gap-5 md:gap-0">
                <img
                  src={previewImages.front} // Use the base64 image URL generated from the canvas
                  alt="T-shirt Design Preview"
                  className="w-48 md:w-full h-auto rounded"
                />
                <img
                  src={previewImages.back} // Use the base64 image URL generated from the canvas
                  alt="T-shirt Design Preview"
                  className="w-48 md:w-full h-auto rounded"
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
                  disabled={elements[viewSide].length === 0}
                  className={`${buttonStyle} ${
                    elements[viewSide].length === 0
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
