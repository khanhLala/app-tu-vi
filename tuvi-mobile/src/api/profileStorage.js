import axiosClient from './axiosClient';

/**
 * Lưu một lá số vào danh sách.
 * Hiện tại Backend đã tự động lưu khi gọi /generate, 
 * nên hàm này có thể để trống hoặc dùng để xử lý cache nếu cần.
 */
export const saveProfile = async (chartData) => {
  // Backend tự động lưu khi generateChart nên không cần gọi API riêng ở đây
  return true;
};

/**
 * Lấy toàn bộ danh sách lịch sử từ Backend.
 */
export const getProfiles = async () => {
  try {
    const response = await axiosClient.get('/tuvi/history');
    // axiosClient đã unwrapped response.data.result ở interceptor rồi
    return response || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách profile từ server:', error);
    return [];
  }
};

/**
 * Xóa một bản ghi cụ thể trên Backend.
 */
export const deleteProfile = async (id) => {
  try {
    await axiosClient.delete(`/tuvi/history/${id}`);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa profile trên server:', error);
    return false;
  }
};

/**
 * Xóa toàn bộ lịch sử trên Backend.
 */
export const clearHistory = async () => {
    try {
      await axiosClient.delete('/tuvi/history');
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa sạch lịch sử trên server:', error);
      return false;
    }
};
