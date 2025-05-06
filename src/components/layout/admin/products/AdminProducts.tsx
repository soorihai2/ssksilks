import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewList as ViewListIcon,
  GridView as GridViewIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ContentCopy as ContentCopyIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { Product } from '../../../../types';
import { ProductCard } from '../../../../components/shared/common/ProductCard';
import Papa from 'papaparse';
import { BarcodeLabels } from './BarcodeLabels';
import { productApi, categoryApi } from '../../../../services/api';
import { toast, ToastOptions } from 'react-toastify';
import { API_BASE_URL, MEDIA_BASE_URL } from '../../../../config';
import axios from 'axios';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface FormDataType {
  sku: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  media: string; // Combined field for both images and videos
  rating: string;
  stock: string;
  trending: boolean;
  featured: boolean;
  material: string;
  work: string;
  length: string;
  origin: string;
}

// Add custom toast options type
interface CustomToastOptions extends ToastOptions {
  id?: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    sku: '',
    name: '',
    description: '',
    price: '',
    categoryId: '',
    media: '', // Combined field
    rating: '',
    stock: '',
    trending: false,
    featured: false,
    material: '',
    work: '',
    length: '',
    origin: '',
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productApi.getAll();
      setProducts(data as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      const productWithVideos = product as Product & { videos?: string[] };
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        categoryId: product.categoryId,
        media: [...(product.images || []), ...(productWithVideos.videos || [])].join('\n'),
        rating: (product.rating || 0).toString(),
        stock: product.stock.toString(),
        trending: product.trending || false,
        featured: product.featured || false,
        material: product.specifications?.material || '',
        work: product.specifications?.work || '',
        length: product.specifications?.length || '',
        origin: product.specifications?.origin || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        sku: '',
        name: '',
        description: '',
        price: '',
        categoryId: '',
        media: '',
        rating: '',
        stock: '',
        trending: false,
        featured: false,
        material: '',
        work: '',
        length: '',
        origin: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.sku) {
        toast.error('Product SKU is required');
        return;
      }

      // Check if SKU already exists (except when editing the same product)
      if (!editingProduct || editingProduct.sku !== formData.sku) {
        try {
          const existingProducts = await productApi.getAll();
          const skuExists = (existingProducts as Product[]).some((p) => p.sku === formData.sku);
          if (skuExists) {
            toast.error('A product with this SKU already exists. Please use a different SKU.');
            return;
          }
        } catch (error) {
          console.error('Error checking SKU:', error);
          return;
        }
      }

      // Process media files
      const mediaFiles = formData.media.split('\n').filter(Boolean);
      const images = mediaFiles.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
      const videos = mediaFiles.filter(file => /\.(mp4|webm)$/i.test(file));

      // Validate and parse rating
      let parsedRating = 0;
      try {
        if (formData.rating && formData.rating !== '') {
          const ratingValue = parseFloat(formData.rating);
          if (isNaN(ratingValue)) {
            toast.error('Invalid rating value. Must be a number between 0 and 5.');
            return;
          }
          if (ratingValue < 0 || ratingValue > 5) {
            toast.error('Rating must be between 0 and 5.');
            return;
          }
          parsedRating = Math.round(ratingValue * 10) / 10;
        }
      } catch (error) {
        console.error('Error processing rating:', error);
        toast.error('Error processing rating value');
        return;
      }

