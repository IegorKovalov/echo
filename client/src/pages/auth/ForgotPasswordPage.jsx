import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import AuthService from "../../services/auth.service";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const { showToast } = useToast();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setLoading(true);
			await AuthService.forgotPassword(email);
			setSent(true);
			showToast(
				"Password reset email sent. Please check your inbox.",
				"success"
			);
		} catch (err) {
			const errorMessage =
				err.response?.data?.message ||
				"Failed to send password reset email. Please try again.";
			showToast(errorMessage, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-container d-flex flex-column min-vh-100 bg-light">
			<div className="auth-content flex-grow-1 d-flex align-items-center justify-content-center py-5">
				<div
					className="auth-card bg-white rounded-4 shadow-sm p-4 p-md-5 mx-auto"
					style={{ maxWidth: "450px" }}
				>
					<div className="text-center mb-4">
						<h1 className="display-5 fw-bold text-primary mb-2">echo</h1>
						<p className="text-secondary">Reset your password</p>
					</div>

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
								disabled={sent}
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
								>
									Send Again
								</Button>
							</div>
						) : (
							<Button
								type="submit"
								className="w-100 btn-lg btn-primary rounded-3"
								disabled={loading}
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
				</div>
			</div>

			<footer className="py-3 text-center text-secondary">
				© 2025 Echo. All rights reserved.
			</footer>
		</div>
	);
};

export default ForgotPasswordPage;
