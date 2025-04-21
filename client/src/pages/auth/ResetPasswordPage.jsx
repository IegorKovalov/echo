import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/auth.service";

const ResetPasswordPage = () => {
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
				err.response?.data?.message ||
					"Failed to reset password. The token may be invalid or expired."
			);
			setTimeout(() => {
				toast.error(error || "An error occurred");
			}, 1000);
		} finally {
			setLoading(false);
		}
	};

	if (!tokenValid) {
		return (
			<div className="min-h-screen bg-black text-white d-flex flex-column">
				<div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
					<div className="auth-card-container animate-fade-down">
						<div className="text-center mb-4">
							<h1 className="gradient-title mb-2">echo</h1>
							<p className="text-secondary">Password Reset Failed</p>
						</div>

						<div className="space-y-6">
							<div className="text-center p-3 bg-danger bg-opacity-10 rounded-3 mb-4 text-white">
								{error ||
									"Invalid or expired reset token. Please request a new password reset."}
							</div>

							<div className="text-center">
								<Link
									to="/forgot-password"
									className="gradient-button btn d-inline-block"
								>
									Request New Reset Link
								</Link>
							</div>

							<p className="text-center mt-4 text-secondary">
								Remember your password?{" "}
								<Link to="/login" className="signup-link">
									Back to Login
								</Link>
							</p>
						</div>
					</div>
				</div>

				<footer className="py-3 text-center text-secondary">
					© 2025 Echo. All rights reserved.
				</footer>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-white d-flex flex-column">
			<div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
				<div className="auth-card-container animate-fade-down">
					<div className="text-center mb-4">
						<h1 className="gradient-title mb-2">echo</h1>
						<p className="text-secondary">Create your new password</p>
					</div>

					<div className="space-y-6">
						<Form onSubmit={handleSubmit} className="space-y-4">
							<Form.Group className="mb-3">
								<Form.Label className="text-secondary">New Password</Form.Label>
								<Form.Control
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									minLength="8"
									required
									className="custom-input"
									placeholder="Enter new password"
								/>
							</Form.Group>

							<Form.Group className="mb-4">
								<Form.Label className="text-secondary">
									Confirm New Password
								</Form.Label>
								<Form.Control
									type="password"
									value={passwordConfirm}
									onChange={(e) => setPasswordConfirm(e.target.value)}
									minLength="8"
									required
									className="custom-input"
									placeholder="Confirm your new password"
								/>
								{password && passwordConfirm && (
									<div className="mt-2">
										{password === passwordConfirm ? (
											<small className="text-success">Passwords match</small>
										) : (
											<small className="text-danger">
												Passwords don't match
											</small>
										)}
									</div>
								)}
							</Form.Group>

							<Button
								type="submit"
								className="w-100 gradient-button"
								disabled={loading || password !== passwordConfirm}
							>
								{loading ? "Resetting..." : "Reset Password"}
							</Button>
						</Form>

						<p className="text-center mt-4 text-secondary">
							<Link to="/login" className="signup-link">
								Back to Login
							</Link>
						</p>
					</div>
				</div>
			</div>

			<footer className="py-3 text-center text-secondary">
				© 2025 Echo. All rights reserved.
			</footer>
		</div>
	);
};

export default ResetPasswordPage;
