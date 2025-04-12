import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/auth.service";
import "./Auth.css";

const ResetPassword = () => {
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [tokenValid, setTokenValid] = useState(true);

	const { token } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (!token) {
			setTokenValid(false);
			setError("Invalid or missing reset token");
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== passwordConfirm) {
			return setError("Passwords do not match");
		}

		try {
			setError("");
			setLoading(true);

			await AuthService.resetPassword(token, password, passwordConfirm);

			toast.success("Password has been reset successfully!");
			navigate("/login");
		} catch (err) {
			setError(
				err.response.data.message ||
					"Failed to reset password. The token may be invalid or expired."
			);
			setTimeout(() => {
				toast.error("Failed to reset password.");
			}, 1000);
		} finally {
			setLoading(false);
		}
	};

	if (!tokenValid) {
		return (
			<div className="form-container">
				<h2 className="form-title">Password Reset Failed</h2>
				<div className="error-message">{error}</div>
				<div className="text-center mt-3">
					<Link to="/forgot-password" className="btn">
						Request a new reset link
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="form-container">
			<h2 className="form-title">Reset Password</h2>

			{error && <div className="error-message">{error}</div>}

			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="password" className="form-label">
						New Password
					</label>
					<input
						type="password"
						id="password"
						className="form-input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						minLength="8"
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="passwordConfirm" className="form-label">
						Confirm New Password
					</label>
					<input
						type="password"
						id="passwordConfirm"
						className="form-input"
						value={passwordConfirm}
						onChange={(e) => setPasswordConfirm(e.target.value)}
						minLength="8"
						required
					/>
				</div>

				<button type="submit" className="btn btn-block" disabled={loading}>
					{loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
