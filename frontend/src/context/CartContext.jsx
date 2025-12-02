import React, { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load initial cart from LocalStorage if available
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save to LocalStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- Core Logic: Add to Cart ---
  const addToCart = (product) => {
    // 1. Check if cart has items from a DIFFERENT seller
    if (cartItems.length > 0) {
      const currentSellerId = cartItems[0].sellerId?._id || cartItems[0].sellerId;
      const newSellerId = product.sellerId?._id || product.sellerId;

      if (currentSellerId && newSellerId && currentSellerId !== newSellerId) {
        const confirmSwitch = window.confirm(
          "You can only order from one seller at a time. Clear current cart to add this item?"
        );
        if (confirmSwitch) {
          setCartItems([]); // Clear cart then proceed to add below
        } else {
          return; // User cancelled
        }
      }
    }

    // 2. Add Item or Increment Quantity
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product._id);

      if (existingItem) {
        // Check Stock Limit
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
        // Add new item (Store essential details for UI)
        return [
          ...prevItems,
          {
            productId: product._id,
            title: product.title,
            price: product.price,
            image: product.images?.[0], // Store first image
            sellerId: product.sellerId?._id || product.sellerId, // Important for tracking seller
            storeName: product.sellerId?.storeName || "Seller",
            quantity: 1,
            maxStock: product.stock
          },
        ];
      }
    });

    setIsCartOpen(true); // Open drawer on add
  };

  // --- Remove Item ---
  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // --- Update Quantity (Optional UI helper) ---
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

  // --- Clear Cart ---
  const clearCart = () => {
    setCartItems([]);
  };

  // --- Calculated Totals ---
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