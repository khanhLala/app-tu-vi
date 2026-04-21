import axiosClient from './axiosClient';

const cartApi = {
  getCart: () => axiosClient.get('cart'),
  addToCart: (productId, quantity = 1) =>
    axiosClient.post('cart/add', { productId, quantity }),
  removeFromCart: (cartItemId) =>
    axiosClient.delete(`cart/remove/${cartItemId}`),
};

export default cartApi;
