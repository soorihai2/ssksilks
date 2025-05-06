import React from 'react'
import { Fab, Zoom, useScrollTrigger, Box } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

interface ScrollTopProps {
  children: React.ReactElement
}

function ScrollTop(props: ScrollTopProps) {
  const { children } = props
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  })

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor')

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  )
}

const ScrollToTop: React.FC = () => {
  return (
    <ScrollTop>
      <Fab
        color="primary"
        size="small"
        aria-label="scroll back to top"
        sx={{
          bgcolor: '#E31C79',
          '&:hover': {
            bgcolor: '#C41869'
          }
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </ScrollTop>
  )
}

export default ScrollToTop 