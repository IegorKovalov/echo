import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormField from "../components/FormField";
import { useApi } from "../hooks/useApi";
import AuthLayout from "../layouts/AuthLayout";
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
		<AuthLayout title="Forgot Password">
			{success ? (
				<div className="text-center">
					<div className="rounded-md bg-green-50 p-4 mb-4">
						<div className="flex">
							<div className="text-sm text-green-700">
								Password reset email sent!
							</div>
						</div>
					</div>
					<p className="mt-2 text-sm text-gray-600 mb-4">
						Please check your email for instructions to reset your password.
					</p>
					<Link
						to="/login"
						className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
					>
						Back to Login
					</Link>
				</div>
			) : (
				<>
					<p className="text-sm text-gray-600 mb-4">
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

						{apiError && (
							<div className="rounded-md bg-red-50 p-4 mb-4">
								<div className="flex">
									<div className="text-sm text-red-700">{apiError}</div>
								</div>
							</div>
						)}

						<button type="submit" disabled={loading} className="form-button">
							{loading ? "Sending..." : "Reset Password"}
						</button>
					</form>

					<div className="mt-6 text-center text-sm">
						<Link
							to="/login"
							className="font-medium text-primary-600 hover:text-primary-500"
						>
							Back to Login
						</Link>
					</div>
				</>
			)}
		</AuthLayout>
	);
}

export default ForgotPasswordPage;
