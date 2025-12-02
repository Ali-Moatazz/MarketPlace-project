import React, { useState } from 'react';
import { convertFileToBase64 } from '../../utils/helper'; // Import the helper
import Button from '../common/Button';

const ProductForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    deliveryTimeEstimate: '', 
    images: [] // Stores base64 strings
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- NEW: Handle Image Upload ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (limit to 2MB to keep DB happy)
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too big! Please select an image under 2MB.");
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      // Append new image to existing array
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, base64]
      }));
    } catch (err) {
      alert("Error uploading image");
    }
  };

  // --- NEW: Remove Image ---
  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Product Title</label>
        <input 
          type="text" name="title" required
          value={formData.title} onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* --- NEW: Image Upload Section --- */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
        
        {/* File Input */}
        <div className="flex items-center space-x-4">
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded border border-gray-300 transition">
            <span>+ Upload Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </label>
          <span className="text-xs text-gray-500">Max 2MB per image</span>
        </div>

        {/* Image Previews */}
        {formData.images.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden group">
                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0 right-0 bg-red-600 text-white p-1 text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* --- End Image Section --- */}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price ($)</label>
          <input 
            type="number" name="price" required min="0" step="0.01"
            value={formData.price} onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input 
            type="number" name="stock" required min="0"
            value={formData.stock} onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select 
          name="category" 
          value={formData.category} onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Delivery Time Estimate
        </label>
        <input 
          type="text" name="deliveryTimeEstimate" required
          value={formData.deliveryTimeEstimate} onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="e.g. 3-5 Business Days"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea 
          name="description" rows="3"
          value={formData.description} onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save Product'}
      </Button>
    </form>
  );
};

export default ProductForm;