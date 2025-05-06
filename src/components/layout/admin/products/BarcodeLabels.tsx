import React from 'react';
import Barcode from 'react-barcode';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Product } from '../../../../types';

interface BarcodeLabelsProps {
  open: boolean;
  onClose: () => void;
  selectedProducts: Product[];
}

export const BarcodeLabels: React.FC<BarcodeLabelsProps> = ({ open, onClose, selectedProducts }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Print Barcode Labels</DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2, 
          p: 2,
          '@media print': {
            '& > *': {
              width: '2in',
              height: '1in',
              margin: '0.1in',
              pageBreakInside: 'avoid',
              border: '1px dashed #ccc',
              padding: '0.1in',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            },
            '&': {
              padding: '0.5in',
            }
          }
        }}>
          {selectedProducts.map((product) => (
            <Box key={product.id} sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '2in',
              height: '1in',
              border: '1px dashed #ccc',
              padding: '0.1in'
              
            }}>
              <Box sx={{ 
                width: '75%', 
                
                display: 'flex',
                justifyContent: 'center',
                '& svg': {
                  width: '100%',
                  height: 'auto',
                }
              }}>
                <Barcode
                  value={product.sku ?? product.id ?? ''}
                 
                  width={1.5}
                  height={40}
                  fontSize={8}
                  margin={0}
                  displayValue={false}
                  background="white"
                  lineColor="black"
                  format="CODE128"
                  renderer="svg"
                />
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '8px',
                  textAlign: 'center',
                 
                }}
              >
                {product.sku ?? product.id ?? 'N/A'}
              </Typography>
              <Box sx={{ 
                width: '50%', 
                textAlign: 'center',
                
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '8px',
                    fontWeight: 'bold',
                    display: 'block'
                  }}
                >
                  ₹{product.price.toLocaleString()}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '7px',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {product.name}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handlePrint} variant="contained" color="primary">
          Print Labels
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 