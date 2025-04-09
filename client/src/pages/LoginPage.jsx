import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";

function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email || !password) {
			const message = "Please fill in all fields";
			setError(message);
			alert(message);
			return;
		}
		try {
			setLoading(true);
			const response = await axios({
				method: "post",
				url: "http://localhost:8000/api/v1/users/login",
				data: {
					email,
					password,
				},
				withCredentials: true,
			});
			console.log(response);
			setLoading(false);
		} catch (err) {
			let message;

			if (err.response && err.response.data && err.response.data.message) {
				message = err.response.data.message;
			} else if (err.request) {
				message = "No response from server. Please try again later.";
			} else {
				message = "Login failed. Please try again.";
			}
			setError(message);
			setLoading(false);
			alert(message);
		}
	};
	return (
		<>
			<form onSubmit={handleSubmit}>
				<input
					type="email"
					placeholder="Enter Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				></input>
				<input
					type="password"
					placeholder="Enter Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				></input>
				{loading ? <p>loading...</p> : <button type="submit">Login</button>}
				<Link to="/signup">Don't have an account? Sign up</Link>
				<Link to="/forgotPassword">Forgot your password?</Link>
			</form>
		</>
	);
}

export default LoginPage;
