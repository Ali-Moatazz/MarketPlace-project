import React, { createContext, useState, useEffect, useContext } from 'react';
import { getFavorites, toggleFavorite as apiToggleFavorite } from '../api/users';
import AuthContext from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]); // Stores array of favorite IDs or Objects

  // Load favorites when user logs in
  useEffect(() => {
    if (user && user.role === 'buyer') {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const res = await getFavorites();
      if (res.success) {
        setFavorites(res.favorites);
      }
    } catch (err) {
      console.error("Failed to load favorites");
    }
  };

  const handleToggleFavorite = async (productId) => {
    if (!user) {
      alert("Please login to add favorites");
      return;
    }
    
    try {
      // Optimistic UI Update (Immediate visual feedback)
      const isAlreadyFav = favorites.some(f => (f._id === productId || f === productId));
      
      if (isAlreadyFav) {
        setFavorites(prev => prev.filter(f => (f._id !== productId && f !== productId)));
      } 
      
      // Call API
      const res = await apiToggleFavorite(productId);
      
      // Sync with server response to be sure
      if (res.success) {
        // We might need to reload to get full objects if we are in "View Favorites" page, 
        // but for now IDs are enough for the heart icon.
        // For simplicity, let's just reload the list or rely on the returned IDs
        loadFavorites(); 
      }
    } catch (err) {
      console.error("Error toggling favorite");
      loadFavorites(); // Revert on error
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(f => (f._id === productId || f === productId));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, handleToggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;