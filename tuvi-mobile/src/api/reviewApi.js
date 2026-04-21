import axiosClient from './axiosClient';

const reviewApi = {
  getReviewsByProduct: (productId) => axiosClient.get(`reviews/product/${productId}`),
  checkEligibility: (productId) => axiosClient.get(`reviews/eligibility/${productId}`),
  createReview: (data) => axiosClient.post('reviews', data),
};

export default reviewApi;
