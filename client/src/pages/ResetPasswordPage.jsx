import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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
		<div>
			<h2>Reset Your Password</h2>

			{success ? (
				<div>
					<p>Your password has been reset successfully!</p>
					<p>You will be redirected to the login page shortly.</p>
					<Link to="/login">Login Now</Link>
				</div>
			) : (
				<>
					<p>Please enter your new password below.</p>

					<form onSubmit={handleSubmit}>
						<div>
							<label htmlFor="password">New Password</label>
							<input
								type="password"
								id="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Enter new password"
							/>
							{errors.password && <div>{errors.password}</div>}
						</div>

						<div>
							<label htmlFor="passwordConfirm">Confirm New Password</label>
							<input
								type="password"
								id="passwordConfirm"
								name="passwordConfirm"
								value={formData.passwordConfirm}
								onChange={handleChange}
								placeholder="Confirm new password"
							/>
							{errors.passwordConfirm && <div>{errors.passwordConfirm}</div>}
						</div>

						{apiError && <div>{apiError}</div>}

						<button type="submit" disabled={loading}>
							{loading ? "Resetting..." : "Reset Password"}
						</button>
					</form>

					<div>
						<Link to="/login">Back to Login</Link>
					</div>
				</>
			)}
		</div>
	);
}

export default ResetPasswordPage;
