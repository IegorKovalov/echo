import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import AuthContext from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import { validationRules } from "../utils/validationRules";

function LoginPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
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
		setLoading(true);
		setApiError("");

		if (!validateForm()) {
			setLoading(false);
			return;
		}

		try {
			// Use the context login method directly - no need for separate API call
			const result = await login(formData.email, formData.password);

			if (result.success) {
				navigate("/");
			} else {
				setApiError(result.message);
			}
		} catch (err) {
			setApiError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout title="Log In to Your Account">
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

				{apiError && <div className="alert alert-danger mb-3">{apiError}</div>}

				<button
					type="submit"
					disabled={loading}
					className="btn btn-primary w-100 mt-3"
				>
					{loading ? "Logging in..." : "Log In"}
				</button>
			</form>

			<div className="mt-4 text-center">
				<div className="mb-2">
					<Link to="/signup" className="fw-medium text-primary">
						Don't have an account? Sign up
					</Link>
				</div>
				<div>
					<Link to="/forgotPassword" className="fw-medium text-primary">
						Forgot your password?
					</Link>
				</div>
			</div>
		</AuthLayout>
	);
}

export default LoginPage;
