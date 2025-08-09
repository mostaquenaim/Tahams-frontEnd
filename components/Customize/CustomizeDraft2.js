import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Grid,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Slider,
} from '@mui/material';
import { ChromePicker } from 'react-color';
import {
  AddPhotoAlternate,
  TextFields,
  Download,
  ShoppingCart,
  CheckCircle,
  Close,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import CustomizeHeader from './CustomizeHeader';
import SnackBar from './SnackBar';
import PreviewColumn from './PreviewColumn';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Product data (same as before)
const productTypes = [
  {
    id: 'tshirt',
    name: 'T-Shirt',
    baseColorImages: [
      { color: '#000000', previewImage: '/preview-images/Black.png' },
      { color: '#4CAF50', previewImage: '/preview-images/Green.png' },
      { color: '#E6E6FA', previewImage: '/preview-images/Levender.png' },
      { color: '#800000', previewImage: '/preview-images/Maroon.png' },
      { color: '#000080', previewImage: '/preview-images/Navy Blue.png' },
      { color: '#FF0000', previewImage: '/preview-images/Red.png' },
      { color: '#87CEEB', previewImage: '/preview-images/Sky Blue.png' },
      { color: '#FFFFFF', previewImage: '/preview-images/White.png' },
    ],
  },
];

const fonts = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Poppins', value: "'Poppins', sans-serif" },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Courier New', value: "'Courier New', monospace" },
  { name: 'Georgia', value: "'Georgia', serif" },
];

// Styled components
export const ProductPreviewContainer = styled('div')({
  position: 'relative',
  backgroundColor: '#f9f9f9',
  border: '1px solid #eee',
  borderRadius: '8px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const DraggableElement = styled('div')({
  position: 'absolute',
  cursor: 'grab',
  touchAction: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&:active': {
    cursor: 'grabbing',
  },
});

const DeleteButton = styled(IconButton)({
  position: 'absolute',
  top: -10,
  right: -10,
  backgroundColor: 'red',
  color: 'white',
  zIndex: 10,
  '&:hover': {
    backgroundColor: 'darkred',
  },
});

const ColorSwatch = styled(IconButton)(({ color }) => ({
  width: 40,
  height: 40,
  backgroundColor: color,
  border: '1px solid #ccc',
  '&:hover': {
    border: '2px solid #1976d2',
  },
}));

