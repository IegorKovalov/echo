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
			setUser(response.data.user);
			navigate("/"); // Navigate to home page instead of verification
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
