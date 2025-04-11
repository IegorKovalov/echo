import axios from "axios";
import { createContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const response = await axios({
					method: "get",
					url: "http://localhost:8000/api/v1/users/me",
					withCredentials: true,
				});

				if (response.data.status === "success") {
					setUser(response.data.data.user);
					setIsAuthenticated(true);
				}
			} catch (err) {
				setUser(null);
				setIsAuthenticated(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuthStatus();
	}, []);

	const login = async (email, password) => {
		setIsLoading(true);
		try {
			const response = await axios({
				method: "post",
				url: "http://localhost:8000/api/v1/users/login",
				data: { email, password },
				withCredentials: true,
			});

			if (response.data.status === "success") {
				setUser(response.data.data.user);
				setIsAuthenticated(true);
				return { success: true };
			}
		} catch (err) {
			let message;
			if (err.response && err.response.data && err.response.data.message) {
				message = err.response.data.message;
			} else if (err.request) {
				message = "No response from server. Please try again later.";
			} else {
				message = "Login failed. Please try again.";
			}
			return { success: false, message };
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		setIsLoading(true);
		try {
			await axios({
				method: "get",
				url: "http://localhost:8000/api/v1/users/logout",
				withCredentials: true,
			});
			setUser(null);
			setIsAuthenticated(false);
			return { success: true };
		} catch (err) {
			let message;
			if (err.response && err.response.data && err.response.data.message) {
				message = err.response.data.message;
			} else if (err.request) {
				message = "No response from server. Please try again later.";
			} else {
				message = "Logout failed. Please try again.";
			}
			return { success: false, message };
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthContext.Provider
			value={{ user, isAuthenticated, isLoading, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
