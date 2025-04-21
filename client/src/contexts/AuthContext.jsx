import { createContext, useContext, useEffect, useState } from "react";
import AuthService from "../services/auth.service";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		try {
			const user = AuthService.getCurrentUser();
			if (user) {
				setCurrentUser(user);
			}
		} catch (error) {
			console.error("Error initializing auth state:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const login = async (email, password) => {
		try {
			const response = await AuthService.login(email, password);
			if (response && response.data && response.data.user) {
				setCurrentUser(response.data.user);
			}
			return response;
		} catch (error) {
			console.error("Login error in context:", error);
			throw error;
		}
	};

	const register = async (userData) => {
		try {
			const response = await AuthService.register(userData);
			if (response && response.data && response.data.user) {
				setCurrentUser(response.data.user);
			}
			return response;
		} catch (error) {
			console.error("Register error in context:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await AuthService.logout();
			setCurrentUser(null);
			return { success: true };
		} catch (error) {
			console.error("Logout error in context:", error);
			return { success: false, error };
		}
	};

	const value = {
		currentUser,
		setCurrentUser,
		login,
		register,
		logout,
		isAuthenticated: () => AuthService.isAuthenticated(),
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
