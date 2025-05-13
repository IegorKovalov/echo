import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";

// Create context
const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

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
			setError(null);
			const response = await authService.login(email, password);
			setUser(response.data.user);
			navigate("/");
			return response;
		} catch (err) {
			// Check if this is an unverified user error
			if (err.userId) {
				// Redirect to OTP verification page
				navigate(`/verify-email/${err.userId}`);
				throw err;
			}
			
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Signup function
	const signup = async (userData) => {
		try {
			setLoading(true);
			setError(null);
			const response = await authService.signup(userData);
			
			// If signup successful, redirect to OTP verification page
			if (response.status === "success" && response.userId) {
				navigate(`/verify-email/${response.userId}`);
			}
			
			return response;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	};
	
	// Verify OTP function
	const verifyOTP = async (userId, otp) => {
		try {
			setLoading(true);
			setError(null);
			const response = await authService.verifyOTP(userId, otp);
			
			if (response.status === "success") {
				setUser(response.data.user);
				navigate("/");
			}
			
			return response;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	};
	
	// Resend OTP function
	const resendOTP = async (userId) => {
		try {
			setLoading(true);
			setError(null);
			const response = await authService.resendOTP(userId);
			return response;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Logout function
	const logout = async () => {
		try {
			setLoading(true);
			setError(null);
			await authService.logout();
			setUser(null);
			navigate("/login");
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Update user function
	const updateUser = (userData) => {
		if (user) {
			// Update the user data in context
			setUser((prevUser) => ({
				...prevUser,
				...userData,
			}));

			// Also update the user in localStorage to persist changes
			const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
			localStorage.setItem(
				"user",
				JSON.stringify({
					...storedUser,
					...userData,
				})
			);
		}
	};

	// Forgot password function
	const forgotPassword = async (email) => {
		try {
			setLoading(true);
			setError(null);
			const response = await authService.forgotPassword(email);
			return response;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Reset password function
	const resetPassword = async (token, password, passwordConfirm) => {
		try {
			setLoading(true);
			setError(null);
			const response = await authService.resetPassword(
				token,
				password,
				passwordConfirm
			);
			setUser(response.data.user);
			navigate("/success");
			return response;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const value = {
		user,
		loading,
		error,
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
