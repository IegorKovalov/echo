import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormField from "../components/FormField";
import { useApi } from "../hooks/useApi";
import { validationRules } from "../utils/validationRules";

function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState("");
	const [success, setSuccess] = useState(false);

	const { loading, error: apiError, callApi } = useApi();

	const validateEmail = () => {
		const error = validationRules.validateEmail(email);
		setEmailError(error);
		return !error;
	};

	const handleChange = (e) => {
		setEmail(e.target.value);
		if (emailError) setEmailError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateEmail()) {
			return;
		}

		try {
			await callApi("post", "/users/forgotPassword", { email });
			setSuccess(true);
		} catch (err) {}
	};

	return (
		<div className="auth-container">
			<h2>Forgot Password</h2>

			{success ? (
				<div className="success-message">
					<p>Password reset email sent!</p>
					<p>
						Please check your email for instructions to reset your password.
					</p>
					<Link to="/login">Back to Login</Link>
				</div>
			) : (
				<>
					<p>
						Enter your email address and we'll send you a link to reset your
						password.
					</p>

					<form onSubmit={handleSubmit}>
						<FormField
							id="email"
							name="email"
							type="email"
							label="Email"
							value={email}
							onChange={handleChange}
							onBlur={validateEmail}
							placeholder="Enter your email address"
							error={emailError}
							required
						/>

						{apiError && <div className="api-error">{apiError}</div>}

						<button type="submit" disabled={loading}>
							{loading ? "Sending..." : "Reset Password"}
						</button>
					</form>

					<div className="form-footer">
						<Link to="/login">Back to Login</Link>
					</div>
				</>
			)}
		</div>
	);
}

export default ForgotPasswordPage;
