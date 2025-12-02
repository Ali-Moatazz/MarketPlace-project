import React, { useState, useEffect, useContext } from 'react';
import { getAllProducts, searchProducts, getCategories } from '../../api/products';
import ProductCard from '../../components/buyer/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CartContext from '../../context/CartContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search States
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getAllProducts(),
        getCategories()
      ]);
      setProducts(prods.products || prods); // Handle different response structures
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calls: /api/products/search?keyword=...&category=...
      const res = await searchProducts(keyword, selectedCategory);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setSelectedCategory('');
    fetchInitialData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 mt-2">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          
         <select
  className="border border-gray-300 rounded-md px-4 py-2 bg-white"
  value={selectedCategory}
  onChange={(e) => {
    setSelectedCategory(e.target.value);
    // Trigger search immediately with the new value and current keyword
    searchProducts(keyword, e.target.value).then(res => setProducts(res.data || []));
  }}
>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Search
          </button>
          
          {(keyword || selectedCategory) && (
            <button 
              type="button" 
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 px-4"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <h3 className="text-xl">No products found.</h3>
          <p>Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onAddToCart={addToCart} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;