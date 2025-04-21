import api from "./api";

const USER_URL = "/users";

const UserService = {
	getProfile: async () => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${USER_URL}/me`, { headers });
		return response.data;
	},

	updateProfile: async (userData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.patch(`${USER_URL}/updateMe`, userData, {
			headers,
		});
		if (response.data.data.user) {
			localStorage.setItem("user", JSON.stringify(response.data.data.user));
		}
		return response.data;
	},

	changePassword: async (passwordCurrent, password, passwordConfirm) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.patch(
			`${USER_URL}/update-password`,
			{
				passwordCurrent,
				password,
				passwordConfirm,
			},
			{ headers }
		);
		if (response.data.token) {
			localStorage.setItem("token", response.data.token);
		}
		return response.data;
	},

	updateProfileInfo: async (profileData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.patch(
			`${USER_URL}/updateProfileInfo`,
			profileData,
			{ headers }
		);
		return response.data;
	},

	updateProfilePicture: async (formData) => {
		const token = localStorage.getItem("token");
		const headers = token
			? {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
			  }
			: { "Content-Type": "multipart/form-data" };

		const response = await api.patch(
			`${USER_URL}/update-profile-picture`,
			formData,
			{ headers }
		);

		if (response.data.data.user) {
			const currentUser = JSON.parse(localStorage.getItem("user"));
			currentUser.profilePicture = response.data.data.user.profilePicture;
			localStorage.setItem("user", JSON.stringify(currentUser));
		}

		return response.data;
	},

	updateUserInStorage: (userData) => {
		const currentUser = JSON.parse(localStorage.getItem("user"));
		const updatedUser = { ...currentUser, ...userData };
		localStorage.setItem("user", JSON.stringify(updatedUser));
	},
};

export default UserService;
