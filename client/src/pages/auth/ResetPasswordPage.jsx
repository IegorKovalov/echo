import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import AuthService from "../../services/auth.service";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [tokenValid, setTokenValid] = useState(true);

	const { token } = useParams();
	const { showToast } = useToast();
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

			showToast("Password has been reset successfully!", "success");
			navigate("/login");
		} catch (err) {
			setError(
				err.response?.data?.message ||
					"Failed to reset password. The token may be invalid or expired."
			);
			setTimeout(() => {
				showToast(error || "An error occurred", "error");
			}, 1000);
		} finally {
			setLoading(false);
		}
	};

	if (!tokenValid) {
		return (
			<div className="auth-container d-flex flex-column min-vh-100 bg-light">
				<div className="auth-content flex-grow-1 d-flex align-items-center justify-content-center py-5">
					<div
						className="auth-card bg-white rounded-4 shadow-sm p-4 p-md-5 mx-auto"
						style={{ maxWidth: "450px" }}
					>
						<div className="text-center mb-4">
							<h1 className="display-5 fw-bold text-primary mb-2">echo</h1>
							<p className="text-secondary">Password Reset Failed</p>
						</div>

						<div className="alert alert-danger py-3 rounded-3 mb-4">
							{error ||
								"Invalid or expired reset token. Please request a new password reset."}
						</div>

						<div className="text-center">
							<Link
								to="/forgot-password"
								className="btn btn-primary btn-lg rounded-3 px-4"
							>
								Request New Reset Link
							</Link>
						</div>

						<p className="text-center mt-4 mb-0">
							Remember your password?{" "}
							<Link
								to="/login"
								className="text-primary text-decoration-none fw-medium"
							>
								Back to Login
							</Link>
						</p>
					</div>
				</div>

				<footer className="py-3 text-center text-secondary">
					© 2025 Echo. All rights reserved.
				</footer>
			</div>
		);
	}

	return (
		<div className="auth-container d-flex flex-column min-vh-100 bg-light">
			<div className="auth-content flex-grow-1 d-flex align-items-center justify-content-center py-5">
				<div
					className="auth-card bg-white rounded-4 shadow-sm p-4 p-md-5 mx-auto"
					style={{ maxWidth: "450px" }}
				>
					<div className="text-center mb-4">
						<h1 className="display-5 fw-bold text-primary mb-2">echo</h1>
						<p className="text-secondary">Create your new password</p>
					</div>

					{error && (
						<div className="alert alert-danger py-2 rounded-3 mb-3">
							{error}
						</div>
					)}

					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label className="fw-medium">New Password</Form.Label>
							<Form.Control
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								minLength="8"
								required
								className="form-control-lg rounded-3 border-light-subtle"
								placeholder="Enter new password"
							/>
						</Form.Group>

						<Form.Group className="mb-4">
							<Form.Label className="fw-medium">
								Confirm New Password
							</Form.Label>
							<Form.Control
								type="password"
								value={passwordConfirm}
								onChange={(e) => setPasswordConfirm(e.target.value)}
								minLength="8"
								required
								className="form-control-lg rounded-3 border-light-subtle"
								placeholder="Confirm your new password"
							/>
							{password && passwordConfirm && (
								<div className="mt-2 d-flex align-items-center">
									{password === passwordConfirm ? (
										<>
											<div className="text-success rounded-circle bg-success bg-opacity-10 p-1 me-2">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													fill="currentColor"
													className="bi bi-check"
													viewBox="0 0 16 16"
												>
													<path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
												</svg>
											</div>
											<small className="text-success">Passwords match</small>
										</>
									) : (
										<>
											<div className="text-danger rounded-circle bg-danger bg-opacity-10 p-1 me-2">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													fill="currentColor"
													className="bi bi-x"
													viewBox="0 0 16 16"
												>
													<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
												</svg>
											</div>
											<small className="text-danger">
												Passwords don't match
											</small>
										</>
									)}
								</div>
							)}
						</Form.Group>

						<Button
							type="submit"
							className="w-100 btn-lg btn-primary rounded-3"
							disabled={loading || password !== passwordConfirm}
						>
							{loading ? (
								<>
									<span
										className="spinner-border spinner-border-sm me-2"
										role="status"
										aria-hidden="true"
									></span>
									Resetting...
								</>
							) : (
								"Reset Password"
							)}
						</Button>
					</Form>

					<p className="text-center mt-4 mb-0">
						<Link
							to="/login"
							className="text-primary text-decoration-none fw-medium"
						>
							Back to Login
						</Link>
					</p>
				</div>
			</div>

			<footer className="py-3 text-center text-secondary">
				© 2025 Echo. All rights reserved.
			</footer>
		</div>
	);
};

export default ResetPasswordPage;
