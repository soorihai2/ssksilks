import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface WebsiteLaunchPopupProps {
  open: boolean;
  onClose: () => void;
}

const Fireworks: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 2000,
    }}>
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <div className="firework"></div>
      <style>
        {`
          .firework,
          .firework::before,
          .firework::after {
            --initialSize: 0.5vmin;
            --finalSize: 45vmin;
            --particleSize: 0.2vmin;
            --color1: yellow;
            --color2: khaki;
            --color3: white;
            --color4: lime;
            --color5: gold;
            --color6: mediumseagreen;
            --y: -30vmin;
            --x: -50%;
            --initialY: 60vmin;
            content: "";
            animation: firework 2s infinite;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, var(--y));
            width: var(--initialSize);
            aspect-ratio: 1;
            background: 
              radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 50% 0%,
              radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 50%,
              radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 50% 100%,
              radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 0% 50%,
              radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 80% 90%,
              radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 95% 90%,
              radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 90% 70%,
              radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 60%,
              radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 55% 80%,
              radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 70% 77%,
              radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 22% 90%,
              radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 45% 90%,
              radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 33% 70%,
              radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 10% 60%,
              radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 31% 80%,
              radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 28% 77%,
              radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 13% 72%;
            background-size: var(--initialSize) var(--initialSize);
            background-repeat: no-repeat;
          }

          .firework::before {
            --x: -50%;
            --y: -50%;
            --initialY: -50%;
            transform: translate(-50%, -50%) rotate(40deg) scale(1.3) rotateY(40deg);
          }

          .firework::after {
            --x: -50%;
            --y: -50%;
            --initialY: -50%;
            transform: translate(-50%, -50%) rotate(170deg) scale(1.15) rotateY(-30deg);
          }

          .firework:nth-child(2) {
            --x: 30vmin;
          }

          .firework:nth-child(2),
          .firework:nth-child(2)::before,
          .firework:nth-child(2)::after {
            --color1: pink;
            --color2: violet;
            --color3: fuchsia;
            --color4: orchid;
            --color5: plum;
            --color6: lavender;  
            --finalSize: 40vmin;
            left: 30%;
            top: 60%;
            animation-delay: -0.25s;
          }

          .firework:nth-child(3) {
            --x: -30vmin;
            --y: -50vmin;
          }

          .firework:nth-child(3),
          .firework:nth-child(3)::before,
          .firework:nth-child(3)::after {
            --color1: cyan;
            --color2: lightcyan;
            --color3: lightblue;
            --color4: PaleTurquoise;
            --color5: SkyBlue;
            --color6: lavender;
            --finalSize: 35vmin;
            left: 70%;
            top: 60%;
            animation-delay: -0.4s;
          }

          .firework:nth-child(4),
          .firework:nth-child(4)::before,
          .firework:nth-child(4)::after {
            --color1: #ff0000;
            --color2: #ff3333;
            --color3: #ff6666;
            --color4: #ff9999;
            --color5: #ffcccc;
            --color6: #ffffff;
            --finalSize: 42vmin;
            left: 45%;
            top: 45%;
            animation-delay: -0.6s;
          }

          .firework:nth-child(5),
          .firework:nth-child(5)::before,
          .firework:nth-child(5)::after {
            --color1: #00ff00;
            --color2: #33ff33;
            --color3: #66ff66;
            --color4: #99ff99;
            --color5: #ccffcc;
            --color6: #ffffff;
            --finalSize: 38vmin;
            left: 55%;
            top: 55%;
            animation-delay: -0.8s;
          }

          .firework:nth-child(6),
          .firework:nth-child(6)::before,
          .firework:nth-child(6)::after {
            --color1: #ff00ff;
            --color2: #ff33ff;
            --color3: #ff66ff;
            --color4: #ff99ff;
            --color5: #ffccff;
            --color6: #ffffff;
            --finalSize: 40vmin;
            left: 25%;
            top: 45%;
            animation-delay: -1s;
          }

          .firework:nth-child(7),
          .firework:nth-child(7)::before,
          .firework:nth-child(7)::after {
            --color1: #ffff00;
            --color2: #ffff33;
            --color3: #ffff66;
            --color4: #ffff99;
            --color5: #ffffcc;
            --color6: #ffffff;
            --finalSize: 36vmin;
            left: 75%;
            top: 45%;
            animation-delay: -1.2s;
          }

          .firework:nth-child(8),
          .firework:nth-child(8)::before,
          .firework:nth-child(8)::after {
            --color1: #00ffff;
            --color2: #33ffff;
            --color3: #66ffff;
            --color4: #99ffff;
            --color5: #ccffff;
            --color6: #ffffff;
            --finalSize: 44vmin;
            left: 35%;
            top: 65%;
            animation-delay: -1.4s;
          }

          .firework:nth-child(9),
          .firework:nth-child(9)::before,
          .firework:nth-child(9)::after {
            --color1: #ff8000;
            --color2: #ff9933;
            --color3: #ffb266;
            --color4: #ffcc99;
            --color5: #ffe5cc;
            --color6: #ffffff;
            --finalSize: 39vmin;
            left: 65%;
            top: 35%;
            animation-delay: -1.6s;
          }

          .firework:nth-child(10),
          .firework:nth-child(10)::before,
          .firework:nth-child(10)::after {
            --color1: #8000ff;
            --color2: #9933ff;
            --color3: #b266ff;
            --color4: #cc99ff;
            --color5: #e5ccff;
            --color6: #ffffff;
            --finalSize: 41vmin;
            left: 50%;
            top: 50%;
            animation-delay: -1.8s;
          }

          @keyframes firework {
            0% { transform: translate(var(--x), var(--initialY)); width: var(--initialSize); opacity: 1; }
            50% { width: 0.5vmin; opacity: 1; }
            100% { width: var(--finalSize); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

const WebsiteLaunchPopup: React.FC<WebsiteLaunchPopupProps> = ({ open, onClose }) => {
  const theme = useTheme();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="website-launch-modal"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        outline: 'none',
        '&:focus': {
          outline: 'none'
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1301 }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: '90vw', sm: '80vw', md: '70vw', lg: '60vw' },
            maxWidth: '100vh',
            maxHeight: { xs: '90vh', sm: '80vh', md: '75vh' },
            margin: 'auto',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            outline: 'none',
            '&:focus': {
              outline: 'none'
            }
          }}
        >
          <Fireworks />
          <Box
            component="img"
            src="/images/launch.jpg"
            alt="Website Launch"
            sx={{
              width: { xs: '100%', sm: '50%' },
              height: { xs: '200px', sm: 'auto' },
              minHeight: { xs: '200px', sm: '100%' },
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              flexShrink: 0
            }}
          />
          <Box
            sx={{
              width: { xs: '100%', sm: '50%' },
              height: { xs: 'auto', sm: '100%' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              padding: { xs: '1.5rem', sm: '2rem' },
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.2)',
              }
            }}
          >
            <Box sx={{ 
              position: 'relative', 
              zIndex: 1, 
              textAlign: 'center', 
              width: '100%',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              <Typography variant="h3" component="h2" gutterBottom sx={{ 
                fontWeight: 'bold', 
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.5rem' },
                color: 'white',
                margin: 0
              }}>
                🎉 Website Launch! 🎉
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ 
                mt: { xs: 1, sm: 2 }, 
                fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                color: 'white',
                margin: 0
              }}>
                Special Launch Offer
              </Typography>
              <Typography variant="h2" sx={{ 
                fontWeight: 'bold', 
                my: { xs: 2, sm: 3 },
                background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                margin: 0
              }}>
                5% OFF
              </Typography>
              <Typography variant="body1" sx={{ 
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
                color: 'white',
                margin: 0,
                px: { xs: 1, sm: 0 }
              }}>
                On all products with automatic discount at checkout
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={onClose}
                sx={{
                  mt: { xs: 1, sm: 2 },
                  color: 'white',
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
                  padding: { xs: '8px 24px', sm: '12px 32px' },
                  borderRadius: '30px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Start Shopping
              </Button>
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Modal>
  );
};

export default WebsiteLaunchPopup; 