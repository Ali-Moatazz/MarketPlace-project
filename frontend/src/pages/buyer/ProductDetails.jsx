import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../../api/products';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CartContext from '../../context/CartContext';
import AuthContext from '../../context/AuthContext';
import ReviewSection from '../../components/buyer/ReviewSection';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res.product || res);
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <button onClick={() => navigate(-1)} className="text-gray-500 mb-4 hover:underline">
        &larr; Back to Results
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image */}
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-contain" />
          ) : (
            <span className="text-gray-400 text-lg">No Image Available</span>
          )}
        </div>

        {/* Right: Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
          <p className="text-sm text-blue-600 mb-4 font-semibold">{product.category}</p>
          
          <div className="text-3xl font-bold text-green-700 mb-4">${product.price}</div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">Description</h3>
            <p className="text-gray-600 leading-relaxed mt-1">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-gray-500">Seller</span>
              <span className="font-medium">{product.sellerId?.storeName || 'Unknown Store'}</span>
              
              {/* --- NEW: Display Flag Count --- */}
              {product.sellerId?.flagsCount > 0 && (
                <span className="block text-red-600 font-bold mt-1 text-xs">
                  ⚠️ Flagged {product.sellerId.flagsCount} times
                </span>
              )}
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-gray-500">Estimated Delivery</span>
              <span className="font-medium text-blue-600">
                {product.deliveryTimeEstimate || 'Standard Shipping'}
              </span>
            </div>
          </div>

          <div className="border-t pt-6">
            {product.stock > 0 ? (
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Add to Cart
              </button>
            ) : (
              <button disabled className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-bold cursor-not-allowed">
                Out of Stock
              </button>
            )}
            <p className="text-center text-gray-500 text-sm mt-2">{product.stock} items left in stock</p>
          </div>
        </div>
      </div>

      {/* Reviews & AI Summary Section */}
      <div className="mt-12 border-t pt-8">
        <ReviewSection productId={id} currentUser={user} />
      </div>
    </div>
  );
};

export default ProductDetails;