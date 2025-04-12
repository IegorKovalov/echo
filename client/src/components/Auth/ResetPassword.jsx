import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/auth.service";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
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
			<Container fluid className="auth-container">
				<div className="auth-brand-column">
					<div className="auth-brand-pattern" />
					<div className="auth-brand-content">
						<h1 className="auth-brand-title">Password Reset Failed</h1>
						<p className="auth-brand-subtitle">
							The password reset link is invalid or has expired.
						</p>
						<div className="auth-brand-features">
							<div className="auth-brand-feature">
								<i className="fas fa-exclamation-triangle" />
								<span>Invalid or expired reset link</span>
							</div>
							<div className="auth-brand-feature">
								<i className="fas fa-redo" />
								<span>Request a new reset link</span>
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
						<Card.Title className="text-center mb-4">Password Reset Failed</Card.Title>
						<Alert variant="danger" className="mb-4">
							{error}
						</Alert>
						<div className="text-center">
							<Link to="/forgot-password" className="btn btn-primary">
								Request a new reset link
							</Link>
						</div>
					</Card.Body>
				</Card>
			</Container>
		);
	}

	return (
		<Container fluid className="auth-container">
			<div className="auth-brand-column">
				<div className="auth-brand-pattern" />
				<div className="auth-brand-content">
					<h1 className="auth-brand-title">Set New Password</h1>
					<p className="auth-brand-subtitle">
						Create a strong password to secure your account.
					</p>
					<div className="auth-brand-features">
						<div className="auth-brand-feature">
							<i className="fas fa-key" />
							<span>Create a strong password</span>
						</div>
						<div className="auth-brand-feature">
							<i className="fas fa-check-circle" />
							<span>Confirm your new password</span>
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
					<Card.Title className="text-center mb-4">Reset Password</Card.Title>

					{error && (
						<Alert variant="danger" className="mb-4">
							{error}
						</Alert>
					)}

					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>New Password</Form.Label>
							<Form.Control
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								minLength="8"
								required
								className="form-input"
								placeholder="Enter new password"
							/>
						</Form.Group>

						<Form.Group className="mb-4">
							<Form.Label>Confirm New Password</Form.Label>
							<Form.Control
								type="password"
								value={passwordConfirm}
								onChange={(e) => setPasswordConfirm(e.target.value)}
								minLength="8"
								required
								className="form-input"
								placeholder="Confirm new password"
							/>
						</Form.Group>

						<Button
							variant="primary"
							type="submit"
							className="w-100 mb-3"
							disabled={loading}
						>
							{loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
