import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import AuthContext from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { validationRules } from "../utils/validationRules";

function LoginPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState({});

	const { login } = useContext(AuthContext);
	const navigate = useNavigate();
	const { loading, error: apiError, callApi, setError: setApiError } = useApi();

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
		if (apiError) {
			setApiError("");
		}
	};
	const validateField = (name, value) => {
		let error = "";
		switch (name) {
			case "email":
				error = validationRules.validateEmail(value);
				break;
			case "password":
				error = validationRules.validatePassword(value);
				break;
			default:
				break;
		}
		setErrors({
			...errors,
			[name]: error,
		});

		return !error;
	};
	const validateForm = () => {
		const newErrors = {
			email: validationRules.validateEmail(formData.email),
			password: validationRules.validatePassword(formData.password),
		};
		setErrors(newErrors);
		return !Object.values(newErrors).some((error) => error);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}
		try {
			const response = await callApi("post", "/users/login", {
				email: formData.email,
				password: formData.password,
			});

			login(response.data.user);
			navigate("/dashboard");
		} catch (err) {}
	};

	return (
		<div className="auth-container">
			<h2>Log In</h2>

			<form onSubmit={handleSubmit}>
				<FormField
					id="email"
					name="email"
					type="email"
					label="Email"
					value={formData.email}
					onChange={handleChange}
					onBlur={() => validateField("email", formData.email)}
					placeholder="Enter your email"
					error={errors.email}
					required
				/>

				<FormField
					id="password"
					name="password"
					type="password"
					label="Password"
					value={formData.password}
					onChange={handleChange}
					onBlur={() => validateField("password", formData.password)}
					placeholder="Enter your password"
					error={errors.password}
					autoComplete="current-password"
					required
				/>

				{apiError && <div className="api-error">{apiError}</div>}

				<button type="submit" disabled={loading}>
					{loading ? "Logging in..." : "Log In"}
				</button>
			</form>

			<div className="form-footer">
				<div>
					<Link to="/signup">Don't have an account? Sign up</Link>
				</div>
				<div>
					<Link to="/forgotPassword">Forgot your password?</Link>
				</div>
			</div>
		</div>
	);
}

export default LoginPage;
