import { useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap"; // Import necessary components
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import AuthService from "../../services/auth.service";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState(""); // Local error state

	const { showToast } = useToast();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (loading) return;

		try {
			setLoading(true);
			setError(""); // Clear previous errors
			await AuthService.forgotPassword(email);
			setSent(true);
			showToast(
				"Password reset email sent. Please check your inbox.",
				"success"
			);
		} catch (err) {
			console.error("Forgot password error:", err);
			const errorMessage =
				err.response?.data?.message ||
				"Failed to send password reset email. Please try again.";
			showToast(errorMessage, "error");
			setError(errorMessage); // Display error below form
		} finally {
			setLoading(false);
		}
	};

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
								<p className="text-secondary">Reset your password</p>
							</div>

							{error && (
								<div className="alert alert-danger py-2 rounded-3 mb-3">
									{error}
								</div>
							)}

							<Form onSubmit={handleSubmit}>
								<Form.Group className="mb-4">
									<Form.Label className="fw-medium">Email Address</Form.Label>
									<Form.Control
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="form-control-lg rounded-3 border-light-subtle"
										placeholder="Enter your email"
										disabled={sent || loading} // Disable if sent or loading
									/>
									<Form.Text className="text-secondary mt-2 d-block">
										We'll send you an email with instructions to reset your
										password.
									</Form.Text>
								</Form.Group>

								{sent ? (
									<div className="text-center mt-4">
										<div className="alert alert-success py-3 rounded-3">
											Reset link has been sent! Please check your email.
										</div>
										<Button
											type="button"
											onClick={() => setSent(false)}
											className="w-100 btn-lg btn-outline-primary rounded-3 mt-3"
											disabled={loading}
										>
											Send Again
										</Button>
									</div>
								) : (
									<Button
										type="submit"
										className="w-100 btn-lg btn-primary rounded-3"
										disabled={loading || !email.trim()} // Disable if loading or email is empty
									>
										{loading ? (
											<>
												<span
													className="spinner-border spinner-border-sm me-2"
													role="status"
													aria-hidden="true"
												></span>
												Sending...
											</>
										) : (
											"Send Reset Link"
										)}
									</Button>
								)}
							</Form>

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
};

export default ForgotPasswordPage;
