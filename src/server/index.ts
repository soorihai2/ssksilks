import * as express from 'express';
import * as path from 'path';
import * as cors from 'cors';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/newsletter', (req: any, res: any) => {
  // Newsletter route implementation
  res.json({ message: 'Newsletter API is working' });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 