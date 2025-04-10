import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormField from "../components/FormField";
import AuthLayout from "../layouts/AuthLayout";

function ResetPasswordPage() {
	const [formData, setFormData] = useState({
		password: "",
		passwordConfirm: "",
	});

	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [apiError, setApiError] = useState("");

	const { token } = useParams();
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

		if (apiError) setApiError("");
	};

	const validateForm = () => {
		const newErrors = {};

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

			await axios({
				method: "patch",
				url: `http://localhost:8000/api/v1/users/resetPassword/${token}`,
				data: formData,
				withCredentials: true,
			});

			setSuccess(true);
			setTimeout(() => {
				navigate("/login");
			}, 3000);
		} catch (err) {
			let message;

			if (err.response && err.response.data && err.response.data.message) {
				message = err.response.data.message;
			} else if (err.request) {
				message = "No response from server. Please try again later.";
			} else {
				message = "Password reset failed. Please try again.";
			}
			setApiError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout title="Reset Your Password">
			{success ? (
				<div className="text-center">
					<div className="alert alert-success mb-4">
						<div className="d-flex">
							<div>Your password has been reset successfully!</div>
						</div>
					</div>
					<p className="text-muted mb-4">
						You will be redirected to the login page shortly.
					</p>
					<Link to="/login" className="btn btn-primary w-100">
						Login Now
					</Link>
				</div>
			) : (
				<>
					<p className="text-muted mb-4">
						Please enter your new password below.
					</p>

					<form onSubmit={handleSubmit}>
						<FormField
							id="password"
							name="password"
							type="password"
							label="New Password"
							value={formData.password}
							onChange={handleChange}
							placeholder="Enter new password"
							error={errors.password}
							required
						/>

						<FormField
							id="passwordConfirm"
							name="passwordConfirm"
							type="password"
							label="Confirm New Password"
							value={formData.passwordConfirm}
							onChange={handleChange}
							placeholder="Confirm new password"
							error={errors.passwordConfirm}
							required
						/>

						{apiError && (
							<div className="alert alert-danger mb-4">
								<div className="d-flex">
									<div>{apiError}</div>
								</div>
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="btn btn-primary w-100 mt-3"
						>
							{loading ? "Resetting..." : "Reset Password"}
						</button>
					</form>

					<div className="mt-4 text-center">
						<Link to="/login" className="fw-medium text-primary">
							Back to Login
						</Link>
					</div>
				</>
			)}
		</AuthLayout>
	);
}

export default ResetPasswordPage;
