import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const TermsAndConditions: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          Terms and Conditions
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using this website, you accept and agree to be bound by the terms and conditions of this agreement.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            2. Use License
          </Typography>
          <Typography variant="body1" paragraph>
            Permission is granted to temporarily download one copy of the materials (information or software) on Sree Sathyabhama Silks's website for personal, non-commercial transitory viewing only.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            3. Disclaimer
          </Typography>
          <Typography variant="body1" paragraph>
            The materials on Sree Sathyabhama Silks's website are provided on an 'as is' basis. Sree Sathyabhama Silks makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            4. Limitations
          </Typography>
          <Typography variant="body1" paragraph>
            In no event shall Sree Sathyabhama Silks or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Sree Sathyabhama Silks's website.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            5. Accuracy of Materials
          </Typography>
          <Typography variant="body1" paragraph>
            The materials appearing on Sree Sathyabhama Silks's website could include technical, typographical, or photographic errors. Sree Sathyabhama Silks does not warrant that any of the materials on its website are accurate, complete, or current.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            6. Links
          </Typography>
          <Typography variant="body1" paragraph>
            Sree Sathyabhama Silks has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Sree Sathyabhama Silks of the site.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            7. Modifications
          </Typography>
          <Typography variant="body1" paragraph>
            Sree Sathyabhama Silks may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
          </Typography>

          <Typography variant="h5" gutterBottom color="primary">
            8. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsAndConditions; 