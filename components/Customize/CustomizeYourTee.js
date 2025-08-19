import React, { useState, useRef, useContext, useEffect } from 'react';
import { Printer, Download, X } from 'lucide-react';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import toast from 'react-hot-toast';
import TopElements from './TopElements';
import LeftPanelTools from './LeftPanelTools';
import CentralPanelPreview from './CentralPanelPreview';
import RightPanel from './RightPanel';
import { getGuestCustomerInfo } from '/utils/guestCustomer';
import { AuthContext } from '/Contexts/Auth/AuthProvider';

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
        back: '/preview-images/green-back.png',
      },
      name: 'Green',
    },
    {
      color: '#E6E6FA',
      previewImages: {
        front: '/preview-images/Levender.png',
        back: '/preview-images/levender-back.png',
      },
      name: 'Lavender',
    },
    {
      color: '#800000',
      previewImages: {
        front: '/preview-images/Maroon.png',
        back: '/preview-images/maroon-back.png',
      },
      name: 'Maroon',
    },
    {
      color: '#000080',
      previewImages: {
        front: '/preview-images/Navy-Blue.png',
        back: '/preview-images/navy-blue-back.png',
      },
      name: 'Navy Blue',
    },
    {
      color: '#FF0000',
      previewImages: {
        front: '/preview-images/Red.png',
        back: '/preview-images/red-back.png',
      },
      name: 'Red',
    },
    {
      color: '#87CEEB',
      previewImages: {
        front: '/preview-images/Sky-Blue.png',
        back: '/preview-images/sky-blue-back.png',
      },
      name: 'Sky Blue',
    },
    {
      color: '#FFFFFF',
      previewImages: {
        front: '/preview-images/White.png',
        back: '/preview-images/white-back.png',
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
  const [newText, setNewText] = useState('Type your text');
  const [textStyle, setTextStyle] = useState({
    fontSize: 24,
    color: '#000000',
    fontWeight: 'normal',
    fontFamily: 'Arial',
    rotation: 0,
  });
  const [imgStyle, setImgStyle] = useState({
    rotation: 0,
    scale: 1,
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState({
    front: null,
    back: null,
  });
  const [previewCanvases, setPreviewCanvases] = useState({
    front: null,
    back: null,
  });
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false); // State for form visibility
  const [name, setName] = useState(''); // State for name input
  const [phone, setPhone] = useState(''); // State for phone number input
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const { user, loading } = useContext(AuthContext);

  const [fonts, setFonts] = useState([]); // State to store fonts
  const [device, setDevice] = useState('laptop')

  useEffect(() => {
    // Fetch fonts from Google Fonts API
    const fetchFonts = async () => {
      try {
        const response = await fetch(
          'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAM0LG9pK8MEj86465G-u2_f0ds_5kc4iU',
        );
        const data = await response.json();
        setFonts(data.items); // Set fonts to state
      } catch (error) {
        console.error('Error fetching fonts:', error);
      } finally {
        setIsLoading(false); // Stop loading once fonts are fetched
      }
    };

    fetchFonts(); // Fetch fonts on component mount
  }, []);

  useEffect(() => {
    if (!loading) {
      const guestCustomerInfo = getGuestCustomerInfo();
      setCustomerEmail(user?.email || guestCustomerInfo.email);
    }
  }, [loading, user]);

  const updateDevice = () => {
    const width = window.innerWidth;
    if (width <= 600) {
      setDevice("mobile");
    } else if (width <= 1024) {
      setDevice("tablet");
    } else {
      setDevice("laptop");
    }
  };

  useEffect(() => {
    updateDevice();
  }, [window.innerWidth]);


  const handleFormSubmit = async () => {
    if (!name?.trim() || !phone?.trim()) {
      toast.error('Please fill out all fields.');
      return;
    }

    // ✅ Phone validation
    const phoneRegexNormal = /^\d{11}$/; // exactly 11 digits
    const phoneRegexWith88 = /^\+88\d{11}$/; // +88 followed by 11 digits

    if (!phoneRegexNormal.test(phone) && !phoneRegexWith88.test(phone)) {
      toast.error('Phone must be 11 digits, or +88 followed by 11 digits.');
      return;
    }

    if (!previewImages?.front || !previewImages?.back) {
      toast.error('Front and back previews are required.');
      return;
    }

    const groupId =
      crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

    setIsLoading(true);
    try {
      const submitSide = async (side) => {
        const fd = new FormData();
        fd.append('color', selectedColor.name);
        fd.append('side', side);
        fd.append('name', name);
        fd.append('phone', phone);
        fd.append('size', selectedSize);
        fd.append('quantity', quantity);
        if (customerEmail) fd.append('email', customerEmail); // make sure server supports this
        if (instructions) fd.append('specialInstructions', instructions);
        fd.append('groupId', groupId); // server should store this to link both sides

        const dataUrl =
          side === 'front' ? previewImages.front : previewImages.back;
        const blob = dataURLToBlob(dataUrl);
        fd.append('previewImage', blob, `design-image-${side}.png`);

        // Do NOT set Content-Type manually for FormData in the browser.
        const { data } = await axiosPublic.post(
          '/admin/send-customize-tee-request',
          fd,
        );
        const reqId = data?.id;
        if (!reqId) throw new Error('Missing id in response for ' + side);

        const sideElements = elements?.[side] ?? [];

        // console.log(elements[side],side);

        const textCalls = sideElements
          .filter((el) => el.type === 'text')
          .map((el) =>
            axiosPublic.post(`/admin/customized-text-element/${reqId}`, el),
          );

        const imageCalls = sideElements
          .filter((el) => el.type === 'image')
          .map((el) => {
            const imgFd = new FormData();
            imgFd.append(
              'image',
              dataURLToBlob(el.content),
              'element-image.png',
            );
            // append numeric props as strings
            [
              'height',
              'width',
              'originalHeight',
              'originalWidth',
              'x',
              'y',
              'scale',
              'rotation',
              'zIndex',
            ].forEach((k) => {
              if (el[k] != null) imgFd.append(k, String(el[k]));
              else if (el.style[k] != null)
                imgFd.append(k, String(el.style[k]));
            });
            return axiosPublic.post(
              `/admin/customized-image-element/${reqId}`,
              imgFd,
            );
          });

        await Promise.all([...textCalls, ...imageCalls]);
        return reqId;
      };

      // Run both sides in parallel
      await Promise.all([submitSide('front'), submitSide('back')]);

      toast.success(
        'Your design request has been sent! We will contact you soon.',
      );
      setIsPreviewOpen(false);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error while sending request:', error);
      toast.error('Failed to send your design request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTouchStart = (e, element) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    handleMouseDownEnhanced(mouseEvent, element);
  };

  const handleTouchEnd = () => {
    handleMouseUpEnhanced();
  };

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
      [viewSide]: [...prevState[viewSide], newElement],
    }));
    // setNewText('');
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

        if (img.width > img.height) {
          newWidth = Math.min(img.width, 200);
          newHeight = (newWidth / img.width) * img.height;
        } else {
          newHeight = Math.min(img.height, 200);
          newWidth = (newHeight / img.height) * img.width;
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
          [viewSide]: [...prevState[viewSide], newElement],
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
      [viewSide]: prevState[viewSide].map((el) =>
        el.id === draggedElement
          ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
          : el,
      ),
    }));
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    handleMouseMove(mouseEvent);
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
  };

  // Delete element
  const deleteElement = (id) => {
    setElements((prevState) => ({
      ...prevState,
      [viewSide]: prevState[viewSide].filter((el) => el.id !== id),
    }));
    setSelectedElement(null);
  };

  // reset element
  const handleReset = (id) => {
    // Find the element by id in the current view side (front or back)
    const elementToReset = elements[viewSide].find((el) => el.id === id);

    if (elementToReset) {
      // Calculate new dimensions while maintaining aspect ratio
      let newWidth, newHeight;

      if (elementToReset.type === 'image') {
        const maxDimension = 200; // Maximum size for the larger dimension
        const aspectRatio =
          elementToReset.originalWidth / elementToReset.originalHeight;

        // Check which dimension is larger
        if (elementToReset.originalWidth > elementToReset.originalHeight) {
          // Width is larger - constrain by width
          newWidth = Math.min(elementToReset.originalWidth, maxDimension);
          newHeight = newWidth / aspectRatio;
        } else {
          // Height is larger - constrain by height
          newHeight = Math.min(elementToReset.originalHeight, maxDimension);
          newWidth = newHeight * aspectRatio;
        }
      }

      // Reset element properties to initial values
      const resetElement = {
        ...elementToReset,
        x: 150, // Reset position to initial coordinates
        y: 200,
        // Reset size while maintaining aspect ratio for images
        width:
          elementToReset.type === 'image' ? newWidth : elementToReset.width,
        height:
          elementToReset.type === 'image' ? newHeight : elementToReset.height,
        style:
          elementToReset.type === 'text'
            ? { ...textStyle } // Reset to default text style
            : { ...imgStyle }, // Reset to default image style
      };

      // Update state with the reset element
      setElements((prevState) => ({
        ...prevState,
        [viewSide]: prevState[viewSide].map((el) =>
          el.id === id ? resetElement : el,
        ),
      }));
    }
  };

  // Update element properties
  const updateElement = (id, updates) => {
    console.log(updates);
    setElements((prevState) => ({
      ...prevState,
      [viewSide]: prevState[viewSide].map((el) =>
        el.id === id ? { ...el, ...updates } : el,
      ),
    }));
  };

  const generatePreviews = async () => {
    setIsLoading(true);
    try {
      const backCanvas = await generatePreview('back');
      const backImageUrl = backCanvas.toDataURL('image/jpeg', 0.8);

      const frontCanvas = await generatePreview('front');
      const frontImageUrl = frontCanvas.toDataURL('image/jpeg', 0.8);

      setPreviewImages({
        front: frontImageUrl,
        back: backImageUrl,
      });
      setPreviewCanvases({
        front: frontCanvas,
        back: backCanvas,
      });

      setIsPreviewOpen(true);
    } catch (error) {
      toast.error('Failed to generate preview');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = async (side) => {
    const canvas = document.createElement('canvas');
    canvas.width = device === 'mobile' ? 200 : 400;
    canvas.height = device === 'mobile' ? 250 : 500;
    const ctx = canvas.getContext('2d');

    try {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        bgImg.onerror = () => {
          ctx.fillStyle = selectedColor.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle =
            selectedColor.color === '#FFFFFF'
              ? '#E5E7EB'
              : 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
          resolve();
        };

        setTimeout(() => {
          reject(new Error('Image loading timeout'));
        }, 5000);

        bgImg.src = selectedColor.previewImages[side];
      });

      for (const element of elements[`${side}`]) {
        ctx.save();
        ctx.translate(
          element.x + element.width / 2,
          element.y + element.height / 2,
        );
        ctx.rotate((element.style.rotation * Math.PI) / 180);
        ctx.translate(
          -element.x - element.width / 2,
          -element.y - element.height / 2,
        );

        if (element.type === 'text') {
          ctx.font = `${element.style.fontWeight} ${element.style.fontSize}px ${element.style.fontFamily}`;
          ctx.fillStyle = element.style.color;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(element.content, element.x, element.y);
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
        ctx.restore();
      }

      return canvas;
    } catch (error) {
      console.error('Error creating preview:', error);
      throw error;
    }
  };

  const downloadDesign = () => {
    if (!previewCanvases.front && !previewCanvases.back) return;

    const downloadCanvas = (canvas, side) => {
      canvas.toBlob(
        (blob) => {
          const link = document.createElement('a');
          link.download = `tshirt-design-${selectedColor.name.toLowerCase()}-${side}-${Date.now()}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        },
        'image/png',
        1.0,
      );
    };

    downloadCanvas(previewCanvases.front, 'front');
    downloadCanvas(previewCanvases.back, 'back');
    setIsPreviewOpen(false);
    toast.success('Design downloaded successfully');
  };

  const axiosPublic = useAxiosPublic();

  const dataURLToBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const mimeType = dataURL.split(';')[0].split(':')[1];
    return new Blob([uint8Array], { type: mimeType });
  };

  const sendRequest = async () => {
    setIsFormOpen(true);
  };

  const handleElementStart = (e, element) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left || e.touches?.[0]?.clientX - rect.left;
    const y = e.clientY - rect.top || e.touches?.[0]?.clientY - rect.top;

    setDraggedElement(element.id);
    setSelectedElement(element.id);
    setDragOffset({
      x: x - element.x,
      y: y - element.y,
    });
  };

  const handleMove = (e) => {
    if (!draggedElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    // Get current position based on input type
    const x = e.clientX - rect.left || e.touches?.[0]?.clientX - rect.left;
    const y = e.clientY - rect.top || e.touches?.[0]?.clientY - rect.top;

    setElements((prevState) => ({
      ...prevState,
      [viewSide]: prevState[viewSide].map((el) =>
        el.id === draggedElement
          ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
          : el,
      ),
    }));
  };

  const handleEnd = () => {
    // Remove both mouse and touch listeners
    setDraggedElement(null);
  };

  const panelStyle = 'bg-white rounded-xl shadow-lg border border-gray-200 p-6';
  const headingTitle =
    'flex items-center gap-3 text-lg font-semibold text-black mb-6';
  const buttonStyle =
    'w-full px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <TopElements />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            quantity={quantity}
            setQuantity={setQuantity}
          />

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
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            handleTouchStart={handleTouchStart}
            handleElementStart={handleElementStart}
            handleEnd={handleEnd}
            handleMove={handleMove}
            device={device}
          />

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
            handleReset={handleReset}
            instructions={instructions}
            setInstructions={setInstructions}
            fonts={fonts}
          />
        </div>

        {isPreviewOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all duration-300">
              <div className="flex justify-between items-center border-b border-gray-200 p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Design Preview
                </h2>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Front View
                  </h3>
                  <img
                    src={previewImages.front}
                    alt="Front Design Preview"
                    className="w-48 md:w-full h-auto rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Back View
                  </h3>
                  <img
                    src={previewImages.back}
                    alt="Back Design Preview"
                    className="w-48 md:w-full h-auto rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={downloadDesign}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2"
                >
                  <Download size={18} />
                  Download Design
                </button>
                <button
                  onClick={sendRequest}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-white transition-colors duration-200 flex items-center gap-2 ${
                    isLoading
                      ? 'bg-orange-400'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {isLoading ? (
                    'Processing...'
                  ) : (
                    <>
                      <Printer size={18} />
                      Request Design Print
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show Form if the user clicks "Request Print Quote" */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Enter Your Details
              </h2>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your Phone Number"
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormSubmit}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-white transition-colors duration-200 flex items-center gap-2 ${
                    isLoading
                      ? 'bg-orange-400'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
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
