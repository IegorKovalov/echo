import api from "./api";

const AUTH_URL = "http://www.localhost:8000/api/v1/users";

const AuthService = {
	register: async (userData) => {
		const response = await api.post(`${AUTH_URL}/signup`, userData);
		if (response.data.token) {
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(response.data.data.user));
		}
		return response.data;
	},

	login: async (email, password) => {
		const response = await api.post(`${AUTH_URL}/login`, { email, password });
		if (response.data.token) {
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(response.data.data.user));
		}
		return response.data;
	},

	logout: async () => {
		const response = await api.get(`${AUTH_URL}/logout`);
		console.log(response);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	},

	forgotPassword: async (email) => {
		return await api.post(`${AUTH_URL}/forgot-password`, { email });
	},

	resetPassword: async (token, password, passwordConfirm) => {
		return await api.patch(`${AUTH_URL}/reset-password/${token}`, {
			password,
			passwordConfirm,
		});
	},

	getCurrentUser: () => {
		const userStr = localStorage.getItem("user");
		if (userStr) return JSON.parse(userStr);
		return null;
	},

	isAuthenticated: () => {
		return !!localStorage.getItem("token");
	},
};

export default AuthService;
