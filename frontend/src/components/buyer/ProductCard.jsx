import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      
      <div className="h-64 w-full bg-white relative p-4 flex items-center justify-center">
        {product.images && product.images.length > 0 ? (
           <img 
             src={product.images[0]} 
             alt={product.title} 
             className="w-full h-full object-contain" 
           />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
             No Image
           </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow border-t border-gray-100">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 truncate">
            {product.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        
        <div className="flex justify-between items-center mt-auto">
          <div>
             <span className="text-xl font-bold text-green-600">${product.price}</span>
             <div className="text-xs text-gray-500">
               {product.deliveryTimeEstimate || '3-5 days'}
             </div>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-xs text-gray-400 line-clamp-1">
            Sold by: {product.sellerId?.storeName || 'Unknown Seller'}
          </p>
          
          {/* --- NEW: Display Flag Count --- */}
          {product.sellerId?.flagsCount > 0 && (
            <p className="text-xs text-red-600 font-bold mt-1 flex items-center">
              ⚠️ Warning: Seller flagged {product.sellerId.flagsCount} times
            </p>
          )}
        </div>

        <button 
          onClick={() => onAddToCart(product)}
          disabled={product.stock <= 0}
          className={`mt-4 w-full py-2 px-4 rounded transition-colors ${
            product.stock > 0 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;