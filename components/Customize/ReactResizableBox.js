import React, { useState } from 'react';
import { ResizableBox as ReactResizableBox } from 'react-resizable';

import 'react-resizable/css/styles.css';

export default function ResizableBox({
  children,
  width = 600,
  height = 300,
  minWidth = 50,
  minHeight = 50,
  maxWidth = 500,
  maxHeight = 500,
  className = '',
  isText = false, // To handle resizing text
}) {
  const [currentWidth, setCurrentWidth] = useState(width);
  const [currentHeight, setCurrentHeight] = useState(height);
  const [currentFontSize, setCurrentFontSize] = useState('1.5rem');

  // Adjust font size for text resizing
  const handleResize = (e, data) => {
    const { width, height } = data.size;

    // If it's text, we change font size
    if (isText) {
      const newFontSize = Math.max(12, (width / 200) * 1.5) + 'px';
      setCurrentFontSize(newFontSize);
    }

    setCurrentWidth(width);
    setCurrentHeight(height);
  };

  return (
    <div style={{ marginLeft: 20 }}>
      <div
        style={{
          display: 'inline-block',
          width: 'auto',
          background: 'transparent',
          padding: '.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 30px 40px rgba(0,0,0,.1)',
        }}
      >
        <ReactResizableBox
          width={currentWidth}
          height={currentHeight}
          minConstraints={[minWidth, minHeight]}
          maxConstraints={[maxWidth, maxHeight]}
          onResize={handleResize}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              fontSize: isText ? currentFontSize : 'inherit', // Resize font size for text
            }}
            className={className}
          >
            {children}
          </div>
        </ReactResizableBox>
      </div>
    </div>
  );
}
