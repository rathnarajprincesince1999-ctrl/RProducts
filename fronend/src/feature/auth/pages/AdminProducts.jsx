import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useToast } from '../../../context/ToastContext';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: '',
    categoryId: '',
    productImage: null,
    returnable: false,
    returnDays: 0,
    replaceable: false,
    replacementDays: 0,
    cardColor: '#bdd2f3'
  });

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products?userType=admin`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    if (formData.unit) formDataToSend.append('unit', formData.unit);
    if (formData.categoryId) formDataToSend.append('categoryId', formData.categoryId);
    if (formData.productImage) formDataToSend.append('productImage', formData.productImage);
    formDataToSend.append('returnable', formData.returnable);
    formDataToSend.append('returnDays', formData.returnDays);
    formDataToSend.append('replaceable', formData.replaceable);
    formDataToSend.append('replacementDays', formData.replacementDays);
    formDataToSend.append('cardColor', formData.cardColor);

    try {
      const url = editingProduct 
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        fetchProducts();
        resetForm();
        showToast(editingProduct ? 'Product updated successfully!' : 'Product created successfully!', 'success');
      } else {
        showToast('Failed to save product', 'error');
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_URL}/products/${id}?userType=admin`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchProducts();
          showToast('Product deleted successfully!', 'success');
        } else {
          const errorText = await response.text();
          showToast(`Failed to delete product: ${errorText}`, 'error');
        }
      } catch (error) {
        showToast(`Error deleting product: ${error.message}`, 'error');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      unit: product.unit || '',
      categoryId: product.categoryId || '',
      productImage: null,
      returnable: product.returnable || false,
      returnDays: product.returnDays || 0,
      replaceable: product.replaceable || false,
      replacementDays: product.replacementDays || 0,
      cardColor: product.cardColor || '#3B82F6'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      unit: '', 
      categoryId: '', 
      productImage: null,
      returnable: false,
      returnDays: 0,
      replaceable: false,
      replacementDays: 0,
      cardColor: '#a8c4f0'
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href = '/admin'} className="text-purple-600 hover:text-purple-800">
              <svg className="w-6 h-6" viewBox="0 0 64 64" fill="none">
                <path d="M40 16L24 32l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
              </svg>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              RATHNA Products - Products
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-purple-900">Manage Products</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
          >
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="backdrop-blur-2xl bg-white/60 p-6 rounded-3xl border-2 border-white/60 shadow-2xl">
              {product.productImageUrl && (
                <img 
                  src={product.productImageUrl.startsWith('http') ? product.productImageUrl : `${API_URL.replace('/api', '')}${product.productImageUrl}`} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-2xl mb-4" 
                />
              )}
              <h3 className="text-2xl font-bold text-purple-900 mb-2">{product.name}</h3>
              <p className="text-gray-700 mb-2">{product.description}</p>
              <p className="text-xl font-bold text-green-600 mb-2">₹{product.price}</p>
              {product.unit && (
                <p className="text-sm text-purple-600 mb-2">Unit: {product.unit}</p>
              )}
              {product.categoryName && (
                <p className="text-sm text-gray-500 mb-4">Category: {product.categoryName}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={resetForm}
        >
          <div 
            className="backdrop-blur-2xl bg-white/90 p-8 rounded-3xl border-2 border-white/60 shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-purple-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <select
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="grams">Grams (g)</option>
                <option value="pack">Pack</option>
                <option value="numbers">Numbers</option>
              </select>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, productImage: e.target.files[0]})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-700">Return & Replacement Options</h4>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.returnable}
                      onChange={(e) => setFormData({...formData, returnable: e.target.checked})}
                      className="rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Returnable</span>
                  </label>
                  {formData.returnable && (
                    <input
                      type="number"
                      placeholder="Days"
                      value={formData.returnDays}
                      onChange={(e) => setFormData({...formData, returnDays: parseInt(e.target.value) || 0})}
                      className="w-20 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.replaceable}
                      onChange={(e) => setFormData({...formData, replaceable: e.target.checked})}
                      className="rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Replaceable</span>
                  </label>
                  {formData.replaceable && (
                    <input
                      type="number"
                      placeholder="Days"
                      value={formData.replacementDays}
                      onChange={(e) => setFormData({...formData, replacementDays: parseInt(e.target.value) || 0})}
                      className="w-20 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;