      const productData = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        images: images,
        videos: videos,
        rating: parsedRating,
        stock: parseInt(formData.stock),
        trending: formData.trending,
        featured: formData.featured,
        reviews: editingProduct?.reviews || [],
        specifications: {
          material: formData.material || '',
          work: formData.work || '',
          length: formData.length || '',
          origin: formData.origin || ''
        }
      };

      console.log('Submitting product data:', productData);

      if (editingProduct) {
        if (editingProduct.sku !== formData.sku) {
          // If SKU is changed, delete old product and create new one
          await productApi.delete(editingProduct.id);
          await productApi.create(productData);
          toast.success('Product updated successfully');
        } else {
          // If SKU is same, just update
          await productApi.update(editingProduct.id, productData);
          toast.success('Product updated successfully');
        }
      } else {
        // For new product, create with provided SKU
        await productApi.create(productData);
        toast.success('Product added successfully');
      }

      fetchProducts();
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('Failed to submit product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productApi.delete(id);
        setProducts(products.filter(p => p.id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      // Create a copy of the product with a new SKU
      const duplicatedProduct = {
        ...product,
        id: undefined, // Remove the ID to create a new product
        sku: `${product.sku}-copy`, // Add a suffix to the SKU
        name: `${product.name} (Copy)`, // Add a suffix to the name
      };

      // Create the new product
      const newProduct = await productApi.create(duplicatedProduct) as Product;
      
      // Update the products list
      setProducts([...products, newProduct]);
      
      toast.success('Product duplicated successfully');
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast.error('Failed to duplicate product');
    }
  };

  const getImageUrl = (mediaPath?: string) => {
    if (!mediaPath || mediaPath.trim() === '') {
      console.log('No media path provided, using placeholder');
      return `${MEDIA_BASE_URL}/images/products/placeholder.jpg`;
    }
    
    // If it's already a full URL, return it as is
    if (mediaPath.startsWith('http')) {
      return mediaPath;
    }

    // Determine if it's a video or image
    const isVideo = /\.(mp4|webm)$/i.test(mediaPath);
    const basePath = isVideo ? 'videos' : 'images';
    
    // Clean the path by removing any leading /images/products/ or /videos/products/
    const cleanPath = mediaPath.replace(/^\/[^/]+\/products\//, '');
    
    // Check if we're dealing with timestamp filenames which might be causing issues
    if (/^\d{13,}-\d+\.(jpg|jpeg|png|webp|mp4|webm)$/.test(cleanPath)) {
      // These are the multer-generated filenames
      console.log(`Detected timestamp filename: ${cleanPath}`);
      // Make sure we construct the URL correctly
      return `${MEDIA_BASE_URL}/${basePath}/products/${cleanPath}`;
    }
    
    // For regular filenames, construct the URL properly
    const finalUrl = `${MEDIA_BASE_URL}/${basePath}/products/${cleanPath}`;
    console.log(`Generated media URL: ${finalUrl} from path: ${mediaPath}`);
    return finalUrl;
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Show loading toast
      const loadingToast = toast.loading('Importing products...');
      
      Papa.parse(file, {
        complete: async (results) => {
          try {
            // Log the raw CSV data
            console.log('Raw CSV data:', {
              headers: Object.keys(results.data[0] || {}),
              firstRow: results.data[0],
              totalRows: results.data.length
            });

            // Clean up header names by removing asterisks and trimming
            const cleanHeaders = Object.keys(results.data[0] || {}).map(header => 
              header.replace(/\s*\*\s*$/, '').toLowerCase().trim()
            );
            console.log('Cleaned headers:', cleanHeaders);

            // Map the expected field names to their cleaned versions
            const requiredFields = {
              'sku': ['sku'],
              'product name': ['product name', 'name', 'productname'],
              'price': ['price'],
              'stock quantity': ['stock quantity', 'stock', 'quantity']
            };

            // Check for missing required fields
            const missingFields = [];
            for (const [required, alternatives] of Object.entries(requiredFields)) {
              if (!alternatives.some(alt => cleanHeaders.includes(alt.toLowerCase()))) {
                missingFields.push(required);
              }
            }
            
            if (missingFields.length > 0) {
              throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const products = await Promise.all(results.data.map(async (row: any, index: number) => {
              // Skip empty rows
              if (Object.values(row).every(value => !value)) {
                return null;
              }

              // Log the raw row data
              console.log(`Processing row ${index + 1}:`, row);

              // Get values using case-insensitive header matching
              const getValue = (fieldAlternatives: string[]): string => {
                // Log all headers for debugging
                console.log('Available headers:', Object.keys(row));
                
                const matchingHeader = Object.keys(row).find(header => {
                  const cleanHeader = header.toLowerCase().replace(/\s*\*\s*$/, '').trim();
                  console.log(`Comparing header: "${cleanHeader}" with alternatives:`, fieldAlternatives);
                  return fieldAlternatives.some(alt => 
                    cleanHeader === alt.toLowerCase() ||
                    cleanHeader.includes(alt.toLowerCase())
                  );
                });

                const value = matchingHeader ? row[matchingHeader] : '';
                console.log(`Getting value for ${fieldAlternatives.join(' or ')}:`, {
                  matchingHeader,
                  value,
                  allHeaders: Object.keys(row)
                });
                return value.toString().trim();
              };

              const sku = getValue(['sku', 'SKU']);
              const name = getValue(['product name', 'name', 'Product Name']);
              const price = getValue(['price', 'Price']);
              const stock = getValue(['stock quantity', 'stock', 'Stock Quantity']);
              const description = getValue(['description', 'Description']);
              const category = getValue(['category name', 'category', 'Category Name']);
              const rating = getValue(['rating', 'Rating', 'Rating (0-5)']);
              const trending = getValue(['trending', 'Trending', 'Trending (true/false)']);
              const featured = getValue(['featured', 'Featured', 'Featured (true/false)']);

              console.log('Extracted values:', {
                sku,
                name,
                price,
                stock,
                rating,
                trending,
                featured,
                category
              });

              // Basic validation
              if (!sku) {
                throw new Error(`Row ${index + 1}: Product SKU is required.`);
              }

              // Validate numeric fields
              if (isNaN(parseFloat(price))) {
                throw new Error(`Row ${index + 1}: Invalid price value for SKU ${sku}`);
              }
              if (isNaN(parseInt(stock))) {
                throw new Error(`Row ${index + 1}: Invalid stock value for SKU ${sku}`);
              }

              // Check if SKU already exists
              const existingProducts = await productApi.getAll() as Product[];
              const skuExists = existingProducts.some((p) => p.sku === sku);
              if (skuExists) {
                throw new Error(`Row ${index + 1}: Product SKU "${sku}" already exists.`);
              }

              // Find category by name
              const categoryObj = categories.find(c => c.name.toLowerCase() === category?.toLowerCase());
              if (!categoryObj && category) {
                throw new Error(`Row ${index + 1}: Category "${category}" not found.`);
              }

              // Collect all image columns and clean them
              const images = [];
              for (let i = 1; i <= 4; i++) {
                const imageValue = getValue([`image${i}`, `Additional Image ${i-1}`, `Primary Image`].filter(Boolean));
                if (imageValue) {
                  const filename = imageValue.trim().split(/[\/\\]/).pop() || imageValue.trim();
                  images.push(filename);
                }
              }

              // Validate and parse rating
              let parsedRating = 0;
              try {
                if (rating && rating !== '') {
                  // Convert to string and clean up
                  const cleanedRating = String(rating).trim().toLowerCase();
                  console.log('Processing rating:', { original: rating, cleaned: cleanedRating });
                  
                  // Try to parse the rating
                  const ratingValue = parseFloat(cleanedRating);
                  
                  if (!isNaN(ratingValue)) {
                    if (ratingValue >= 0 && ratingValue <= 5) {
                      parsedRating = Math.round(ratingValue * 10) / 10;
                      console.log('Successfully parsed rating:', parsedRating);
                    } else {
                      console.warn(`Invalid rating range for SKU ${sku}:`, ratingValue);
                      throw new Error(`Row ${index + 1}: Rating value for SKU ${sku} must be between 0 and 5.`);
                    }
                  } else {
                    console.warn(`Failed to parse rating for SKU ${sku}:`, rating);
                    throw new Error(`Row ${index + 1}: Invalid rating value for SKU ${sku}. Must be a number between 0 and 5.`);
                  }
                }
              } catch (error) {
                console.error('Error processing rating:', error);
                throw error;
              }

              // Create the product object
              const productToCreate = {
                sku: sku,
                name: name,
                description: description || '',
                price: parseFloat(price),
                categoryId: categoryObj?.id || '',
                images: images,
                videos: [],
                rating: parsedRating,
                stock: parseInt(stock),
                trending: trending?.toLowerCase() === 'true',
                featured: featured?.toLowerCase() === 'true',
                reviews: [],
                specifications: {
                  material: getValue(['material', 'Material']) || '',
                  work: getValue(['work', 'Work Type']) || '',
                  length: getValue(['length', 'Length']) || '',
                  origin: getValue(['origin', 'Origin']) || ''
                }
              };

              console.log('Creating product with data:', {
                sku: productToCreate.sku,
                name: productToCreate.name,
                rating: productToCreate.rating,
                categoryId: productToCreate.categoryId,
                originalRating: rating,
                category: category,
                categoryObj: categoryObj
              });

              return productToCreate;
            }));

            // Filter out null values (empty rows)
            const validProducts = products.filter(p => p !== null);

            // Create all products
            let successCount = 0;
            let errorCount = 0;
            for (const product of validProducts) {
              try {
                await productApi.create(product);
                successCount++;
              } catch (error) {
                console.error(`Error creating product ${product.sku}:`, error);
                errorCount++;
              }
            }

            // Update UI
            fetchProducts();
            
            // Show result toast
            toast.dismiss(loadingToast);
            if (errorCount === 0) {
              toast.success(`Successfully imported ${successCount} products`);
            } else {
              toast.warning(`Imported ${successCount} products with ${errorCount} errors`);
            }
          } catch (error) {
            console.error('Error importing products:', error);
            toast.dismiss(loadingToast);
            toast.error(error instanceof Error ? error.message : 'Error importing products');
          }
        },
        header: true,
        skipEmptyLines: 'greedy',
        error: (error) => {
          console.error('Error parsing CSV:', error);
          toast.error('Error parsing CSV file. Please check the format.');
        },
      });
    }
    // Clear the input to allow importing the same file again
    event.target.value = '';
  };

  const handleExportCSV = async () => {
    try {
      const loadingToast = toast.loading('Exporting products...');
      
      const products = await productApi.getAll() as Product[];
      
      // Create CSV header with descriptions
      const csvData = products.map((product) => {
        const category = categories.find(c => c.id === product.categoryId);
        
        const row: any = {
          sku: product.sku,
          name: product.name,
          description: product.description,
          price: product.price,
          category: category?.name || '',
          stock: product.stock,
          rating: product.rating,
          trending: product.trending ? 'true' : 'false',
          featured: product.featured ? 'true' : 'false',
          material: product.specifications?.material || '',
          work: product.specifications?.work || '',
          length: product.specifications?.length || '',
          origin: product.specifications?.origin || '',
        };

        // Add images in separate columns
        product.images.forEach((image, index) => {
          row[`image${index + 1}`] = image;
        });

        // Fill remaining image columns with empty strings
        for (let i = product.images.length + 1; i <= 4; i++) {
          row[`image${i}`] = '';
        }

        return row;
      });

      // Add a header row with field descriptions
      const headerDescriptions = {
        sku: 'SKU *',
        name: 'Product Name *',
        description: 'Description',
        price: 'Price *',
        category: 'Category Name',
        stock: 'Stock Quantity *',
        rating: 'Rating (0-5)',
        trending: 'Trending (true/false)',
        featured: 'Featured (true/false)',
        material: 'Material',
        work: 'Work Type',
        length: 'Length',
        origin: 'Origin',
        image1: 'Primary Image',
        image2: 'Additional Image 1',
        image3: 'Additional Image 2',
        image4: 'Additional Image 3'
      };

      // Create CSV with header descriptions
      const csv = Papa.unparse({
        fields: Object.values(headerDescriptions),
        data: csvData
      });

      // Download the file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.setAttribute('href', url);
      link.setAttribute('download', `products-${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss(loadingToast);
      toast.success('Products exported successfully');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Error exporting products');
    }
  };

  const handleCheckboxChange = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleContextMenu = (event: React.MouseEvent, productId: string) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) {
      try {
        await Promise.all(selectedProducts.map(id => productApi.delete(id)));
        setSelectedProducts([]);
        fetchProducts();
        toast.success(`${selectedProducts.length} products deleted successfully`);
      } catch (error) {
        console.error('Error deleting products:', error);
        toast.error('Failed to delete selected products');
      }
    }
    handleCloseContextMenu();
  };

  const handlePrintBarcodes = () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product to print barcodes');
      return;
    }
    setBarcodeDialogOpen(true);
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const toastId = "upload-" + Date.now(); // Create unique toast ID

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      // Show initial loading toast
      toast.loading("Preparing upload...", { id: toastId } as CustomToastOptions);

      const response = await axios.post(
        `${API_BASE_URL}/products/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 600000, // 10 minutes timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            // Update the same toast with progress
            toast.loading(`Uploading: ${percentCompleted}%`, { id: toastId } as CustomToastOptions);
          },
        }
      );

      // Dismiss the loading toast
      toast.dismiss(toastId);

      if (response.data.files) {
        const newMedia = response.data.files.map((file: any) => file.path).join("\n");
        setFormData((prev) => ({
          ...prev,
          media: prev.media ? `${prev.media}\n${newMedia}` : newMedia,
        }));
        toast.success("Media uploaded successfully");
      }
    } catch (error: any) {
      // Dismiss the loading toast
      toast.dismiss(toastId);

      console.error("Error uploading media:", error);
      let errorMessage = "Failed to upload media";
      
      if (error.code === "ECONNABORTED" || error.response?.status === 504) {
        errorMessage = "Upload timed out. Please try again with a smaller file or check your connection.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      // Clear the file input
      event.target.value = "";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontFamily: 'Playfair Display, serif' }}>
          Products Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newValue) => newValue && setViewMode(newValue)}
            size="small"
          >
            <ToggleButton value="grid">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            component="label"
            sx={{
              borderColor: '#E31C79',
              color: '#E31C79',
              '&:hover': {
                borderColor: '#E31C79',
                backgroundColor: 'rgba(227, 28, 121, 0.04)'
              }
            }}
          >
            Import CSV
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleImportCSV}
            />
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            sx={{
              borderColor: '#E31C79',
              color: '#E31C79',
              '&:hover': {
                borderColor: '#E31C79',
                backgroundColor: 'rgba(227, 28, 121, 0.04)'
              }
            }}
          >
            Export CSV
          </Button>
          {selectedProducts.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintBarcodes}
              sx={{
                borderColor: '#E31C79',
                color: '#E31C79',
                '&:hover': {
                  borderColor: '#E31C79',
                  backgroundColor: 'rgba(227, 28, 121, 0.04)'
                }
              }}
            >
              Print Barcodes ({selectedProducts.length})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF4D4D 30%, #E31C79 90%)',
              },
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={6} sm={6} md={4} lg={3} key={product.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.4s ease',
                  background: 'white',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(227, 28, 121, 0.15)',
                    borderColor: 'transparent',
                    background: 'linear-gradient(135deg, #fff 0%, #fff5f7 100%)',
                    '& img': {
                      transform: 'scale(1.05)'
                    }
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '100%',
                    mb: 2,
                    borderRadius: 1,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  <img
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    display: 'flex', 
                    gap: 1,
                    zIndex: 1 
                  }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(product)}
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          color: '#E31C79',
                          '&:hover': {
                            bgcolor: 'white',
                            color: '#E31C79'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate">
                      <IconButton
                        size="small"
                        onClick={() => handleDuplicateProduct(product)}
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          color: '#E31C79',
                          '&:hover': {
                            bgcolor: 'white',
                            color: '#E31C79'
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product.id)}
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          color: '#E31C79',
                          '&:hover': {
                            bgcolor: 'white',
                            color: '#E31C79'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontFamily: 'Playfair Display, serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '3em',
                    color: '#333',
                    fontWeight: 500,
                  }}
                >
                  {product.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#E31C79',
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    ₹{product.price.toLocaleString()}
                  </Typography>
                  <Chip 
                    label={product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'} 
                    color={product.stock > 0 ? 'success' : 'error'} 
                    size="small"
                    sx={{ 
                      borderRadius: 1,
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedProducts.length > 0 && selectedProducts.length < products.length}
                    checked={selectedProducts.length === products.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Image</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow 
                  key={product.id}
                  onContextMenu={(e) => handleContextMenu(e, product.id)}
                  selected={selectedProducts.includes(product.id)}
                  hover
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleCheckboxChange(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      style={{ width: 50, height: 50, objectFit: 'contain' }}
                    />
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>₹{product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'} 
                      color={product.stock > 0 ? 'success' : 'error'} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {categories.find(cat => cat.id === product.categoryId)?.name || product.categoryId}
                  </TableCell>
                  <TableCell>{product.rating}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(product)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate">
                        <IconButton size="small" onClick={() => handleDuplicateProduct(product)}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(product.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleDeleteSelected}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Selected ({selectedProducts.length})</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handlePrintBarcodes();
          handleCloseContextMenu();
        }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Barcodes ({selectedProducts.length})</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product SKU"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  helperText="Enter a unique product SKU"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.price}
                  placeholder="Enter product price"
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Product Media
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        sx={{
                          borderColor: '#E31C79',
                          color: '#E31C79',
                          '&:hover': {
                            borderColor: '#E31C79',
                            backgroundColor: 'rgba(227, 28, 121, 0.04)'
                          }
                        }}
                      >
                        Upload Media
                        <input
                          type="file"
                          hidden
                          accept="image/*,video/mp4,video/webm"
                          multiple
                          onChange={handleMediaUpload}
                        />
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            media: ''
                          });
                          toast.info('Media cleared');
                        }}
                        sx={{
                          borderColor: '#666',
                          color: '#666',
                          '&:hover': {
                            borderColor: '#666',
                            backgroundColor: 'rgba(102, 102, 102, 0.04)'
                          }
                        }}
                      >
                        Clear Media
                      </Button>
                    </Box>

                    {/* Media Preview Section */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Current Media: {formData.media.split('\n').filter(Boolean).length} 
                        (Click on a media item to remove it)
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        {formData.media && formData.media.split('\n').filter(Boolean).map((media, index) => {
                          const isVideo = /\.(mp4|webm)$/i.test(media);
                          return (
                            <Box
                              key={index}
                              sx={{
                                width: 100,
                                height: 100,
                                position: 'relative',
                                border: '1px solid #ddd',
                                borderRadius: 1,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                '&:hover::after': {
                                  content: '"✕"',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                  color: 'white',
                                  fontSize: '24px'
                                }
                              }}
                              onClick={() => {
                                // Remove this media from the list
                                const mediaList = formData.media.split('\n').filter(Boolean);
                                mediaList.splice(index, 1);
                                setFormData({
                                  ...formData,
                                  media: mediaList.join('\n')
                                });
                              }}
                            >
                              {isVideo ? (
                                <>
                                  <video
                                    src={getImageUrl(media)}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                    muted
                                    loop
                                    playsInline
                                  />
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      color: 'white',
                                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                      borderRadius: '50%',
                                      width: 24,
                                      height: 24,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <PlayArrowIcon sx={{ fontSize: 16 }} />
                                  </Box>
                                </>
                              ) : (
                                <img
                                  src={getImageUrl(media)}
                                  alt={`Product ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `${MEDIA_BASE_URL}/images/products/placeholder.jpg`;
                                  }}
                                />
                              )}
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  position: 'absolute', 
                                  bottom: 0, 
                                  width: '100%', 
                                  backgroundColor: 'rgba(255,255,255,0.7)',
                                  padding: '2px 4px',
                                  textAlign: 'center',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {media.length > 20 ? media.substring(0, 17) + '...' : media}
                              </Typography>
                            </Box>
                          );
                        })}
                        
                        {(!formData.media || formData.media.split('\n').filter(Boolean).length === 0) && (
                          <Box 
                            sx={{ 
                              width: '100%', 
                              padding: 2, 
                              textAlign: 'center',
                              border: '1px dashed #ccc',
                              borderRadius: 1
                            }}
                          >
                            <Typography color="text.secondary">
                              No media uploaded. Use the "Upload Media" button to add images or videos.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rating"
                  type="number"
                  value={formData.rating}
                  placeholder="Enter rating (0-5)"
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  inputProps={{ min: 0, max: 5, step: 0.1 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  placeholder="Enter stock quantity"
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Trending</InputLabel>
                  <Select
                    value={formData.trending ? 'true' : 'false'}
                    label="Trending"
                    onChange={(e) => setFormData({ ...formData, trending: e.target.value === 'true' })}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Featured</InputLabel>
                  <Select
                    value={formData.featured ? 'true' : 'false'}
                    label="Featured"
                    onChange={(e) => setFormData({ ...formData, featured: e.target.value === 'true' })}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Product Specifications */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Product Specifications
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Material"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Work"
                  value={formData.work}
                  onChange={(e) => setFormData({ ...formData, work: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Length"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Origin"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #E31C79 30%, #FF4D4D 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF4D4D 30%, #E31C79 90%)',
                },
              }}
            >
              {editingProduct ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <BarcodeLabels
        open={barcodeDialogOpen}
        onClose={() => setBarcodeDialogOpen(false)}
        selectedProducts={products.filter(p => selectedProducts.includes(p.id))}
      />
    </Box>
  );
};

export default AdminProducts; 