import axios from "axios";
import { createContext, useEffect, useState } from "react";
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const login = (userData) => {
		setUser(userData);
		setIsAuthenticated(true);
	};

	const logout = async () => {
		setUser(null);
		setIsAuthenticated(false);
		try {
			const response = await axios({
				method: "get",
				url: "http://localhost:8000/api/v1/users/logout",
				withCredentials: true,
			});
			console.log(response);
		} catch (err) {
			let message;
			if (err.response && err.response.data && err.response.data.message) {
				message = err.response.data.message;
			} else if (err.request) {
				message = "No response from server. Please try again later.";
			} else {
				message = "Logout failed. Please try again.";
			}
			alert(message);
		}
	};

	return (
		<AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
