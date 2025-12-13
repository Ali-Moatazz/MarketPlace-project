import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const ProductCard = ({ product, onAddToCart }) => {

  const { user } = useContext(AuthContext); // 2. Get current user

  const handleAddToCart = () => {
    // --- CHECK 1: Is user logged in? ---
    if (!user) {
      alert("Please login to purchase items.");
      return;
    }

    // --- CHECK 2: Is user a Buyer? ---
    if (user.role !== 'buyer') {
      alert("Sellers cannot make purchases.");
      return;
    }

    // --- CHECK 3: DELIVERY AREA VALIDATION (The "Beginning" Check) ---
    const sellerArea = product.sellerId?.serviceArea;
    
    // Check if seller has specific areas defined
    if (sellerArea && sellerArea.trim().length > 0) {
      
      // Get buyer's location
      const buyerLocation = (user.governate || user.address || "").toLowerCase();
      
      // Split seller areas (e.g. "Cairo, Giza" -> ["cairo", "giza"])
      const allowedAreas = sellerArea.split(',').map(area => area.trim().toLowerCase());

      // Check if buyer's location matches ANY allowed area
      const isMatch = allowedAreas.some(area => buyerLocation.includes(area));

      if (!isMatch) {
        // 🛑 STOP HERE! Do not proceed to onAddToCart
        alert(
          `🚫 Delivery Not Available\n\n` +
          `You are in: ${user.governate || "Unknown"}\n` +
          `This seller only delivers to: ${sellerArea}`
        );
        return; 
      }
    }

    // --- IF ALL CHECKS PASS, ADD TO CART ---
    onAddToCart(product);
  };

  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      
      {/* 
         FIX: Changed object-cover to object-contain
         Added p-4 so the image has some breathing room
      */}
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
        
        <p className="text-xs text-gray-400 mt-2 line-clamp-1">
          Sold by: {product.sellerId?.storeName || 'Unknown Seller'}
        </p>

        <button 
          onClick={() => handleAddToCart()}
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