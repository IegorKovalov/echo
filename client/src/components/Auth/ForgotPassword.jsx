import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/auth.service";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
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
		<Container fluid className="auth-container">
			<div className="auth-brand-column">
				<div className="auth-brand-pattern" />
				<div className="auth-brand-content">
					<h1 className="auth-brand-title">Reset Your Password</h1>
					<p className="auth-brand-subtitle">
						Enter your email address and we'll send you a link to reset your password.
					</p>
					<div className="auth-brand-features">
						<div className="auth-brand-feature">
							<i className="fas fa-envelope" />
							<span>Check your email for reset instructions</span>
						</div>
						<div className="auth-brand-feature">
							<i className="fas fa-clock" />
							<span>Reset link expires in 1 hour</span>
						</div>
						<div className="auth-brand-feature">
							<i className="fas fa-shield-alt" />
							<span>Secure password reset process</span>
						</div>
					</div>
				</div>
			</div>
			<Card className="auth-card">
				<Card.Body>
					<Card.Title className="text-center mb-4">Forgot Password</Card.Title>

					{error && (
						<Alert variant="danger" className="mb-4">
							{error}
						</Alert>
					)}

					{success && (
						<Alert variant="success" className="mb-4">
							{success}
						</Alert>
					)}

					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-4">
							<Form.Label>Enter your email address</Form.Label>
							<Form.Control
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="form-input"
								placeholder="Enter your email"
							/>
						</Form.Group>

						<Button
							variant="primary"
							type="submit"
							className="w-100 mb-3"
							disabled={loading}
						>
							{loading ? "Sending..." : "Send Reset Link"}
						</Button>
					</Form>

					<div className="text-center">
						<p className="mb-0">
							<Link to="/login" className="form-link">
								Back to Login
							</Link>
						</p>
					</div>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default ForgotPassword;
