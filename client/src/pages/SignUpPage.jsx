import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import AuthContext from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import AuthLayout from "../layouts/AuthLayout";
import { validationRules } from "../utils/validationRules";

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
	const { login } = useContext(AuthContext);
	const navigate = useNavigate();
	const { loading, error: apiError, callApi } = useApi();

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

	const validateField = (name, value = null) => {
		const fieldValue = value !== null ? value : formData[name];
		let error = "";
		switch (name) {
			case "username":
				error = validationRules.validateUsername(fieldValue);
				break;
			case "email":
				error = validationRules.validateEmail(fieldValue);
				break;
			case "password":
				error = validationRules.validatePassword(fieldValue);
				break;
			case "passwordConfirm":
				error = validationRules.validatePasswordConfirm(
					formData.password,
					fieldValue
				);
				break;
			case "fullName":
				error = validationRules.validateFullName(fieldValue);
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
			username: validationRules.validateUsername(formData.username),
			email: validationRules.validateEmail(formData.email),
			password: validationRules.validatePassword(formData.password),
			passwordConfirm: validationRules.validatePasswordConfirm(
				formData.password,
				formData.passwordConfirm
			),
			fullName: validationRules.validateFullName(formData.fullName),
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
			const response = await callApi("post", "/users/signup", formData);
			if (response.data && response.data.user) {
				login(response.data.user);
				navigate("/");
			} else {
				navigate("/login");
			}
		} catch (err) {}
	};

	return (
		<AuthLayout title="Create an Account">
			<form onSubmit={handleSubmit}>
				<FormField
					id="username"
					name="username"
					type="text"
					label="Username"
					value={formData.username}
					onChange={handleChange}
					onBlur={() => validateField("username")}
					placeholder="Enter username"
					error={errors.username}
					required
				/>

				<FormField
					id="email"
					name="email"
					type="email"
					label="Email"
					value={formData.email}
					onChange={handleChange}
					onBlur={() => validateField("email")}
					placeholder="Enter email"
					error={errors.email}
					required
				/>

				<FormField
					id="fullName"
					name="fullName"
					type="text"
					label="Full Name"
					value={formData.fullName}
					onChange={handleChange}
					onBlur={() => validateField("fullName")}
					placeholder="Enter your full name"
					error={errors.fullName}
					required
				/>

				<FormField
					id="password"
					name="password"
					type="password"
					label="Password"
					value={formData.password}
					onChange={handleChange}
					onBlur={() => validateField("password")}
					placeholder="Enter password (8+ characters)"
					error={errors.password}
					autoComplete="new-password"
					required
				/>

				<FormField
					id="passwordConfirm"
					name="passwordConfirm"
					type="password"
					label="Confirm Password"
					value={formData.passwordConfirm}
					onChange={handleChange}
					onBlur={() => validateField("passwordConfirm")}
					placeholder="Confirm password"
					error={errors.passwordConfirm}
					autoComplete="new-password"
					required
				/>

				<FormField
					id="profilePicture"
					name="profilePicture"
					type="text"
					label="Profile Picture URL"
					value={formData.profilePicture}
					onChange={handleChange}
					placeholder="Enter profile picture URL (optional)"
					error={errors.profilePicture}
				/>

				{apiError && <div className="alert alert-danger mb-3">{apiError}</div>}

				<button
					type="submit"
					disabled={loading}
					className="btn btn-primary w-100 mt-3"
				>
					{loading ? "Creating Account..." : "Sign Up"}
				</button>
			</form>

			<div className="mt-4 text-center">
				Already have an account?{" "}
				<Link to="/login" className="fw-medium text-primary">
					Login
				</Link>
			</div>
		</AuthLayout>
	);
}

export default SignupPage;
