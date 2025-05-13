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
			console.error("Registration error:", errorMessage);
			throw new Error(errorMessage);
		}
	},

	login: async (email, password) => {
		try {
			const response = await api.post(`/users/login`, { email, password });
			
			// Check if the user is verified
			if (response.data.token) {
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.data.user));
			}
			return response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				"Login failed. Please check your credentials.";
			
			// Pass through userId if email needs verification
			if (error.response?.data?.userId) {
				throw {
					message: errorMessage,
					userId: error.response.data.userId
				};
			}
			
			console.error("Login error:", errorMessage);
			throw new Error(errorMessage);
		}
	},
	
	verifyOTP: async (userId, otp) => {
		try {
			const response = await api.post(`/users/verify-otp/${userId}`, { otp });
			
			// If verification is successful, store token and user
			if (response.data.token) {
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("user", JSON.stringify(response.data.data.user));
			}
			
			return response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				"OTP verification failed. Please try again.";
			console.error("OTP verification error:", errorMessage);
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
			console.error("OTP resend error:", errorMessage);
			throw new Error(errorMessage);
		}
	},

	logout: async () => {
		try {
			await api.get(`/users/logout`);
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			return { success: true };
		} catch (error) {
			console.error("Logout error:", error);
			// Still remove items from localStorage even if API call fails
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			return { success: false, error };
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
			console.error("Forgot password error:", errorMessage);
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
			console.error("Reset password error:", errorMessage);
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
