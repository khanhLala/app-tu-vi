import axiosClient from './axiosClient';

const orderApi = {
  createOrder: (data) => axiosClient.post('orders', data),
  getMyOrders: () => axiosClient.get('orders'),
  cancelOrder: (id) => axiosClient.put(`orders/${id}/cancel`),
  completeOrder: (id) => axiosClient.put(`orders/${id}/complete`),
};

export default orderApi;
