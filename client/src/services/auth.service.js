import api from "./api";

const AUTH_URL = "http://localhost:8000/api/v1/users";

const AuthService = {
	register: async (userData) => {
		try {
			const response = await api.post(`${AUTH_URL}/signup`, userData);
			if (response.data.token) {
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.data.user));
			}
			return response.data;
		} catch (error) {
			console.error("Registration error:", error);
			throw error;
		}
	},

	login: async (email, password) => {
		try {
			const response = await api.post(`${AUTH_URL}/login`, { email, password });
			if (response.data.token) {
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.data.user));
			}
			return response.data;
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	},

	logout: async () => {
		try {
			await api.get(`${AUTH_URL}/logout`, {
				withCredentials: true,
			});
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			return { success: true };
		} catch (error) {
			console.error("Logout error:", error);
			return { success: false, error };
		}
	},

	forgotPassword: async (email) => {
		try {
			return await api.post(`${AUTH_URL}/forgot-password`, { email });
		} catch (error) {
			console.error("Forgot password error:", error);
			throw error;
		}
	},

	resetPassword: async (token, password, passwordConfirm) => {
		try {
			return await api.patch(`${AUTH_URL}/reset-password/${token}`, {
				password,
				passwordConfirm,
			});
		} catch (error) {
			console.error("Reset password error:", error);
			throw error;
		}
	},

	getCurrentUser: () => {
		try {
			const userStr = localStorage.getItem("user");
			if (userStr) return JSON.parse(userStr);
			return null;
		} catch (error) {
			console.error("Get current user error:", error);
			localStorage.removeItem("user");
			return null;
		}
	},

	isAuthenticated: () => {
		return !!localStorage.getItem("token");
	},
};

export default AuthService;
