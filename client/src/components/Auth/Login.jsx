import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import "./Auth.css";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setError("");
			setLoading(true);
			await login(email, password);
			toast.success("Login successful!");
			navigate("/profile");
		} catch (err) {
			setError(
				err.response?.data?.message ||
					"Failed to log in. Please check your credentials."
			);
			toast.error("Login failed. Please check your credentials.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container fluid className="auth-container">
			<div className="auth-brand-column">
				<div className="auth-brand-pattern" />
				<div className="auth-brand-content">
					<h1 className="auth-brand-title">Welcome Back!</h1>
					<p className="auth-brand-subtitle">
						Connect with friends, share your thoughts, and discover new content.
					</p>
					<div className="auth-brand-features">
						<div className="auth-brand-feature">
							<i className="fas fa-users" />
							<span>Connect with friends and family</span>
						</div>
						<div className="auth-brand-feature">
							<i className="fas fa-share-alt" />
							<span>Share your thoughts and experiences</span>
						</div>
						<div className="auth-brand-feature">
							<i className="fas fa-globe" />
							<span>Discover new content and communities</span>
						</div>
					</div>
				</div>
			</div>
			<Card className="auth-card">
				<Card.Body>
					<Card.Title className="text-center mb-4">Login to Your Account</Card.Title>

					{error && (
						<Alert variant="danger" className="mb-4">
							{error}
						</Alert>
					)}

					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="form-input"
								placeholder="Enter your email"
							/>
						</Form.Group>

						<Form.Group className="mb-4">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="form-input"
								placeholder="Enter your password"
							/>
						</Form.Group>

						<Button
							variant="primary"
							type="submit"
							className="w-100 mb-3"
							disabled={loading}
						>
							{loading ? "Logging in..." : "Login"}
						</Button>
					</Form>

					<div className="text-center">
						<p className="mb-2">
							<Link to="/forgot-password" className="form-link">
								Forgot Password?
							</Link>
						</p>
						<p className="mb-0">
							Don't have an account?{" "}
							<Link to="/register" className="form-link">
								Register
							</Link>
						</p>
					</div>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default Login;
