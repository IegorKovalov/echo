import axios from "axios";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function SignupPage() {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		passwordConfirm: "",
		fullName: "",
		profilePicture: "",
	});

	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [apiError, setApiError] = useState("");

	const { login } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
		if (errors[name]) {
			setErrors({
				...errors,
				[name]: "",
			});
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.username) {
			newErrors.username = "Username is required";
		} else if (formData.username.length < 3) {
			newErrors.username = "Username must be at least 3 characters";
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (!emailRegex.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		if (!formData.passwordConfirm) {
			newErrors.passwordConfirm = "Please confirm your password";
		} else if (formData.password !== formData.passwordConfirm) {
			newErrors.passwordConfirm = "Passwords do not match";
		}

		if (!formData.fullName) {
			newErrors.fullName = "Full name is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			setLoading(true);
			setApiError("");

			const response = await axios({
				method: "post",
				url: "http://localhost:8000/api/v1/users/signup",
				data: formData,
				withCredentials: true,
			});

			if (response.data.data && response.data.data.user) {
				login(response.data.data.user);
				navigate("/dashboard");
			} else {
				navigate("/login");
			}
		} catch (err) {
			let message;

			if (err.response && err.response.data && err.response.data.message) {
				message = err.response.data.message;
			} else if (err.request) {
				message = "No response from server. Please try again later.";
			} else {
				message = "Signup failed. Please try again.";
			}
			setApiError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="signup-container">
			<h2>Create an Account</h2>

			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="username">Username</label>
					<input
						type="text"
						id="username"
						name="username"
						value={formData.username}
						onChange={handleChange}
						placeholder="Enter username"
					/>
					{errors.username && <div className="error">{errors.username}</div>}
				</div>

				<div className="form-group">
					<label htmlFor="email">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="Enter email"
					/>
					{errors.email && <div className="error">{errors.email}</div>}
				</div>

				<div className="form-group">
					<label htmlFor="fullName">Full Name</label>
					<input
						type="text"
						id="fullName"
						name="fullName"
						value={formData.fullName}
						onChange={handleChange}
						placeholder="Enter your full name"
					/>
					{errors.fullName && <div className="error">{errors.fullName}</div>}
				</div>

				<div className="form-group">
					<label htmlFor="password">Password</label>
					<input
						type="password"
						id="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						placeholder="Enter password"
					/>
					{errors.password && <div className="error">{errors.password}</div>}
				</div>

				<div className="form-group">
					<label htmlFor="passwordConfirm">Confirm Password</label>
					<input
						type="password"
						id="passwordConfirm"
						name="passwordConfirm"
						value={formData.passwordConfirm}
						onChange={handleChange}
						placeholder="Confirm password"
					/>
					{errors.passwordConfirm && (
						<div className="error">{errors.passwordConfirm}</div>
					)}
				</div>

				<div className="form-group">
					<label htmlFor="profilePicture">Profile Picture URL (optional)</label>
					<input
						type="text"
						id="profilePicture"
						name="profilePicture"
						value={formData.profilePicture}
						onChange={handleChange}
						placeholder="Enter profile picture URL"
					/>
				</div>

				{apiError && <div className="api-error">{apiError}</div>}

				<button type="submit" disabled={loading}>
					{loading ? "Creating Account..." : "Sign Up"}
				</button>
			</form>

			<div className="form-footer">
				Already have an account? <Link to="/login">Login</Link>
			</div>
		</div>
	);
}

export default SignupPage;
