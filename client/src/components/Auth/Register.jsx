import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import "./Auth.css";

const Register = () => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		fullName: "",
		password: "",
		passwordConfirm: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { register } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.passwordConfirm) {
			return setError("Passwords do not match");
		}

		try {
			setError("");
			setLoading(true);
			await register(formData);
			toast.success("Registration successful!");
			navigate("/profile");
		} catch (err) {
			setError(
				err.response?.data?.message ||
					"Failed to create an account. Please try again."
			);
			toast.error("Registration failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container fluid className="auth-container">
			<div className="auth-brand-column">
				<div className="auth-brand-pattern" />
				<div className="auth-brand-content">
					<h1 className="auth-brand-title">Join Our Community</h1>
					<p className="auth-brand-subtitle">
						Create your account and start connecting with others today.
					</p>
					<div className="auth-brand-features">
						<div className="auth-brand-feature">
							<i className="fas fa-user-plus" />
							<span>Create your unique profile</span>
						</div>
						<div className="auth-brand-feature">
							<i className="fas fa-lock" />
							<span>Secure and private account</span>
						</div>
						<div className="auth-brand-feature">
							<i className="fas fa-bell" />
							<span>Stay updated with notifications</span>
						</div>
					</div>
				</div>
			</div>
			<Card className="auth-card">
				<Card.Body>
					<Card.Title className="text-center mb-4">Create Your Account</Card.Title>

					{error && (
						<Alert variant="danger" className="mb-4">
							{error}
						</Alert>
					)}

					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Username</Form.Label>
							<Form.Control
								type="text"
								name="username"
								value={formData.username}
								onChange={handleChange}
								minLength="3"
								maxLength="30"
								required
								className="form-input"
								placeholder="Choose a username"
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Full Name</Form.Label>
							<Form.Control
								type="text"
								name="fullName"
								value={formData.fullName}
								onChange={handleChange}
								minLength="2"
								maxLength="100"
								required
								className="form-input"
								placeholder="Enter your full name"
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								required
								className="form-input"
								placeholder="Enter your email"
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								minLength="8"
								required
								className="form-input"
								placeholder="Create a password"
							/>
						</Form.Group>

						<Form.Group className="mb-4">
							<Form.Label>Confirm Password</Form.Label>
							<Form.Control
								type="password"
								name="passwordConfirm"
								value={formData.passwordConfirm}
								onChange={handleChange}
								minLength="8"
								required
								className="form-input"
								placeholder="Confirm your password"
							/>
						</Form.Group>

						<Button
							variant="primary"
							type="submit"
							className="w-100 mb-3"
							disabled={loading}
						>
							{loading ? "Creating Account..." : "Register"}
						</Button>
					</Form>

					<div className="text-center">
						<p className="mb-0">
							Already have an account?{" "}
							<Link to="/login" className="form-link">
								Login
							</Link>
						</p>
					</div>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default Register;
