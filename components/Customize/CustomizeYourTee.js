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
} from '@mui/material';
import { ChromePicker } from 'react-color';
import {
  AddPhotoAlternate,
  TextFields,
  Delete,
  Download,
  ShoppingCart,
  Email,
  Palette,
  CheckCircle,
  Close,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import CustomizeHeader from './CustomizeHeader';
import SnackBar from './SnackBar';
import PreviewColumn from './PreviewColumn';
//, '#000000', '#2b2b2b', '#1a6dff', '#e91e63'
// Product data
const productTypes = [
  {
    id: 'tshirt',
    name: 'T-Shirt',
    baseColorImages: [
      { color: '#000000', previewImage: '/preview-images/Black.png' }, // Black
      { color: '#4CAF50', previewImage: '/preview-images/Green.png' }, // Green
      { color: '#E6E6FA', previewImage: '/preview-images/Levender.png' }, // Lavender
      { color: '#800000', previewImage: '/preview-images/Maroon.png' }, // Maroon
      { color: '#000080', previewImage: '/preview-images/Navy Blue.png' }, // Navy Blue
      { color: '#FF0000', previewImage: '/preview-images/Red.png' }, // Red
      { color: '#87CEEB', previewImage: '/preview-images/Sky Blue.png' }, // Sky Blue
      { color: '#FFFFFF', previewImage: '/preview-images/White.png' }, // White
    ],
  },
];

const placementOptions = {
  tshirt: [
    {
      id: 1,
      label: 'Front (Left Chest)',
      position: { x: '25%', y: '20%', width: '15%' },
    },
    {
      id: 2,
      label: 'Front (Right Chest)',
      position: { x: '75%', y: '20%', width: '15%' },
    },
    {
      id: 3,
      label: 'Front (Center Large)',
      position: { x: '50%', y: '30%', width: '60%' },
    },
    {
      id: 4,
      label: 'Front (Bottom)',
      position: { x: '50%', y: '80%', width: '50%' },
    },
    {
      id: 5,
      label: 'Back (Top)',
      position: { x: '50%', y: '15%', width: '50%' },
    },
    {
      id: 6,
      label: 'Back (Center)',
      position: { x: '50%', y: '50%', width: '60%' },
    },
    {
      id: 7,
      label: 'Back (Bottom)',
      position: { x: '50%', y: '85%', width: '50%' },
    },
  ],
  hoodie: [
    {
      id: 1,
      label: 'Front (Left Chest)',
      position: { x: '25%', y: '25%', width: '15%' },
    },
    {
      id: 2,
      label: 'Front (Right Chest)',
      position: { x: '75%', y: '25%', width: '15%' },
    },
    {
      id: 3,
      label: 'Front (Center Large)',
      position: { x: '50%', y: '35%', width: '55%' },
    },
    {
      id: 4,
      label: 'Front (Pocket)',
      position: { x: '50%', y: '65%', width: '40%' },
    },
    {
      id: 5,
      label: 'Back (Top)',
      position: { x: '50%', y: '20%', width: '50%' },
    },
    {
      id: 6,
      label: 'Back (Center Large)',
      position: { x: '50%', y: '50%', width: '60%' },
    },
    {
      id: 7,
      label: 'Back (Bottom)',
      position: { x: '50%', y: '80%', width: '50%' },
    },
  ],
};

const printSizes = [
  { id: 'A3', size: '11.7 x 16.5 inches' },
  { id: 'A4', size: '8.3 x 11.7 inches' },
  { id: 'A5', size: '5.8 x 8.3 inches' },
  { id: 'A6', size: '4.1 x 5.8 inches' },
  { id: 'A7', size: '2.9 x 4.1 inches' },
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
//   width: '100%',
//   height: '500px',
  backgroundColor: '#f9f9f9',
  border: '1px solid #eee',
  borderRadius: '8px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const DesignElement = styled('div')(({ position }) => ({
  position: 'absolute',
  left: position.x,
  top: position.y,
  width: position.width,
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  wordBreak: 'break-word',
}));

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
    front: null,
    back: null,
  });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Derived values
  const currentPlacementOptions =
    placementOptions[selectedProduct.id] || placementOptions.tshirt;
  const currentDesign = designs[activeTab];
  const hasDesign = designs.front || designs.back;

  // Handlers
  const handleProductChange = (product) => {
    setSelectedProduct(product);
    setProductColor(product.baseColorImages[0].color);
    setProductColorImage(product.baseColorImages[0]);
    // Reset designs when product changes
    setDesigns({ front: null, back: null });
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
        type: 'image',
        content: reader.result,
        size: selectedSize,
        placement: selectedPlacement,
        color: textColor,
      };
      setDesigns((prev) => ({ ...prev, [activeTab]: newDesign }));
      setUploadedImage(reader.result);
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

  const handleRemoveDesign = () => {
    setDesigns((prev) => ({ ...prev, [activeTab]: null }));
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      type: 'text',
      content: textContent,
      font: selectedFont,
      size: selectedSize,
      placement: selectedPlacement,
      color: textColor,
    };
    setDesigns((prev) => ({ ...prev, [activeTab]: newDesign }));
    setTextContent('');
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    try {
      const canvas = canvasRef.current;
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
    } finally {
      setIsLoading(false);
    }
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
    Object.values(designs).forEach((design) => {
      if (!design) return;

      if (design.type === 'text') {
        ctx.font = `24px ${design.font}`;
        ctx.fillStyle = design.color;
        ctx.textAlign = 'center';
        ctx.fillText(design.content, canvas.width / 2, canvas.height / 2);
      } else if (design.type === 'image') {
        const img = new Image();
        img.src = design.content;
        img.onload = () => {
          ctx.drawImage(img, 100, 100, canvas.width - 200, canvas.height - 200);
        };
      }
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
                {/* <IconButton
                  sx={{ width: 40, height: 40, border: '1px dashed #ccc' }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <Palette />
                </IconButton> */}
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

                {currentDesign?.content && (
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <img
                      src={currentDesign.content}
                      alt="Uploaded Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        display: 'block',
                        borderRadius: '4px',
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveDesign}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'error.dark',
                        },
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />
          </Paper>
        </Grid>

        {/* Preview Column */}
        <PreviewColumn
        //   ProductPreviewContainer={ProductPreviewContainer}
          selectedProduct={selectedProduct}
          productColor={productColor}
          productColorImage={productColorImage}
          getHueRotation={getHueRotation}
          getBrightness={getBrightness}
          activeTab={activeTab}
          designs={designs}
          canvasRef={canvasRef}
          isLoading={isLoading}
          handleDownload={handleDownload}
          hasDesign={hasDesign}
          handleRequestQuote={handleRequestQuote}
          DesignElement={DesignElement}
          currentPlacementOptions={currentPlacementOptions}
        ></PreviewColumn>
      </Grid>

      {/* Snackbar for notifications */}
      <SnackBar snackbar={snackbar} setSnackbar={setSnackbar}></SnackBar>
    </Box>
  );
};

// Helper functions
function getHueRotation(color) {
  // Simple hue rotation based on color - this is a placeholder
  // In a real app, you'd want more sophisticated color manipulation
  if (color === '#000000') return '0deg';
  if (color === '#ffffff') return '0deg';
  return '30deg';
}

function getBrightness(color) {
  // Adjust brightness for dark colors
  if (color === '#000000') return '0.8';
  return '1';
}

export default ApparelDesigner;
