import api from "./api";

const USER_URL = "/users";

const UserService = {
  getProfile: async () => {
    const response = await api.get(`${USER_URL}/me`);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.patch(`${USER_URL}/updateMe`, userData);
    if (response.data.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.patch(`${USER_URL}/updateMyPassword`, {
      passwordCurrent: currentPassword,
      password: newPassword,
      passwordConfirm: newPassword,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },
};

export default UserService;
