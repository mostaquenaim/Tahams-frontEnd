import { useState, useRef } from 'react';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import toast from 'react-hot-toast';

export const tshirtColors = [
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

const CustomizationFunction = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
    // formData.append('elements', JSON.stringify(elements));

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

      for (const element of elements) {
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

      // Handle the response
      toast.success(
        'Your design request has been sent! We will contact you soon.',
      );
    } catch (error) {
      console.error('Error while sending request:', error);
      toast.error('Failed to send your design request.');
    }
  };
};

export default CustomizationFunction;
