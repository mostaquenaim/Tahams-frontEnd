import { Download, ShoppingCart } from '@mui/icons-material';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { ProductPreviewContainer } from './CustomizeYourTee';
import ResizableBox from './ReactResizableBox';

const BoundedDraggable = ({ boundsRef, children, ...props }) => {
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });
  const nodeRef = useRef(null);

  useEffect(() => {
    if (boundsRef.current && nodeRef.current) {
      const containerRect = boundsRef.current.getBoundingClientRect();
      const elementRect = nodeRef.current.getBoundingClientRect();

      setBounds({
        left: -elementRect.left + containerRect.left,
        top: -elementRect.top + containerRect.top,
        right: containerRect.width - elementRect.width,
        bottom: containerRect.height - elementRect.height,
      });
    }
  }, [boundsRef]);

  return (
    <Draggable nodeRef={nodeRef} bounds={bounds} {...props}>
      <div ref={nodeRef}>{children}</div>
    </Draggable>
  );
};

const PreviewColumn = ({
  selectedProduct,
  productColor,
  productColorImage,
  activeTab,
  designs,
  canvasRef,
  isLoading,
  handleDownload,
  hasDesign,
  handleRequestQuote,
  currentPlacementOptions,
}) => {
  const containerRef = useRef(null);

  const DesignElement = ({ position, children }) => (
    <div
      style={{
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
      }}
    >
      {children}
    </div>
  );

  return (
    <Grid item xs={12} md={7}>
      <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Design Preview
        </Typography>

        <ProductPreviewContainer ref={containerRef}>
          {productColorImage?.previewImage ? (
            <img
              src={productColorImage.previewImage}
              alt={`${productColorImage.name} Preview`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 0px 25px rgba(0, 0, 0, 0.7))',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: productColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {productColorImage?.name || 'Product'} Preview
              </Typography>
            </Box>
          )}

          {/* Front Design */}
          {activeTab === 'front' && designs.front && (
            <DesignElement
              position={
                currentPlacementOptions.find(
                  (p) => p.id === designs.front.placement,
                )?.position || { x: '50%', y: '50%', width: '50%' }
              }
            >
              <BoundedDraggable boundsRef={containerRef}>
                <ResizableBox>
                  {designs.front.type === 'text' ? (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        borderRadius: '4px',
                        p: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: designs.front.font,
                          color: designs.front.color,
                          fontSize: '1.5rem',
                          textAlign: 'center',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                        }}
                      >
                        {designs.front.content}
                      </Typography>
                    </Box>
                  ) : (
                    <img
                      src={designs.front.content}
                      alt="Front Design"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                      }}
                    />
                  )}
                </ResizableBox>
              </BoundedDraggable>
            </DesignElement>
          )}

          {/* Back Design */}
          {activeTab === 'back' && designs.back && (
            <DesignElement
              position={
                currentPlacementOptions.find(
                  (p) => p.id === designs.back.placement,
                )?.position || { x: '50%', y: '50%', width: '50%' }
              }
            >
              <BoundedDraggable boundsRef={containerRef}>
                <ResizableBox>
                  {designs.back.type === 'text' ? (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        borderRadius: '4px',
                        p: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: designs.back.font,
                          color: designs.back.color,
                          fontSize: '1.5rem',
                          textAlign: 'center',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                        }}
                      >
                        {designs.back.content}
                      </Typography>
                    </Box>
                  ) : (
                    <img
                      src={designs.back.content}
                      alt="Back Design"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                      }}
                    />
                  )}
                </ResizableBox>
              </BoundedDraggable>
            </DesignElement>
          )}
        </ProductPreviewContainer>

        {/* Hidden canvas for download */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
          width="800"
          height="1000"
        />

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <Download />
            }
            onClick={handleDownload}
            disabled={!hasDesign || isLoading}
            fullWidth
          >
            Download Design
          </Button>
          <Button
            variant="contained"
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <ShoppingCart />
            }
            onClick={handleRequestQuote}
            disabled={!hasDesign || isLoading}
            fullWidth
          >
            Request Quote
          </Button>
        </Box>
      </Paper>
    </Grid>
  );
};

export default PreviewColumn;
