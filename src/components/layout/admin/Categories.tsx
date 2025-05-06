import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import axios from 'axios'
import { categoryApi, productApi } from '../../../services/api'
import { API_BASE_URL } from '../../../config'
import { getImageUrl } from '../../../utils/imageUtils'
import { CategoryResponse } from '../../../types/api'
import { toast } from 'react-toastify'

interface Category extends CategoryResponse {
  productCount: number
}

interface ImageUploadResponse {
  imageUrl: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    image: string | File;
  }>({
    name: '',
    description: '',
    image: ''
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      // Fetch both categories and products
      const [categoriesData, productsData] = await Promise.all([
        categoryApi.getAll(),
        productApi.getAll()
      ]);

      // Calculate product count for each category
      const categoriesWithCount = categoriesData.map(cat => {
        const count = productsData.filter(product => product.categoryId === cat.id).length;
        return {
          ...cat,
          productCount: count
        };
      });

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      image: ''
    })
    setOpenDialog(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image as string
    })
    setOpenDialog(true)
  }

  const handleDeleteCategory = async (id: string) => {
    if (!id || typeof id !== 'string') {
      setError('Cannot delete category: Invalid ID');
      toast.error('Cannot delete category: Invalid ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryApi.delete(id);
        setCategories(prev => prev.filter(cat => cat.id !== id));
        setError(null);
        toast.success('Category deleted successfully');
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Failed to delete category');
        toast.error('Failed to delete category');
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      toast.error('Category name is required');
      return;
    }

    const toastId = toast.loading(editingCategory ? 'Updating category...' : 'Creating category...');

    try {
      let savedCategory: CategoryResponse;
      
      if (editingCategory?.id) {
        // Update existing category without changing the image first
        const updateData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: editingCategory.image // Keep existing image initially
        };
        
        savedCategory = await categoryApi.update(editingCategory.id, updateData) as CategoryResponse;
        
        // Handle new image upload if provided
        if (formData.image instanceof File) {
          try {
            const response = await categoryApi.uploadImage(editingCategory.id, formData.image) as ImageUploadResponse;
            if (response?.imageUrl) {
              savedCategory = await categoryApi.update(editingCategory.id, {
                ...savedCategory,
                image: response.imageUrl
              }) as CategoryResponse;
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            setError('Category updated but failed to upload new image');
            toast.error('Category updated but failed to upload new image');
          }
        }

        toast.update(toastId, {
          render: 'Category updated successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } else {
        // Create new category
        const createData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: '/images/categories/placeholder.jpg'
        };
        
        savedCategory = await categoryApi.create(createData) as CategoryResponse;

        // Handle image upload for new category
        if (savedCategory?.id && formData.image instanceof File) {
          try {
            const response = await categoryApi.uploadImage(savedCategory.id, formData.image) as ImageUploadResponse;
            if (response?.imageUrl) {
              savedCategory = await categoryApi.update(savedCategory.id, {
                ...savedCategory,
                image: response.imageUrl
              }) as CategoryResponse;
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            setError('Category created but failed to upload image');
            toast.error('Category created but failed to upload image');
          }
        }

        toast.update(toastId, {
          render: 'Category created successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      }

      // Update local state with the new/updated category
      setCategories(prev => {
        const index = prev.findIndex(cat => cat.id === savedCategory.id);
        if (index !== -1) {
          // Update existing category
          const newCategories = [...prev];
          newCategories[index] = {
            ...savedCategory,
            productCount: prev[index].productCount
          };
          return newCategories;
        } else {
          // Add new category
          return [...prev, { ...savedCategory, productCount: 0 }];
        }
      });

      setOpenDialog(false);
      setError(null);
      
      // Clear form data and preview
      setFormData({
        name: '',
        description: '',
        image: ''
      });
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category');
      toast.update(toastId, {
        render: 'Failed to save category',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  const getDisplayImageUrl = (category: Category) => {
    if (!category?.image || typeof category.image !== 'string') {
      return getImageUrl('placeholder.jpg', 'categories')
    }
    return getImageUrl(category.image, 'categories')
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Revoke old preview URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      
      // Just update the form data with the file
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    } catch (error) {
      console.error('Error handling image:', error);
      setError('Failed to handle image');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5" sx={{ fontFamily: 'Playfair Display, serif' }}>
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
          sx={{ 
            bgcolor: '#E31C79',
            '&:hover': { bgcolor: '#d41a6b' }
          }}
        >
          Add Category
        </Button>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image={getDisplayImageUrl(category)}
                alt={category.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.productCount} Products
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditCategory(category)}
                    sx={{ color: '#E31C79' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteCategory(category.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false)
        setEditingCategory(null)
        setFormData({
          name: '',
          description: '',
          image: ''
        })
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl(null)
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload Category Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="category-image-upload"
              />
            </Button>
            {(previewUrl || editingCategory?.image) && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={previewUrl || (editingCategory?.image ? getImageUrl(editingCategory.image, 'categories') : '')}
                  alt="Category Preview"
                  style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{ bgcolor: '#E31C79', '&:hover': { bgcolor: '#d41a6b' } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Categories 