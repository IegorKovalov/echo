import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [apiError, setApiError] = useState("");

	const validateEmail = () => {
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

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateEmail()) {
			return;
		}

		try {
			setLoading(true);
			setApiError("");

			await axios({
				method: "post",
				url: "http://localhost:8000/api/v1/users/forgotPassword",
				data: { email },
				withCredentials: true,
			});

			setSuccess(true);
		} catch (err) {
			let message;

			if (err.response && err.response.data && err.response.data.message) {
				message = err.response.data.message;
			} else if (err.request) {
				message = "No response from server. Please try again later.";
			} else {
				message = "Request failed. Please try again.";
			}
			setApiError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="forgot-password-container">
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
						<div className="form-group">
							<label htmlFor="email">Email</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									if (emailError) setEmailError("");
									if (apiError) setApiError("");
								}}
								placeholder="Enter your email address"
							/>
							{emailError && <div className="error">{emailError}</div>}
						</div>

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
