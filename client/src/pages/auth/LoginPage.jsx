import { useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap"; // Import necessary components
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const { login } = useAuth();
	const { showToast } = useToast();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (loading) return;

		try {
			setLoading(true);
			const response = await login(email, password);
			if (response && response.data && response.data.user) {
				showToast("Login successful!", "success");
				navigate("/profile"); // Navigate to profile on successful login
			} else {
				showToast("Login failed. Unexpected response format.", "error");
			}
		} catch (err) {
			console.error("Login error:", err);
			showToast(
				err?.response?.data?.message ||
					"Failed to log in. Please check your credentials.",
				"error"
			);
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
								<p className="text-secondary">
									Where moments fade, memories remain
								</p>
							</div>

							<Form noValidate onSubmit={handleSubmit}>
								<Form.Group className="mb-3">
									<Form.Label className="fw-medium">Email</Form.Label>
									<Form.Control
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="form-control-lg rounded-3 border-light-subtle"
										placeholder="you@example.com"
									/>
								</Form.Group>

								<Form.Group className="mb-4">
									<div className="d-flex justify-content-between align-items-center">
										<Form.Label className="fw-medium">Password</Form.Label>
										<Link
											to="/forgot-password"
											className="text-primary text-decoration-none small"
										>
											Forgot password?
										</Link>
									</div>
									<Form.Control
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										className="form-control-lg rounded-3 border-light-subtle"
										placeholder="••••••••"
									/>
								</Form.Group>

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
											Logging in...
										</>
									) : (
										"Sign in"
									)}
								</Button>
							</Form>

							<div className="d-flex align-items-center my-4">
								<div className="flex-grow-1 border-top"></div>
								<div className="mx-3 text-secondary small">or</div>
								<div className="flex-grow-1 border-top"></div>
							</div>

							<p className="text-center mb-0">
								Don't have an account?{" "}
								<Link
									to="/register"
									className="text-primary text-decoration-none fw-medium"
								>
									Sign up
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

export default LoginPage;
