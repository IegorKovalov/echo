import api from "./api";

const USER_URL = "/users";

const UserService = {
	getProfile: async () => {
		try {
			const response = await api.get(`${USER_URL}/me`);
			return response.data;
		} catch (error) {
			console.error("Get profile error:", error);
			const errorMessage = error.response?.data?.message || "Failed to fetch profile.";
			throw new Error(errorMessage);
		}
	},

	getUserProfile: async (userId) => {
		try {
			const response = await api.get(`${USER_URL}/${userId}`);
			return response.data;
		} catch (error) {
			console.error(`Get user profile error for ${userId}:`, error);
			const errorMessage = error.response?.data?.message || "Failed to fetch user profile.";
			throw new Error(errorMessage);
		}
	},

	updateMe: async (userData) => {
		try {
			const response = await api.patch(`${USER_URL}/updateMe`, userData);
			return response.data;
		} catch (error) {
			console.error("Update profile error:", error);
			const errorMessage = error.response?.data?.message || "Failed to update profile.";
			throw new Error(errorMessage);
		}
	},

	changePassword: async (passwordCurrent, password, passwordConfirm) => {
		try {
			const response = await api.patch(
				`${USER_URL}/update-password`,
				{
					passwordCurrent,
					password,
					passwordConfirm,
				}
			);
			// Token handling, if any, should be done by AuthContext after this call succeeds.
			// if (response.data.token) {
			// 	localStorage.setItem("token", response.data.token);
			// }
			return response.data;
		} catch (error) {
			console.error("Change password error:", error);
			const errorMessage = error.response?.data?.message || "Failed to change password.";
			throw new Error(errorMessage);
		}
	},

	updateProfilePicture: async (formData) => {
		try {
			const response = await api.patch(
				`${USER_URL}/update-profile-picture`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Update profile picture error:", error);
			const errorMessage = error.response?.data?.message || "Failed to update profile picture.";
			throw new Error(errorMessage);
		}
	},

	deleteProfilePicture: async () => {
		try {
			const response = await api.delete(`${USER_URL}/delete-profile-picture`);
			return response.data;
		} catch (error) {
			console.error("Delete profile picture error:", error);
			const errorMessage = error.response?.data?.message || "Failed to delete profile picture.";
			throw new Error(errorMessage);
		}
	},
};

export default UserService;
