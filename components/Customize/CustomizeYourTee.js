import React, { useState, useRef, useContext, useEffect } from "react";
import { Printer, Download, X, Layers } from "lucide-react";
import toast from "react-hot-toast";
import TopElements from "./TopElements";
import CentralPanelPreview from "./CentralPanelPreview";
import RightPanel from "./RightPanel";

import { getGuestCustomerInfo } from '/utils/guestCustomer';
import useAxiosPublic from '/Hooks/useAxiosPublic';
import { AuthContext } from '/Contexts/Auth/AuthProvider';

const CustomizeYourTee = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const tshirtColors = [
    {
      color: "#FF0000",
      previewImages: {
        front: "/preview-images/Red.png",
        back: "/preview-images/red-back.png",
      },
      name: "Red",
    },
    {
      color: "#000000",
      previewImages: {
        front: "/preview-images/Black.png",
        back: "/preview-images/black-back.png",
      },
      name: "Black",
    },
    {
      color: "#4CAF50",
      previewImages: {
        front: "/preview-images/Green.png",
        back: "/preview-images/green-back.png",
      },
      name: "Green",
    },
    {
      color: "#E6E6FA",
      previewImages: {
        front: "/preview-images/Levender.png",
        back: "/preview-images/levender-back.png",
      },
      name: "Lavender",
    },
    {
      color: "#800000",
      previewImages: {
        front: "/preview-images/Maroon.png",
        back: "/preview-images/maroon-back.png",
      },
      name: "Maroon",
    },
    {
      color: "#000080",
      previewImages: {
        front: "/preview-images/Navy-Blue.png",
        back: "/preview-images/navy-blue-back.png",
      },
      name: "Navy Blue",
    },
    {
      color: "#87CEEB",
      previewImages: {
        front: "/preview-images/Sky-Blue.png",
        back: "/preview-images/sky-blue-back.png",
      },
      name: "Sky Blue",
    },
    {
      color: "#FFFFFF",
      previewImages: {
        front: "/preview-images/White.png",
        back: "/preview-images/white-back.png",
      },
      name: "White",
    },
  ];

  const [viewSide, setViewSide] = useState("front");
  const [selectedColor, setSelectedColor] = useState(tshirtColors[0]);
  const [elements, setElements] = useState({
    front: [],
    back: [],
  });
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newText, setNewText] = useState("Type your text");
  const [instructions, setInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false); // State for form visibility
  const [name, setName] = useState(""); // State for name input
  const [phone, setPhone] = useState(""); // State for phone number input
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [fonts, setFonts] = useState([]); // State to store fonts
  const [device, setDevice] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialFontSize, setInitialFontSize] = useState(20);
  const [rotationCenter, setRotationCenter] = useState({ x: 0, y: 0 });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [printArea, setPrintArea] = useState();
  const [printWidth, setPrintWidth] = useState(180);
  const [printHeight, setPrintHeight] = useState(270);
  const [isElementOutOfBounds, setIsElementOutOfBounds] = useState(false);
  const [textStyle, setTextStyle] = useState({
    fontSize: 24,
    color: "#000000",
    fontWeight: "normal",
    fontFamily: "Arial",
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

    const { user, loading } = useContext(AuthContext);

      const inputRefs = useRef({});

  // user fetch
  useEffect(() => {
    if (!loading) {
      const guestCustomerInfo = getGuestCustomerInfo();
      setCustomerEmail(user?.email || guestCustomerInfo.email);
    }
  }, [loading, user]);

  // set print width and height
  useEffect(() => {
    if (device === "mobile") {
      setPrintWidth(105);
      setPrintHeight(162);
    } else {
      setPrintWidth(180);
      setPrintHeight(270);
    }
  }, [device]);

  // fonts fetch
  useEffect(() => {
    // Fetch fonts from Google Fonts API
    const fetchFonts = async () => {
      try {
        const response = await fetch(
          "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAM0LG9pK8MEj86465G-u2_f0ds_5kc4iU"
        );
        const data = await response.json();
        setFonts(data.items); // Set fonts to state
      } catch (error) {
        console.error("Error fetching fonts:", error);
      } finally {
        setIsLoading(false); // Stop loading once fonts are fetched
      }
    };

    fetchFonts(); // Fetch fonts on component mount
  }, []);

  // device decision
  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      if (width <= 600) {
        setDevice("mobile");
        setTextStyle({
          fontSize: 14,
          color: "#000000",
          fontWeight: "normal",
          fontFamily: "Arial",
          rotation: 0,
        });
      } else if (width <= 1024) {
        setDevice("tablet");
      } else {
        setDevice("laptop");
      }
    };

    // Run once when component mounts
    updateDevice();

    // Add event listener
    window.addEventListener("resize", updateDevice);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", updateDevice);
    };
  }, []);

  // set print area
  useEffect(() => {
    const area = {
      left:
        canvasRef.current && viewSide === "front"
          ? canvasRef.current.offsetWidth * 0.27
          : canvasRef.current && viewSide === "back"
          ? canvasRef.current.offsetWidth * 0.27
          : 80,
      top:
        canvasRef.current && viewSide === "front"
          ? canvasRef.current.offsetHeight * 0.25
          : canvasRef.current && viewSide === "back"
          ? canvasRef.current.offsetHeight * 0.2
          : 125,
      right:
        canvasRef.current && viewSide === "front"
          ? canvasRef.current.offsetWidth * 0.71
          : canvasRef.current && viewSide === "back"
          ? canvasRef.current.offsetWidth * 0.71
          : 320,
      bottom:
        canvasRef.current && viewSide === "front"
          ? canvasRef.current.offsetHeight * 0.78
          : canvasRef.current && viewSide === "back"
          ? canvasRef.current.offsetHeight * 0.74
          : 375,
    };

    setPrintArea(area);
  }, [canvasRef, viewSide, device]);

  // compute width/height from text + font
  const computeTextBox = (text, style, device, canvasRef) => {
    const baseFontSize = device === "mobile" ? 14 : 24;
    const fontSize = style.fontSize || baseFontSize;
    const fontWeight = style.fontWeight || "normal";
    const fontStyle = style.fontStyle || "normal";
    const fontFamily = style.fontFamily || "Arial, sans-serif";
    const padding = 8; // inside padding around the text

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

    // measure text width safely
    const textWidth = Math.min(
      printHeight,
      Math.ceil(ctx.measureText(text || " ").width)
    )

    // Line height
    const lineHeight =
      typeof style.lineHeight === "number"
        ? style.lineHeight * fontSize
        : style.lineHeight
        ? parseFloat(style.lineHeight) * fontSize
        : Math.round(fontSize * 1.2);

    const width = textWidth;
    const height = lineHeight;

    return { width, height, fontSize };
  };

  // is element out of bound
  const isElementInBounds = (item, printArea) => {
    const element = elements[viewSide].find((el) => el.id === item);

    if (element.style?.rotation === 0 || !element.style?.rotation) {
      // Simple case - no rotation
      return (
        element.x >= printArea.left &&
        element.y >= printArea.top &&
        element.x + element.width <= printArea.right &&
        element.y + element.height <= printArea.bottom
      );
    }

    // For rotated elements, calculate the four corners after rotation
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const halfWidth = element.width / 2;
    const halfHeight = element.height / 2;
    const radians = (element.style.rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    // Calculate rotated corner positions
    const corners = [
      // Top-left corner
      {
        x: centerX + (-halfWidth * cos - -halfHeight * sin),
        y: centerY + (-halfWidth * sin + -halfHeight * cos),
      },
      // Top-right corner
      {
        x: centerX + (halfWidth * cos - -halfHeight * sin),
        y: centerY + (halfWidth * sin + -halfHeight * cos),
      },
      // Bottom-right corner
      {
        x: centerX + (halfWidth * cos - halfHeight * sin),
        y: centerY + (halfWidth * sin + halfHeight * cos),
      },
      // Bottom-left corner
      {
        x: centerX + (-halfWidth * cos - halfHeight * sin),
        y: centerY + (-halfWidth * sin + halfHeight * cos),
      },
    ];

    // Check if all corners are within the print area bounds
    return corners.every(
      (corner) =>
        corner.x >= printArea.left &&
        corner.x <= printArea.right &&
        corner.y >= printArea.top &&
        corner.y <= printArea.bottom
    );
  };

  // handle move
  // handle end
  // handle move
  const handleMove = (e, element) => {
    const elm = elements[viewSide]?.find((item) => item.id === element);
    if (!draggedElement && !isResizing && !isRotating) return;

    // Check if element is outside print area
    const isOutsidePrintArea =
      elm.x + elm.width < printArea.left ||
      elm.x > printArea.right ||
      elm.y + elm.height < printArea.top ||
      elm.y > printArea.bottom;

    // Check if element is partially outside print area
    const isPartiallyOutside =
      elm.x < printArea.left ||
      elm.y < printArea.top ||
      elm.x + elm.width > printArea.right ||
      elm.y + elm.height > printArea.bottom;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = parseInt(
      e.clientX - rect.left || e.touches?.[0]?.clientX - rect.left
    );

    const y = parseInt(
      e.clientY - rect.top || e.touches?.[0]?.clientY - rect.top
    );

    const maxWidth = device === "mobile" ? 240 : 400;
    const maxHeight = device === "mobile" ? 300 : 500;

    if (draggedElement && !isResizing && !isRotating) {
      // Existing drag logic
      setElements((prevState) => ({
        ...prevState,
        [viewSide]: prevState[viewSide].map((el) =>
          el.id === draggedElement
            ? {
                ...el,
                x: parseInt(
                  Math.max(0, Math.min(maxWidth - el.width, x - dragOffset.x))
                ),
                y: parseInt(
                  Math.max(0, Math.min(maxHeight - el.height, y - dragOffset.y))
                ),
                // opacity: isOutsidePrintArea
                //   ? "isOutsidePrintArea"
                //   : isPartiallyOutside
                //   ? "isPartiallyOutside"
                //   : "isInside",
              }
            : el
        ),
      }));
    } else if (isResizing) {
      const element = elements[viewSide].find(
        (el) => el.id === selectedElement
      );

      if (!element) return;

      const rotation = element.style?.rotation || 0;
      let deltaX = x - dragOffset.x;
      let deltaY = y - dragOffset.y;

      if (rotation != 0) {
        const radians = (-rotation * Math.PI) / 180; // Negative because we want to inverse the rotation
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        // Transform delta to element's local coordinates
        const transformedDeltaX = deltaX * cos - deltaY * sin;
        const transformedDeltaY = deltaX * sin + deltaY * cos;

        deltaX = transformedDeltaX;
        deltaY = transformedDeltaY;
      }

      const delta = Math.max(deltaX, deltaY);

      let newWidth = parseInt(
        Math.min(printWidth, Math.max(20, initialSize.width + delta))
      );
      let newHeight = parseInt(
        Math.min(printHeight, initialSize.height + delta)
      );

      // Maintain aspect ratio for images
      if (
        element &&
        element.type === "image" &&
        element.originalWidth &&
        element.originalHeight
      ) {
        const aspectRatio = element.originalWidth / element.originalHeight;
        newHeight = newWidth / aspectRatio;

        updateElement(selectedElement, {
          width: newWidth,
          height: newHeight,
          // opacity: isOutsidePrintArea
          //   ? "isOutsidePrintArea"
          //   : isPartiallyOutside
          //   ? "isPartiallyOutside"
          //   : "isInside",
        });
      } 
      
      else if (element && element.type === "text") {
        // Avoid parseInt on floats; use Math.round for pixel ints
        const nextWidth = Math.max(20, Math.round(newWidth));
        const nextHeight = Math.max(5, Math.round(newHeight));

        // console.log(initialSize);
        // Use uniform scale to prevent distortion (use the larger axis)
        const scaleX = nextWidth / Math.max(1, initialSize.width);
        const scaleY = nextHeight / Math.max(1, initialSize.height);
        const scale = Math.max(scaleX, scaleY);

        const initialFS = Number(initialFontSize) || 14;

        // console.log(initialFS * scale,'okk');
        // Clamp font size to sane bounds
        const newFontSize = Math.max(
          8,
          Math.min(400, Math.round(initialFS * scale))
        );

        const style = element.style || {};

        // Simple calculation: font size + padding
        const padding = 8;
        const adjustedHeight = Math.max(5, Math.round(newFontSize));

        updateElement(selectedElement, {
          width: nextWidth,
          height: adjustedHeight,
          // opacity: isOutsidePrintArea
          //   ? "isOutsidePrintArea"
          //   : isPartiallyOutside
          //   ? "isPartiallyOutside"
          //   : "isInside",
          style: {
            ...style,
            fontSize: newFontSize,
          },
        });
      }
    } else if (isRotating) {
      const angle =
        Math.atan2(y - rotationCenter.y, x - rotationCenter.x) *
        (180 / Math.PI);

      const element = elements[viewSide].find(
        (el) => el.id === selectedElement
      );

      updateElement(selectedElement, {
        style: {
          ...element.style,
          rotation: Math.round(angle),
        },
      });
    }

    const checkElementBoundary = isElementInBounds(element, printArea);
    setIsElementOutOfBounds(!checkElementBoundary);
  };

  const handleEnd = () => {
    setDraggedElement(null);
    setIsResizing(false);
    setIsRotating(false);
  };

  // touch start
  // touch move
  // touch end
  const handleTouchStart = (e, element) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    handleMouseDownEnhanced(mouseEvent, element);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    handleMouseMove(mouseEvent);
  };

  const handleTouchEnd = () => {
    handleMouseUpEnhanced();
  };

  // Mouse event handlers
  // Mouse event handlers
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
    const x = parseInt(e.clientX - rect.left);
    const y = parseInt(e.clientY - rect.top);

    setElements((prevState) => ({
      ...prevState,
      [viewSide]: prevState[viewSide].map((el) =>
        el.id === draggedElement
          ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
          : el
      ),
    }));
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
  };

  // Add image element
  // Add image element
  // Add text element font size width and height
  const addImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let newWidth = parseInt(img.width);
        let newHeight = parseInt(img.height);

        if (img.width > img.height) {
          newWidth =
            device === "mobile"
              ? Math.min(img.width, 100)
              : Math.min(img.width, 200);
          newHeight = (newWidth / img.width) * img.height;
        } else {
          newHeight =
            device === "mobile"
              ? Math.min(img.height, 100)
              : Math.min(img.height, 200);
          newWidth = (newHeight / img.height) * img.width;
        }

        const newElement = {
          id: Date.now(),
          type: "image",
          content: e.target.result,
          x: device === "mobile" ? 90 : 150,
          y: device === "mobile" ? 120 : 200,
          width: newWidth,
          height: newHeight,
          // opacity: "isInside",
          originalWidth: parseInt(img.width),
          originalHeight: parseInt(img.height),
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

  const addTextFont = () => {
    if (!newText.trim()) return;

    // derive box size from font settings
    const { width, height, fontSize } = computeTextBox(
      newText,
      textStyle,
      device,
      canvasRef // pass your ref if you have it
    );

    const newElement = {
      id: Date.now(),
      type: "text",
      content: newText,
      x: device === "mobile" ? 90 : 150,
      y: device === "mobile" ? 120 : 200,
      width, // <- follows font size & text length
      height, // <- follows font size (line-height)
      // opacity: "isInside",
      style: { ...textStyle, fontSize }, // keep final fontSize used
    };

    setElements((prev) => ({
      ...prev,
      [viewSide]: [...prev[viewSide], newElement],
    }));
    setSelectedElement(newElement.id);
  };

  useEffect(() => {
    setTimeout(() => {
      const input = inputRefs.current[selectedElement];
      if (input) {
        // input.blink()
        input.click(); // Simulate click
        input.focus(); // Then focus the input
      }
    }, 300); // Delay in milliseconds
  }, [selectedElement]);

  // element operations
  // element operations
  // element operations
  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // resize
  // rotate
  const handleResizeStart = (e, element) => {
    e.stopPropagation();
    setIsResizing(true);
    setSelectedElement(element.id);
    element.type === "text" && setInitialFontSize(element.style.fontSize);
    // :
    setInitialSize({
      width: parseInt(element.width),
      height: parseInt(element.height),
    });
    const pos = getMousePos(e);
    setDragOffset(pos);
  };

  const handleRotateStart = (e, element) => {
    e.stopPropagation();
    setIsRotating(true);
    setSelectedElement(element.id);
    const elementCenter = {
      x: element.x + element.width / 2,
      y: element.y + element.height / 2,
    };
    setRotationCenter(elementCenter);
  };

  // Delete element
  const deleteElement = (id) => {
    setElements((prevState) => ({
      ...prevState,
      [viewSide]: prevState[viewSide].filter((el) => el.id !== id),
    }));
    setSelectedElement(null);
  };

  // Update element properties
  const updateElement = (id, updates) => {
    setElements((prevState) => ({
      ...prevState,
      [viewSide]: prevState[viewSide].map((el) => {
        if (el.id !== id) return el;

        // If updating text or font size → auto adjust width/height
        if (
          el.type === "text" &&
          (updates.content != null || updates.style?.fontSize != null)
        ) {
          const style = { ...el.style, ...(updates.style || {}) };
          const text = updates.content ?? el.content;
          const { width, height } = computeTextBox(text, style);
          return { ...el, ...updates, width, height, style };
        }

        return { ...el, ...updates };
      }),
    }));
  };

  // element start
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

  // element click
  const handleElementClick = (element, e) => {
    e.stopPropagation();
    setSelectedElement(element.id);
  };

  // reset element
  const handleReset = (id) => {
    // Find the element by id in the current view side (front or back)
    const elementToReset = elements[viewSide].find((el) => el.id === id);

    if (elementToReset) {
      // Calculate new dimensions while maintaining aspect ratio
      let newWidth, newHeight;

      if (elementToReset.type === "image") {
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
          elementToReset.type === "image" ? newWidth : elementToReset.width,
        height:
          elementToReset.type === "image" ? newHeight : elementToReset.height,
        style:
          elementToReset.type === "text"
            ? { ...textStyle } // Reset to default text style
            : { ...imgStyle }, // Reset to default image style
      };

      // Update state with the reset element
      setElements((prevState) => ({
        ...prevState,
        [viewSide]: prevState[viewSide].map((el) =>
          el.id === id ? resetElement : el
        ),
      }));
    }
  };

  // HANDLE CANVAS CLICKS
  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  // preview related operations
  // preview related operations
  // preview related operations
  const generatePreviews = async () => {
    setIsLoading(true);
    try {
      const backCanvas = await generatePreview("back");
      const backImageUrl = backCanvas.toDataURL("image/jpeg", 0.8);

      const frontCanvas = await generatePreview("front");
      const frontImageUrl = frontCanvas.toDataURL("image/jpeg", 0.8);

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
      toast.error("Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = async (side) => {
    const canvas = document.createElement("canvas");
    canvas.width = device === "mobile" ? 240 : 400;
    canvas.height = device === "mobile" ? 300 : 500;
    const ctx = canvas.getContext("2d");

    try {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        bgImg.onerror = () => {
          ctx.fillStyle = selectedColor.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle =
            selectedColor.color === "#FFFFFF"
              ? "#E5E7EB"
              : "rgba(255,255,255,0.2)";
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
          resolve();
        };

        setTimeout(() => {
          reject(new Error("Image loading timeout"));
        }, 5000);

        bgImg.src = selectedColor.previewImages[side];
      });

      for (const element of elements[`${side}`]) {
        if (!isElementOutOfBounds) {
          ctx.save();
          ctx.translate(
            element.x + element.width / 2,
            element.y + element.height / 2
          );
          ctx.rotate((element.style.rotation * Math.PI) / 180);
          ctx.translate(
            -element.x - element.width / 2,
            -element.y - element.height / 2
          );

          if (element.type === "text") {
            ctx.font = `${element.style.fontWeight} ${element.style.fontSize}px ${element.style.fontFamily}`;
            ctx.fillStyle = element.style.color;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(element.content, element.x, element.y);
          } else if (element.type === "image") {
            const img = new Image();
            img.crossOrigin = "anonymous";

            await new Promise((resolve) => {
              img.onload = () => {
                ctx.drawImage(
                  img,
                  element.x,
                  element.y,
                  element.width,
                  element.height
                );
                resolve();
              };
              img.onerror = () => {
                console.warn("Design image failed to load");
                resolve();
              };
              img.src = element.content;
            });
          }
          ctx.restore();
        }
      }

      return canvas;
    } catch (error) {
      console.error("Error creating preview:", error);
      throw error;
    }
  };

  const downloadDesign = () => {
    if (!previewCanvases.front && !previewCanvases.back) return;

    const downloadCanvas = (canvas, side) => {
      canvas.toBlob(
        (blob) => {
          const link = document.createElement("a");
          link.download = `tshirt-design-${selectedColor.name.toLowerCase()}-${side}-${Date.now()}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        },
        "image/png",
        1.0
      );
    };

    downloadCanvas(previewCanvases.front, "front");
    downloadCanvas(previewCanvases.back, "back");
    setIsPreviewOpen(false);
    toast.success("Design downloaded successfully");
  };

  const sendRequest = async () => {
    setIsFormOpen(true);
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
        fd.append('address', address);
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

  const panelStyle = "bg-white rounded-xl shadow-lg border border-gray-200 p-6";
  const headingTitle =
    "flex items-center gap-3 text-lg font-semibold text-black mb-6";
  const buttonStyle =
    "w-full px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black";
  const sectionTitle =
    "text-sm font-medium text-gray-800 mb-3 flex items-center gap-2";
  const inputStyle =
    "w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-400";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <TopElements />
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
          {/* <LeftPanelTools
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
            inputStyle={inputStyle}
          /> */}

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
            tshirtColors={tshirtColors}
            setSelectedColor={setSelectedColor}
            addText={addTextFont}
            newText={newText}
            buttonStyle={buttonStyle}
            fileInputRef={fileInputRef}
            addImage={addImage}
            sectionTitle={sectionTitle}
            ///new
            updateElement={updateElement}
            deleteElement={deleteElement}
            handleResizeStart={handleResizeStart}
            handleRotateStart={handleRotateStart}
            handleElementClick={handleElementClick}
            handleCanvasClick={handleCanvasClick}
            isResizing={isResizing}
            isRotating={isRotating}
            draggedElement={draggedElement}
            inputStyle={inputStyle}
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}
            setSelectedElement={setSelectedElement}
            //print
            printArea={printArea}
            isElementOutOfBounds={isElementOutOfBounds}
            printHeight={printHeight}
            printWidth={printWidth}
            inputRefs={inputRefs}
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
            inputStyle={inputStyle}
            isDrawerOpen={isDrawerOpen}
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

              <div className="p-6 grid grid-cols-2  gap-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Front View
                  </h3>
                  <img
                    src={previewImages.front}
                    alt="Front Design Preview"
                    className="w-48 md:w-64 h-auto rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Back View
                  </h3>
                  <img
                    src={previewImages.back}
                    alt="Back Design Preview"
                    className="w-48 md:w-64 h-auto rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 flex flex-col sm:flex-row justify-end gap-3">
                {/* Cancel button */}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto"
                >
                  Cancel
                </button>

                {/* Download button */}
                <button
                  onClick={downloadDesign}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 w-full sm:w-auto"
                >
                  <Download size={18} />
                  Download Design
                </button>

                {/* Request Print button */}
                <button
                  onClick={sendRequest}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-white transition-colors duration-200 flex items-center gap-2 w-full sm:w-auto ${
                    isLoading
                      ? "bg-orange-400"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {isLoading ? (
                    "Processing..."
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

              {/* details  */}
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
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your Address"
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* size and quantity */}

              {/* Size Selection */}
              <section className="mb-6">
                <h3 className={sectionTitle}>
                  <Layers size={18} className="text-black" />
                  Size
                </h3>
                <div className="grid grid-cols-5 gap-2.5">
                  {["S", "M", "L", "XL", "2XL", "3XL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all 
          ${
            selectedSize === size
              ? "border-black bg-gray-900 text-white shadow-md"
              : "border-gray-300 hover:border-gray-400 bg-white text-gray-700"
          }`}
                      aria-label={`Select ${size} size`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>

              {/* Quantity Selection */}
              <section className="mb-6">
                <h3 className={sectionTitle}>
                  <Layers size={18} className="text-black" />
                  Quantity
                </h3>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className={`${inputStyle} w-24`}
                  aria-label="Select quantity"
                />
              </section>

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
                      ? "bg-orange-400"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {isLoading ? "Submitting..." : "Submit"}
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
