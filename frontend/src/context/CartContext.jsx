import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext'; // 1. Import Auth

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext); // 2. Get the current user
  
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper: Get unique key for storage
  const getCartKey = () => {
    if (user && user._id) return `cart_${user._id}`;
    if (user && user.id) return `cart_${user.id}`;
    return 'cart_guest';
  };

  // 3. Load Cart when User Changes (Login/Logout)
  useEffect(() => {
    if (loading) return; // Wait for Auth to finish loading

    const key = getCartKey();
    const savedCart = localStorage.getItem(key);

    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    } else {
      setCartItems([]);
    }
    setIsInitialized(true);
  }, [user, loading]);

  // 4. Save Cart whenever items change
  useEffect(() => {
    // Only save if we have finished the initial load (prevents overwriting with empty array on boot)
    if (isInitialized) {
      const key = getCartKey();
      localStorage.setItem(key, JSON.stringify(cartItems));
    }
  }, [cartItems, user, isInitialized]);

  // --- Cart Actions (Same logic, but rely on the effects above to save) ---

  const addToCart = (product) => {
    // Check for different seller conflict
    if (cartItems.length > 0) {
      const currentSellerId = cartItems[0].sellerId?._id || cartItems[0].sellerId;
      const newSellerId = product.sellerId?._id || product.sellerId;

      if (currentSellerId && newSellerId && currentSellerId !== newSellerId) {
        const confirmSwitch = window.confirm(
          "You can only order from one seller at a time. Clear current cart to add this item?"
        );
        if (confirmSwitch) {
          setCartItems([]); 
          // We return here. The user has to click add again, or we can recursively call logic.
          // For simplicity, we clear and let them add again or handle it immediately below:
          // Ideally, we clear then add.
           setCartItems([{
            productId: product._id,
            title: product.title,
            price: product.price,
            image: product.images?.[0],
            sellerId: product.sellerId?._id || product.sellerId,
            storeName: product.sellerId?.storeName || "Seller",
            quantity: 1,
            maxStock: product.stock
          }]);
          setIsCartOpen(true);
          return;
        } else {
          return;
        }
      }
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product._id);
      if (existingItem) {
        if (existingItem.quantity + 1 > product.stock) {
          alert(`Only ${product.stock} items available in stock!`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            productId: product._id,
            title: product.title,
            price: product.price,
            image: product.images?.[0],
            sellerId: product.sellerId?._id || product.sellerId,
            storeName: product.sellerId?.storeName || "Seller",
            quantity: 1,
            maxStock: product.stock
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    setCartItems((prev) => 
      prev.map(item => {
        if (item.productId === productId) {
          const validQty = Math.max(1, Math.min(newQty, item.maxStock));
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;