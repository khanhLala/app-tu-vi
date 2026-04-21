import axiosClient from './axiosClient';

const productApi = {
  getAll: () => axiosClient.get('products'),
  getProductById: (id) => axiosClient.get(`products/${id}`),
};

export default productApi;
