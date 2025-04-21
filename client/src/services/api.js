import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

const api = axios.create({
	baseURL: API_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		if (config.data instanceof FormData) {
			delete config.headers["Content-Type"];
		} else if (config.headers["Content-Type"] !== "multipart/form-data") {
			config.headers["Content-Type"] = "application/json";
		}

		return config;
	},
	(error) => {
		console.error("Request interceptor error:", error);
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			if (!window.location.pathname.includes("/login")) {
				localStorage.removeItem("token");
				localStorage.removeItem("user");

				window.history.pushState({}, "", "/login");

				window.dispatchEvent(new Event("popstate"));
			}
		}

		return Promise.reject(error);
	}
);

export default api;
