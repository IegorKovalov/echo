import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import { useToast } from "./ToastContext";

// Create context
const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [contextError, setContextError] = useState(null);
	const navigate = useNavigate();
	const { showError } = useToast();

	// Check if user is already logged in
	useEffect(() => {
		const currentUser = authService.getCurrentUser();
		if (currentUser) {
			setUser(currentUser);
		}
		setLoading(false);
	}, []);

	// Login function
	const login = async (email, password) => {
		try {
			setLoading(true);
			setContextError(null);
			const response = await authService.login(email, password);
			setUser(response.data.user);
			navigate("/");
			return response;
		} catch (err) {
			if (err.isVerificationError && err.userId) {
				navigate(`/verify-email/${err.userId}`);
				throw err;
			}
			
			setContextError(err.message || "Login failed");
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Signup function
	const signup = async (userData) => {
		try {
			setLoading(true);
			setContextError(null);
			const response = await authService.signup(userData);
			
			if (response.status === "success" && response.userId) {
				navigate(`/verify-email/${response.userId}`);
			}
			
			return response;
		} catch (err) {
			setContextError(err.message || "Signup failed");
			throw err;
		} finally {
			setLoading(false);
		}
	};
	
	// Verify OTP function
	const verifyOTP = async (userId, otp) => {
		try {
			setLoading(true);
			setContextError(null);
			const response = await authService.verifyOTP(userId, otp);
			
			if (response.status === "success") {
				setUser(response.data.user);
				navigate("/");
			}
			
			return response;
		} catch (err) {
			setContextError(err.message || "OTP Verification failed");
			throw err;
		} finally {
			setLoading(false);
		}
	};
	
	// Resend OTP function
	const resendOTP = async (userId) => {
		try {
			setLoading(true);
			setContextError(null);
			const response = await authService.resendOTP(userId);
			return response;
		} catch (err) {
			setContextError(err.message || "Failed to resend OTP");
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Logout function
	const logout = async () => {
		try {
			setLoading(true);
			setContextError(null);
			await authService.logout();
			setUser(null);
			navigate("/login");
		} catch (err) {
			if (err.isLogoutError) {
				setContextError(err.message);
				showError(err.message);
			} else {
				const defaultMessage = "An error occurred during logout.";
				setContextError(err.message || defaultMessage);
				showError(err.message || defaultMessage);
			}
			setUser(null);
			navigate("/login");
		} finally {
			setLoading(false);
		}
	};

	// Update user function
	const updateUser = (userData) => {
		try {
			if (user) {
				setUser((prevUser) => ({
					...prevUser,
					...userData,
				}));
				const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
				localStorage.setItem(
					"user",
					JSON.stringify({
						...storedUser,
						...userData,
					})
				);
			}
		} catch (e) {
			console.error("AuthContext: Error updating user in localStorage", e);
			showError("Could not save user changes locally.");
		}
	};

	// Forgot password function
	const forgotPassword = async (email) => {
		try {
			setLoading(true);
			setContextError(null);
			const response = await authService.forgotPassword(email);
			return response;
		} catch (err) {
			setContextError(err.message || "Failed to send password reset email");
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Reset password function
	const resetPassword = async (token, password, passwordConfirm) => {
		try {
			setLoading(true);
			setContextError(null);
			const response = await authService.resetPassword(
				token,
				password,
				passwordConfirm
			);
			setUser(response.data.user);
			return response;
		} catch (err) {
			setContextError(err.message || "Password reset failed");
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const value = {
		user,
		loading,
		error: contextError,
		login,
		signup,
		logout,
		forgotPassword,
		resetPassword,
		updateUser,
		verifyOTP,
		resendOTP,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export default AuthContext;
