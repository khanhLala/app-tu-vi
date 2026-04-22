import React, { createContext, useContext, useState, useCallback } from 'react';
import cartApi from '../api/cartApi';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = useCallback(async () => {
    try {
      const items = await cartApi.getCart();
      const list = Array.isArray(items) ? items : [];
      setCartItems(list);
      setCartCount(list.reduce((sum, i) => sum + i.quantity, 0));
    } catch (e) {
      // silently fail if not logged in yet
    }
  }, []);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    await cartApi.addToCart(productId, quantity);
    await fetchCart();
  }, [fetchCart]);

  const removeFromCart = useCallback(async (cartItemId) => {
    await cartApi.removeFromCart(cartItemId);
    await fetchCart();
  }, [fetchCart]);

  const updateCartQuantity = useCallback(async (cartItemId, quantity) => {
    await cartApi.updateQuantity(cartItemId, quantity);
    await fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, fetchCart, addToCart, removeFromCart, updateCartQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
