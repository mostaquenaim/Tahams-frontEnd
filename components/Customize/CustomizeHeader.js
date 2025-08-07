import { Typography } from '@mui/material';
import React from 'react';

const CustomizeHeader = () => {
  return (
    <Typography
      variant="h3"
      gutterBottom
      sx={{
        fontWeight: 'bold',
        mb: 4,
        color: 'primary.main',
        fontSize: { xs: '1.8rem', md: '2.4rem' },
      }}
    >
      Custom Apparel Designer
    </Typography>
  );
};

export default CustomizeHeader;
