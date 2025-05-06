import React, { useState } from 'react';
import { Box, Typography, Container, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      question: "What is the difference between pure silk and artificial silk?",
      answer: "Pure silk is made from natural silk fibers produced by silkworms, while artificial silk (rayon/viscose) is man-made. Pure silk has a more luxurious feel, better durability, and natural temperature regulation. It also has a distinct sheen and texture that artificial silk cannot replicate."
    },
    {
      question: "How do I care for my silk saree?",
      answer: "Silk sarees should be dry cleaned only. Store them in a cool, dry place away from direct sunlight. Use acid-free tissue paper between folds to prevent creasing. Avoid hanging them for long periods as it may cause stretching. Keep them away from perfumes and deodorants."
    },
    {
      question: "What is the best way to drape a silk saree?",
      answer: "Start by tucking the plain end into your petticoat at the waist. Make pleats (5-7) and tuck them in. Wrap the remaining fabric around your body once. Drape the pallu over your shoulder. For detailed instructions, please refer to our saree draping guide."
    },
    {
      question: "How can I identify authentic silk?",
      answer: "Authentic silk has a natural sheen that changes with light, a slightly rough texture, and a distinct smell when burned. It's also heavier than artificial silk. We provide authenticity certificates with all our pure silk products."
    },
    {
      question: "What occasions are suitable for silk sarees?",
      answer: "Silk sarees are perfect for weddings, festivals, religious ceremonies, and formal events. Different types of silk sarees suit different occasions - Kanjivaram for weddings, Banarasi for celebrations, and lighter silk sarees for daytime events."
    },
    {
      question: "Do you offer customization services?",
      answer: "Yes, we offer customization services for our silk sarees. You can choose specific colors, patterns, and designs. Custom orders typically take 2-3 weeks to complete. Please contact our customer service for more details."
    },
    {
      question: "What is your exchange policy for silk sarees?",
      answer: "We offer a 7-day exchange period for all silk sarees. The item must be unworn, unwashed, and in its original packaging with all tags attached. Custom-made sarees are not eligible for exchange."
    },
    {
      question: "How do I measure for a silk saree?",
      answer: "Standard silk sarees are 5.5 to 6 meters in length. The width varies between 45-48 inches. We recommend checking your height and comfort level when choosing the length. Our size guide provides detailed measurements for different body types."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          Frequently Asked Questions
        </Typography>
        <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
          Find answers to common questions about our silk sarees and services
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{
                '&:before': {
                  display: 'none',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}bh-content`}
                id={`panel${index}bh-header`}
              >
                <Typography variant="h6" color="primary">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default FAQ; 