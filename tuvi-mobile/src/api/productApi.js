import axiosClient from './axiosClient';

const productApi = {
  getAll: () => axiosClient.get('products'),
  getById: (id) => axiosClient.get(`products/${id}`),
  getReviews: (id) => axiosClient.get(`products/${id}/reviews`),
};

export default productApi;
