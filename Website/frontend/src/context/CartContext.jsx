import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import API from '../utils/api';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedItems, setSavedItems] = useState(() => {
    const saved = localStorage.getItem('savedItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState([]);

  const [shippingAddress, setShippingAddress] = useState(() => {
    const saved = localStorage.getItem('shippingAddress');
    return saved ? JSON.parse(saved) : null;
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    const saved = localStorage.getItem('paymentMethod');
    return saved ? JSON.parse(saved) : 'Credit Card';
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
  }, [savedItems]);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const { data } = await API.get('/auth/wishlist');
      setWishlist(data);
    } catch (error) {
      console.error('Failed to fetch wishlist from server', error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToCart = (item, quantity) => {
    setCartItems((prevItems) => {
      const exists = prevItems.find((x) => x.product === item.product);
      if (exists) {
        const newQty = Math.min(item.stock, exists.quantity + quantity);
        return prevItems.map((x) =>
          x.product === item.product ? { ...x, quantity: newQty } : x
        );
      }
      return [...prevItems, { ...item, quantity: Math.min(item.stock, quantity) }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product !== productId));
  };

  const updateCartQty = (productId, quantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product === productId
          ? { ...item, quantity: Math.min(item.stock, Math.max(1, quantity)) }
          : item
      )
    );
  };

  const saveForLater = (productId) => {
    const itemToSave = cartItems.find((item) => item.product === productId);
    if (itemToSave) {
      setCartItems((prev) => prev.filter((item) => item.product !== productId));
      setSavedItems((prev) => {
        const exists = prev.find((x) => x.product === productId);
        if (exists) return prev;
        return [...prev, itemToSave];
      });
    }
  };

  const moveToCart = (productId) => {
    const itemToMove = savedItems.find((item) => item.product === productId);
    if (itemToMove) {
      setSavedItems((prev) => prev.filter((item) => item.product !== productId));
      setCartItems((prev) => {
        const exists = prev.find((x) => x.product === productId);
        if (exists) return prev;
        return [...prev, itemToMove];
      });
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const saveShippingAddress = (address) => {
    setShippingAddress(address);
    localStorage.setItem('shippingAddress', JSON.stringify(address));
  };

  const savePaymentMethod = (method) => {
    setPaymentMethod(method);
    localStorage.setItem('paymentMethod', JSON.stringify(method));
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      alert('Please sign in to add items to your wishlist.');
      return;
    }
    try {
      await API.post(`/auth/wishlist/${productId}`);
      await fetchWishlist();
    } catch (error) {
      console.error('Failed to toggle wishlist', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const totals = useMemo(() => {
    const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const itemsPrice = cartItems.reduce((acc, item) => {
      const activePrice = item.discountPrice !== null && item.discountPrice !== undefined ? item.discountPrice : item.price;
      return acc + activePrice * item.quantity;
    }, 0);

    const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 9.99;
    const taxPrice = itemsPrice * 0.15;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    return {
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      itemsCount,
    };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        wishlist,
        shippingAddress,
        paymentMethod,
        addToCart,
        removeFromCart,
        updateCartQty,
        saveForLater,
        moveToCart,
        clearCart,
        saveShippingAddress,
        savePaymentMethod,
        isInWishlist,
        toggleWishlist,
        fetchWishlist,
        totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

