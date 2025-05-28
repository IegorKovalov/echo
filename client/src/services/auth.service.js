import api from "./api";

const AuthService = {
	signup: async (userData) => {
		try {
			const response = await api.post(`/users/signup`, userData);
			return response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				"Registration failed. Please try again.";
			console.error("Registration error:", error);
			throw new Error(errorMessage);
		}
	},

	login: async (email, password) => {
		try {
			const response = await api.post(`/users/login`, { email, password });
			
			if (response.data.token) {
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.data.user));
			}
			return response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				"Login failed. Please check your credentials.";
			
			console.error("Login error:", error);
			
			const loginError = new Error(errorMessage);
			if (error.response?.data?.userId) {
				loginError.isVerificationError = true;
				loginError.userId = error.response.data.userId;
			}
			throw loginError;
		}
	},
	
	verifyOTP: async (userId, otp) => {
		try {
			const response = await api.post(`/users/verify-otp/${userId}`, { otp });
			
			if (response.data.token) {
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.data.user));
			}
			
			return response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				"OTP verification failed. Please try again.";
			console.error("OTP verification error:", error);
			throw new Error(errorMessage);
		}
	},
	
	resendOTP: async (userId) => {
		try {
			const response = await api.post(`/users/resend-otp/${userId}`);
			return response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				"Failed to resend verification code. Please try again.";
			console.error("OTP resend error:", error);
			throw new Error(errorMessage);
		}
	},

	logout: async () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		try {
			await api.get(`/users/logout`);
			return { success: true };
		} catch (error) {
			console.error("Logout API error:", error);
			const logoutError = new Error(
				error.response?.data?.message ||
				"Server logout may have failed. You have been logged out locally."
			);
			logoutError.isLogoutError = true;
			throw logoutError; 
		}
	},

	forgotPassword: async (email) => {
		try {
			const response = await api.post(`/users/forgot-password`, { email });
			return response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				"Failed to send password reset email. Please try again.";
			console.error("Forgot password error:", error);
			throw new Error(errorMessage);
		}
	},

	resetPassword: async (token, password, passwordConfirm) => {
		try {
			const response = await api.patch(`/users/reset-password/${token}`, {
				password,
				passwordConfirm,
			});
			if (response.data.token) {
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.data.user));
			}
			return response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				"Password reset failed. Please try again.";
			console.error("Reset password error:", error);
			throw new Error(errorMessage);
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
