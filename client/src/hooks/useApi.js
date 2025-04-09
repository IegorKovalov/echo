import axios from "axios";
import { useState } from "react";

const API_BASE_URL = "http://localhost:8000/api/v1";

export const useApi = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const callApi = async (method, endpoint, data = null) => {
		setLoading(true);
		setError("");

		try {
			const response = await axios({
				method,
				url: `${API_BASE_URL}${endpoint}`,
				data,
				withCredentials: true,
			});

			return response.data;
		} catch (err) {
			let message;

			if (err.response && err.response.data && err.response.data.message) {
				message = err.response.data.message;
			} else if (err.request) {
				message = "No response from server. Please try again later.";
			} else {
				message = "Request failed. Please try again.";
			}

			setError(message);
			throw new Error(message);
		} finally {
			setLoading(false);
		}
	};

	return {
		loading,
		error,
		callApi,
		setError,
	};
};
