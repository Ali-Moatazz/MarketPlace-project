import React, { useContext } from 'react';
import FavoritesContext from '../../context/FavoritesContext';
import CartContext from '../../context/CartContext';
import ProductCard from '../../components/buyer/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Favorites = () => {
  const { favorites } = useContext(FavoritesContext);
  const { addToCart } = useContext(CartContext);

  // Filter out any nulls (in case a product was deleted from DB but still in user's list)
  const validFavorites = favorites.filter(p => p !== null);

  if (!favorites) return <LoadingSpinner />;

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist</h1>

      {validFavorites.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg mb-4">Your wishlist is empty.</p>
          <p className="text-sm text-gray-400">Heart items to save them for later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {validFavorites.map((product) => (
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

export default Favorites;