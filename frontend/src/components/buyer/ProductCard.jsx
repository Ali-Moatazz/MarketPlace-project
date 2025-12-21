import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import FavoritesContext from '../../context/FavoritesContext';
import AuthContext from '../../context/AuthContext'; // 1. Import AuthContext

const ProductCard = ({ product, onAddToCart }) => {
  const { isFavorite, handleToggleFavorite } = useContext(FavoritesContext);
  const { user } = useContext(AuthContext); // 2. Get current user
  
  const isFav = isFavorite(product._id);

  // 3. Create the validation handler
  const handleValidationAndAdd = () => {
    if (!user) {
      alert("Please login to purchase items.");
      return;
    }

    if (user.role !== 'buyer') {
      alert("Sellers cannot make purchases.");
      return;
    }

    // 1. Get lowercase versions
    const sellerArea = (product.sellerId?.serviceArea || "").toLowerCase();
    const buyerGov = (user.governate || "").trim().toLowerCase();

    // 2. FIX: Check if buyerGov is empty first
    // If it's empty, we should not allow purchase (or prompt to complete profile)
    if (!buyerGov) {
      alert("Please set your governate in your profile to check delivery availability.");
      return;
    }

    // 3. Perform the location check
    if (!sellerArea.includes(buyerGov)) {
      alert("not provided for this area"); 
      return; 
    }

    onAddToCart(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative group">
      
      {/* Heart Icon */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          handleToggleFavorite(product._id);
        }}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition transform hover:scale-110"
      >
        <svg 
          className={`w-6 h-6 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
          fill={isFav ? "currentColor" : "none"} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Image Section */}
      <div className="h-64 w-full bg-white relative p-4 flex items-center justify-center">
        {product.images?.[0] ? (
           <img src={product.images[0]} alt={product.title} className="w-full h-full object-contain" />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">No Image</div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow border-t border-gray-100">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 truncate">{product.title}</h3>
        </Link>
        
        <div className="mt-auto">
          <span className="text-xl font-bold text-green-600">${product.price}</span>
          <p className="text-xs text-gray-400">Sold by: {product.sellerId?.storeName || 'Unknown'}</p>
          
          {/* Visual Helper: Show area range */}
          <p className="text-[10px] text-gray-400 italic">Delivers to: {product.sellerId?.serviceArea || 'Not specified'}</p>

          {product.sellerId?.flagsCount > 0 && (
            <p className="text-[10px] text-red-600 font-bold mt-1">⚠️ Warning: Seller flagged {product.sellerId.flagsCount} times</p>
          )}
        </div>

        {/* 4. Update the button to use the new handler */}
        <button 
          onClick={handleValidationAndAdd} 
          disabled={product.stock <= 0}
          className={`mt-4 w-full py-2 px-4 rounded transition-colors ${
            product.stock > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500'
          }`}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;