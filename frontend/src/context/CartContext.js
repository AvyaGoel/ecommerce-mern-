import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0, totalItems: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], totalPrice: 0, totalItems: 0 }); return; }
    setCartLoading(true);
    try {
      const { data } = await cartAPI.get();
      setCart(data.cart);
    } catch { } finally { setCartLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await cartAPI.add(productId, quantity);
    setCart(data.cart);
  };

  const updateCart = async (productId, quantity) => {
    const { data } = await cartAPI.update(productId, quantity);
    setCart(data.cart);
  };

  const removeFromCart = async (productId) => {
    const { data } = await cartAPI.remove(productId);
    setCart(data.cart);
  };

  const clearCart = async () => {
    await cartAPI.clear();
    setCart({ items: [], totalPrice: 0, totalItems: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, cartLoading, fetchCart, addToCart, updateCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
