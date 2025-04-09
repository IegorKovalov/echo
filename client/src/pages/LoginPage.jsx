import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [formError, setFormError] = useState("");
	const [loading, setLoading] = useState(false);

	const { login } = useContext(AuthContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (formError) setFormError("");
	}, [email, password]);

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) {
			setEmailError("Email is required");
			return false;
		} else if (!emailRegex.test(email)) {
			setEmailError("Please enter a valid email address");
			return false;
		}
		setEmailError("");
		return true;
	};

	const validatePassword = (password) => {
		if (!password) {
			setPasswordError("Password is required");
			return false;
		} else if (password.length < 6) {
			setPasswordError("Password must be at least 6 characters");
			return false;
		}
		setPasswordError("");
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const isEmailValid = validateEmail(email);
		const isPasswordValid = validatePassword(password);
		if (!isEmailValid || !isPasswordValid) {
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
			login(response.data.data.user);
			navigate("/dashboard");
		} catch (err) {
			let message;

			if (err.response && err.response.data && err.response.data.message) {
				message = err.response.data.message;
			} else if (err.request) {
				message = "No response from server. Please try again later.";
			} else {
				message = "Login failed. Please try again.";
			}
			setFormError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit}>
				<div>
					<input
						type="email"
						placeholder="Enter Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						onBlur={() => validateEmail(email)}
					/>
					{emailError && <div style={{ color: "red" }}>{emailError}</div>}
				</div>

				<div>
					<input
						type="password"
						placeholder="Enter Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onBlur={() => validatePassword(password)}
					/>
					{passwordError && <div style={{ color: "red" }}>{passwordError}</div>}
				</div>

				{formError && <div style={{ color: "red" }}>{formError}</div>}

				{loading ? <p>loading...</p> : <button type="submit">Login</button>}

				<div>
					<Link to="/signup">Don't have an account? Sign up</Link>
				</div>
				<div>
					<Link to="/forgotPassword">Forgot your password?</Link>
				</div>
			</form>
		</>
	);
}

export default LoginPage;
