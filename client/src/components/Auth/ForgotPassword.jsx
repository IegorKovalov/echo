import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/auth.service";
import "./Auth.css";
const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setError("");
			setSuccess("");
			setLoading(true);

			const response = await AuthService.forgotPassword(email);

			setSuccess(
				response.data.message ||
					"Password reset email sent. Please check your inbox."
			);
			toast.success("Password reset email sent!");
		} catch (err) {
			setError(
				err.response.data.message ||
					"Failed to send password reset email. Please try again."
			);
			setTimeout(() => {
				toast.error("Failed to send password reset email.");
			}, 1500);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="form-container">
			<h2 className="form-title">Forgot Password</h2>

			{error && <div className="error-message">{error}</div>}
			{success && <div className="success-message">{success}</div>}

			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="email" className="form-label">
						Enter your email address
					</label>
					<input
						type="email"
						id="email"
						className="form-input"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>

				<button type="submit" className="btn btn-block" disabled={loading}>
					{loading ? "Sending..." : "Send Reset Link"}
				</button>
			</form>

			<div className="text-center mt-3">
				<p>
					<Link to="/login" className="form-link">
						Back to Login
					</Link>
				</p>
			</div>
		</div>
	);
};

export default ForgotPassword;
