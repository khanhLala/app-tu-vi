import axiosClient from './axiosClient';

const reviewApi = {
  getReviewsByProduct: (productId) => axiosClient.get(`reviews/product/${productId}`),
  checkEligibility: (productId, orderId) => axiosClient.get(`reviews/eligibility/${productId}?orderId=${orderId}`),
  createReview: (data) => axiosClient.post('reviews', data),
};

export default reviewApi;
