import api from "./api";

const USER_URL = "/users";

const UserService = {
	getProfile: async () => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${USER_URL}/me`, { headers });
		return response.data;
	},

	getUserProfile: async (userId) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.get(`${USER_URL}/${userId}`, { headers });
		return response.data;
	},

	updateMe: async (userData) => {
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const response = await api.patch(`${USER_URL}/updateMe`, userData, {
			headers,
		});

		if (response.data && response.data.data && response.data.data.user) {
			// Update user in local storage for immediate UI update
			const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
			const updatedUser = {
				...currentUser,
				...response.data.data.user,
			};
			localStorage.setItem("user", JSON.stringify(updatedUser));
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

	updateProfilePicture: async (formData) => {
		try {
			const token = localStorage.getItem("token");
			const response = await api.patch(
				`${USER_URL}/update-profile-picture`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data && response.data.data && response.data.data.user) {
				const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
				const updatedUser = {
					...currentUser,
					profilePicture: response.data.data.user.profilePicture,
				};
				localStorage.setItem("user", JSON.stringify(updatedUser));
			}

			return response.data;
		} catch (error) {
			console.error("Update profile picture error:", error);
			throw error;
		}
	},

	deleteProfilePicture: async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await api.delete(`${USER_URL}/delete-profile-picture`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.data && response.data.data && response.data.data.user) {
				const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
				const updatedUser = { ...currentUser, profilePicture: null };
				localStorage.setItem("user", JSON.stringify(updatedUser));
			}

			return response.data;
		} catch (error) {
			console.error("Delete profile picture error:", error);
			throw error;
		}
	},
};

export default UserService;
