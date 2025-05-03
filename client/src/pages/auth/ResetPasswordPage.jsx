import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap"; // Import necessary components
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import AuthService from "../../services/auth.service";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [tokenValidating, setTokenValidating] = useState(true); // State to indicate token validation is in progress
	const [tokenValid, setTokenValid] = useState(false); // State for token validity

	const { token } = useParams();
	const { showToast } = useToast();
	const navigate = useNavigate();

	// Basic client-side token validation (optional, backend validation is crucial)
	useEffect(() => {
		if (!token) {
			setTokenValid(false);
			setError("Invalid or missing reset token");
			setTokenValidating(false);
			return;
		}
		// In a real app, you might make an API call here to validate the token
		// before rendering the form. For this example, we'll assume a non-empty token is initially considered.
		setTokenValid(true);
		setTokenValidating(false); // Assume valid for now, backend will confirm on submit
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== passwordConfirm) {
			setError("Passwords do not match");
			return;
		}
		if (loading) return;

		try {
			setError("");
			setLoading(true);

			await AuthService.resetPassword(token, password, passwordConfirm);

			showToast("Password has been reset successfully!", "success");
			navigate("/login");
		} catch (err) {
			console.error("Reset password error:", err);
			const errorMessage =
				err.response?.data?.message ||
				"Failed to reset password. The token may be invalid or expired.";
			setError(errorMessage);
			showToast(errorMessage, "error");
		} finally {
			setLoading(false);
		}
	};

	// Show loading or invalid token message while validating
	if (tokenValidating) {
		return (
			<Container fluid className="auth-container d-flex flex-column min-vh-100">
				<Row className="justify-content-center align-items-center flex-grow-1 py-5">
					<Col xs={12} sm={10} md={8} lg={6} xl={4}>
						<Card className="auth-card bg-white rounded-4 shadow-sm p-4 text-center">
							<div className="spinner-border text-primary mb-3" role="status">
								<span className="visually-hidden">Validating token...</span>
							</div>
							<p className="text-secondary">Validating reset token...</p>
						</Card>
					</Col>
				</Row>
				<footer className="py-3 text-center text-secondary">
					© 2025 Echo. All rights reserved.
				</footer>
			</Container>
		);
	}

	// Show invalid token message if validation failed
	if (!tokenValid) {
		return (
			<Container fluid className="auth-container d-flex flex-column min-vh-100">
				<Row className="justify-content-center align-items-center flex-grow-1 py-5">
					<Col xs={12} sm={10} md={8} lg={6} xl={4}>
						<Card className="auth-card bg-white rounded-4 shadow-sm p-4 p-md-5 text-center">
							<Card.Body>
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
							</Card.Body>
						</Card>
					</Col>
				</Row>
				<footer className="py-3 text-center text-secondary">
					© 2025 Echo. All rights reserved.
				</footer>
			</Container>
		);
	}

	// Render reset password form if token is valid
	return (
		<Container fluid className="auth-container d-flex flex-column min-vh-100">
			<Row className="justify-content-center align-items-center flex-grow-1 py-5">
				<Col xs={12} sm={10} md={8} lg={6} xl={4}>
					{" "}
					{/* Responsive column sizing */}
					<Card className="auth-card bg-white rounded-4 shadow-sm p-4 p-md-5">
						<Card.Body>
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
													<small className="text-success">
														Passwords match
													</small>
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
									disabled={
										loading ||
										password !== passwordConfirm ||
										!password ||
										!passwordConfirm
									} // Disable if passwords don't match or are empty
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
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<footer className="py-3 text-center text-secondary">
				© 2025 Echo. All rights reserved.
			</footer>
		</Container>
	);
};

export default ResetPasswordPage;
