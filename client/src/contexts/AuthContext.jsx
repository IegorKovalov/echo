import { createContext, useContext, useEffect, useState } from "react";
import AuthService from "../services/auth.service";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const user = AuthService.getCurrentUser();
		if (user) {
			setCurrentUser(user);
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			const response = await AuthService.login(email, password);
			setCurrentUser(response.data.user);
			return response;
		} catch (error) {
			throw error;
		}
	};

	const register = async (userData) => {
		try {
			const response = await AuthService.register(userData);
			setCurrentUser(response.data.user);
			return response;
		} catch (error) {
			throw error;
		}
	};
	const logout = async () => {
		try {
			await AuthService.logout();
			setCurrentUser(null);
			return { success: true };
		} catch (error) {
			console.error("Logout error", error);
			return { success: false, error };
		}
	};

	const value = {
		currentUser,
		setCurrentUser,
		login,
		register,
		logout,
		isAuthenticated: AuthService.isAuthenticated,
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