const ApparelDesigner = () => {
  // State management
  const [selectedProduct, setSelectedProduct] = useState(productTypes[0]);
  const [productColor, setProductColor] = useState(
    productTypes[0].baseColorImages[0].color,
  );
  const [productColorImage, setProductColorImage] = useState(
    productTypes[0].baseColorImages[0],
  );
  const [activeTab, setActiveTab] = useState('front');
  const [designType, setDesignType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFont, setSelectedFont] = useState(fonts[1].value);
  const [textColor, setTextColor] = useState('#000000');
  const [selectedPlacement, setSelectedPlacement] = useState(3);
  const [selectedSize, setSelectedSize] = useState('A4');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [designs, setDesigns] = useState({
    front: [],
    back: [],
  });
  const [imgScale, setImgScale] = useState(1);
  const [imgPos, setImgPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointer, setLastPointer] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const designRef = useRef(null);

  // Derived values
  const currentDesigns = designs[activeTab];
  const hasDesign = designs.front.length > 0 || designs.back.length > 0;

  // Handlers for image positioning and dragging
  const onPointerDown = (e, id) => {
    e.preventDefault();
    setIsDragging(true);
    setLastPointer({ x: e.clientX, y: e.clientY });
    setSelectedElement(id);
  };

  const onPointerMove = (e) => {
    if (!isDragging || !lastPointer) return;
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    setImgPos((p) => ({ x: p.x + dx, y: p.y + dy }));
    setLastPointer({ x: e.clientX, y: e.clientY });

    // Update the position of the selected element
    if (selectedElement) {
      setDesigns((prev) => {
        return {
          ...prev,
          [activeTab]: prev[activeTab].map((item) => {
            if (item.id === selectedElement) {
              return {
                ...item,
                position: {
                  ...item.position,
                  x: item.position.x + dx,
                  y: item.position.y + dy,
                },
              };
            }
            return item;
          }),
        };
      });
    }
  };

  const onPointerUp = () => {
    setIsDragging(false);
    setLastPointer(null);
  };

  useEffect(() => {
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    return () => {
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [isDragging, lastPointer, selectedElement]);

  // Handlers
  const handleProductChange = (product) => {
    setSelectedProduct(product);
    setProductColor(product.baseColorImages[0].color);
    setProductColorImage(product.baseColorImages[0]);
    setDesigns({ front: [], back: [] });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setSnackbar({
        open: true,
        message: 'Please upload an image file',
        severity: 'error',
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const newDesign = {
        id: Date.now(),
        type: 'image',
        content: reader.result,
        size: selectedSize,
        placement: selectedPlacement,
        color: textColor,
        scale: 1,
        position: { x: 0, y: 0 },
      };
      setDesigns((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], newDesign],
      }));
      setUploadedImage(reader.result);
      setSelectedElement(newDesign.id);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setSnackbar({
        open: true,
        message: 'Error reading image file',
        severity: 'error',
      });
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDesign = (id) => {
    setDesigns((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((item) => item.id !== id),
    }));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const handleTextSubmit = () => {
    if (!textContent.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter some text',
        severity: 'warning',
      });
      return;
    }

    const newDesign = {
      id: Date.now(),
      type: 'text',
      content: textContent,
      font: selectedFont,
      size: selectedSize,
      placement: selectedPlacement,
      color: textColor,
      scale: 1,
      position: { x: 0, y: 0 },
    };
    setDesigns((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newDesign],
    }));

    setSelectedElement(newDesign.id);
    setTextContent('');
  };

  const handleDownload = async () => {
    if (!productColorImage?.previewImage || !designs[activeTab]) return;

    setIsLoading(true);
    try {
      // Create final canvas
      const canvas = document.createElement('canvas');
      canvas.width = 600; // Set the width for the final image
      canvas.height = 800; // Set the height for the final image
      const ctx = canvas.getContext('2d');

      // Define T-shirt base size and placement
      const TSHIRT_WIDTH = 600;
      const TSHIRT_HEIGHT = 800;
      const TSHIRT_X = (canvas.width - TSHIRT_WIDTH) / 2;
      const TSHIRT_Y = (canvas.height - TSHIRT_HEIGHT) / 2;

      // Load T-shirt base image
      const tshirtImg = new Image();
      tshirtImg.crossOrigin = 'anonymous'; // To avoid CORS issues with external images
      tshirtImg.src = productColorImage.previewImage;

      await new Promise((resolve) => {
        tshirtImg.onload = resolve;
      });

      // Draw T-shirt image onto canvas
      ctx.drawImage(tshirtImg, TSHIRT_X, TSHIRT_Y, TSHIRT_WIDTH, TSHIRT_HEIGHT);

      // Draw designs (text or images) onto the T-shirt
      const currentDesigns = designs[activeTab];
      // console.log(designs[activeTab],'gibgib');
      for (const design of currentDesigns) {
        if (design.type === 'text') {
          ctx.font = `${24 * design.scale}px ${design.font}`;
          ctx.fillStyle = design.color;
          ctx.textAlign = 'center';
          ctx.fillText(
            design.content,
            TSHIRT_X + TSHIRT_WIDTH / 2 + design.position.x,
            TSHIRT_Y + TSHIRT_HEIGHT / 2 + design.position.y,
          );
        } 
        else if (design.type === 'image') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = design.content;

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          // Use consistent base size like text (e.g., 100px base size for images)
          const baseSize = 200;
          const scaledWidth = baseSize * design.scale;
          const scaledHeight =
            ((baseSize * img.height) / img.width) * design.scale; // maintain aspect ratio

          ctx.drawImage(
            img,
            TSHIRT_X + TSHIRT_WIDTH / 2 - scaledWidth / 2 + design.position.x,
            TSHIRT_Y + TSHIRT_HEIGHT / 2 - scaledHeight / 2 + design.position.y,
            scaledWidth,
            scaledHeight,
          );
        }
      }

      // Trigger download
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `custom-${selectedProduct.id}-design.png`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error generating download',
        severity: 'error',
      });
      console.error('Download error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate canvas for a specific side
  const generateDesignCanvas = async (side) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Draw T-shirt base
    const tshirtImg = new Image();
    tshirtImg.src = productColorImage.previewImage;
    await new Promise((resolve) => {
      tshirtImg.onload = resolve;
    });

    ctx.filter = `hue-rotate(${getHueRotation(
      productColor,
    )}) brightness(${getBrightness(productColor)})`;
    ctx.drawImage(tshirtImg, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    // Draw designs
    for (const design of designs[side]) {
      // ... same drawing logic as before ...
    }

    return canvas;
  };

  const handleRequestQuote = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSnackbar({
        open: true,
        message: 'Design submitted successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Submission failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScaleChange = (e, newValue) => {
    setImgScale(newValue);
    if (selectedElement) {
      setDesigns((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((item) => {
          if (item.id === selectedElement) {
            return { ...item, scale: newValue };
          }
          return item;
        }),
      }));
    }
  };

  const handleResetPosition = () => {
    if (selectedElement) {
      setDesigns((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((item) => {
          if (item.id === selectedElement) {
            return {
              ...item,
              position: { x: 0, y: 0 },
              scale: 1,
            };
          }
          return item;
        }),
      }));
      setImgScale(1);
      setImgPos({ x: 0, y: 0 });
    }
  };

  // Render preview to canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw product base
    ctx.fillStyle = productColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw designs
    Object.values(designs).forEach((tabDesigns) => {
      tabDesigns.forEach((design) => {
        if (!design) return;

        if (design.type === 'text') {
          ctx.font = `24px ${design.font}`;
          ctx.fillStyle = design.color;
          ctx.textAlign = 'center';
          ctx.fillText(
            design.content,
            canvas.width / 2 + design.position.x,
            canvas.height / 2 + design.position.y,
          );
        } else if (design.type === 'image') {
          const img = new Image();
          img.src = design.content;
          img.onload = () => {
            ctx.drawImage(
              img,
              canvas.width / 2 - img.width / 2 + design.position.x,
              canvas.height / 2 - img.height / 2 + design.position.y,
              img.width * design.scale,
              img.height * design.scale,
            );
          };
        }
      });
    });
  }, [productColor, designs]);

  return (
    <Box sx={{ maxWidth: 'xl', mx: 'auto', p: { xs: 2, md: 4 } }}>
      <CustomizeHeader></CustomizeHeader>
      <Grid container spacing={3}>
        {/* Controls Column */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            {/* Product Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Product Selection
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                {productTypes.map((product) => (
                  <Chip
                    key={product.id}
                    avatar={
                      <Avatar
                        alt={product.name}
                        src={
                          selectedProduct.id === product.id
                            ? productColor.previewImage
                            : product.baseColorImages[0]?.previewImage
                        }
                      />
                    }
                    label={product.name}
                    onClick={() => handleProductChange(product)}
                    color={
                      selectedProduct.id === product.id ? 'primary' : 'default'
                    }
                    variant={
                      selectedProduct.id === product.id ? 'filled' : 'outlined'
                    }
                    sx={{ height: 'auto', py: 1 }}
                  />
                ))}
              </Box>
            </Box>

            {/* Color Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Product Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {selectedProduct.baseColorImages.map((item) => (
                  <ColorSwatch
                    key={item.color}
                    color={item.color}
                    onClick={() => {
                      setProductColor(item.color);
                      setProductColorImage(item);
                    }}
                    sx={{
                      border:
                        productColor === item.color
                          ? '2px solid #1976d2'
                          : '1px solid #ccc',
                    }}
                  >
                    {productColor === item.color && (
                      <CheckCircle sx={{ color: '#fff', fontSize: 16 }} />
                    )}
                  </ColorSwatch>
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Design Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label="Front Design" value="front" />
              <Tab label="Back Design" value="back" />
            </Tabs>

            {/* Design Type Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Design Type</InputLabel>
              <Select
                value={designType}
                onChange={(e) => setDesignType(e.target.value)}
                label="Design Type"
              >
                <MenuItem value="text">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextFields sx={{ mr: 1 }} /> Text
                  </Box>
                </MenuItem>
                <MenuItem value="image">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AddPhotoAlternate sx={{ mr: 1 }} /> Image
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Design Content */}
            {designType === 'text' ? (
              <>
                <TextField
                  fullWidth
                  label="Your Text"
                  variant="outlined"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  sx={{ mb: 2 }}
                  multiline
                  rows={3}
                />

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>Font Style</InputLabel>
                    <Select
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      label="Font Style"
                    >
                      {fonts.map((f) => (
                        <MenuItem
                          key={f.name}
                          value={f.value}
                          sx={{ fontFamily: f.value }}
                        >
                          {f.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ position: 'relative' }}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      sx={{ height: '56px', minWidth: '120px' }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: textColor,
                          border: '1px solid #ccc',
                          mr: 1,
                        }}
                      />
                      Text Color
                    </Button>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleTextSubmit}
                  disabled={!textContent.trim()}
                  sx={{ mb: 2 }}
                >
                  Apply Text Design
                </Button>
              </>
            ) : (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<AddPhotoAlternate />}
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />
                </Button>
              </Box>
            )}

            {/* Position and Scale Controls */}
            {currentDesigns.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Position & Scale
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Scale</Typography>
                  <Slider
                    value={imgScale}
                    onChange={handleScaleChange}
                    min={0.1}
                    max={3}
                    step={0.1}
                    valueLabelDisplay="auto"
                  />
                </Box>
                <Button
                  variant="outlined"
                  onClick={handleResetPosition}
                  fullWidth
                >
                  Reset Position
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Click and drag elements on the preview to position them
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />
          </Paper>
        </Grid>

        {/* Preview Column */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Preview
            </Typography>
            <ProductPreviewContainer ref={previewRef}>
              <Box
                component="img"
                src={productColorImage.previewImage}
                alt="T-shirt preview"
                sx={{
                  width: '600px',
                  height: '800px', // Ensure the image takes up all the available space
                  objectFit: 'contain', // Make sure the image scales properly without distortion
                  filter: `hue-rotate(${getHueRotation(
                    productColor,
                  )}) brightness(${getBrightness(productColor)})`,
                }}
              />
              {currentDesigns.map((design) => (
                <DraggableElement
                  key={design.id}
                  ref={designRef}
                  onPointerDown={(e) => onPointerDown(e, design.id)}
                  style={{
                    transform: `translate(${design.position.x}px, ${design.position.y}px) scale(${design.scale})`,
                    transition: isDragging ? 'none' : 'transform 0.1s',
                  }}
                >
                  {design.type === 'text' ? (
                    <Typography
                      sx={{
                        fontFamily: design.font,
                        color: design.color,
                        fontSize: '24px',
                        maxWidth: '200px',
                        wordBreak: 'break-word',
                      }}
                    >
                      {design.content}
                    </Typography>
                  ) : (
                    <Box
                      component="img"
                      src={design.content}
                      alt="Design"
                      sx={{
                        width: '100px',
                        maxWidth: '200px',
                        maxHeight: '200px',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                  <DeleteButton
                    size="small"
                    onClick={() => handleRemoveDesign(design.id)}
                  >
                    <Close fontSize="small" />
                  </DeleteButton>
                </DraggableElement>
              ))}
            </ProductPreviewContainer>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownload}
                disabled={!hasDesign || isLoading}
                sx={{ flex: 1 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Download Design'}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ShoppingCart />}
                onClick={handleRequestQuote}
                disabled={!hasDesign || isLoading}
                sx={{ flex: 1 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Request a Quote'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <SnackBar snackbar={snackbar} setSnackbar={setSnackbar}></SnackBar>

      {/* Color Picker Dialog */}
      <Dialog
        open={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        maxWidth="xs"
      >
        <DialogTitle>Select Text Color</DialogTitle>
        <DialogContent>
          <ChromePicker
            color={textColor}
            onChangeComplete={(color) => setTextColor(color.hex)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowColorPicker(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper functions
function getHueRotation(color) {
  if (color === '#000000') return '0deg';
  if (color === '#ffffff') return '0deg';
  return '30deg';
}

function getBrightness(color) {
  if (color === '#000000') return '0.8';
  return '1';
}

export default ApparelDesigner;
