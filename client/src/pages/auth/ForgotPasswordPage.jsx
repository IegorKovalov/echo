import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/auth.service";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setLoading(true);
			await AuthService.forgotPassword(email);
			setSent(true);
			toast.success("Password reset email sent. Please check your inbox.");
		} catch (err) {
			const errorMessage =
				err.response?.data?.message ||
				"Failed to send password reset email. Please try again.";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-black text-white d-flex flex-column">
			<div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
				<div className="auth-card-container animate-fade-down">
					<div className="text-center mb-4">
						<h1 className="gradient-title mb-2">echo</h1>
						<p className="text-secondary">Reset your password</p>
					</div>

					<div className="space-y-6">
						<Form onSubmit={handleSubmit} className="space-y-4">
							<Form.Group className="mb-4">
								<Form.Label className="text-secondary">
									Email Address
								</Form.Label>
								<Form.Control
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="custom-input"
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
									<div className="mb-3 text-white">
										Reset link has been sent! Please check your email.
									</div>
									<Button
										type="button"
										onClick={() => setSent(false)}
										className="w-100 social-button"
									>
										Send Again
									</Button>
								</div>
							) : (
								<Button
									type="submit"
									className="w-100 gradient-button"
									disabled={loading}
								>
									{loading ? "Sending..." : "Send Reset Link"}
								</Button>
							)}
						</Form>

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
};

export default ForgotPasswordPage;
