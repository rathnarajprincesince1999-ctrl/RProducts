import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever cartItems changes (but not on initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        // Silent fail for cart save
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product) => {
    try {
      // Validate product data
      if (!product || !product.id || !product.name || !product.price) {
        throw new Error('Invalid product data');
      }
      
      // Check if product is enabled
      if (product.enabled === false) {
        throw new Error('This product is currently unavailable');
      }
      
      // Check stock availability
      if (product.stockQuantity !== null && product.stockQuantity !== undefined && product.stockQuantity <= 0) {
        throw new Error('This product is out of stock');
      }
      
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
          // Check if adding one more would exceed stock
          if (product.stockQuantity !== null && product.stockQuantity !== undefined && 
              existingItem.quantity >= product.stockQuantity) {
            throw new Error('Cannot add more items. Stock limit reached.');
          }
          
          const updatedItems = prevItems.map(item =>
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          return updatedItems;
        }
        const newItems = [...prevItems, { ...product, quantity: 1 }];
        return newItems;
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};