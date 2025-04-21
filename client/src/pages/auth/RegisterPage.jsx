import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const RegisterPage = () => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		fullName: "",
		password: "",
		passwordConfirm: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
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
			setLoading(true);
			await register(formData);
			toast.success("Registration successful!");
			navigate("/profile");
		} catch (err) {
			const errorMessage =
				err.response?.data?.message ||
				"Failed to create an account. Please try again.";
			toast.error(errorMessage || error);
		} finally {
			setLoading(false);
			setError("");
		}
	};

	return (
		<div className="min-h-screen bg-black text-white d-flex flex-column">
			<div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
				<div className="auth-card-container animate-fade-down">
					<div className="text-center mb-4">
						<h1 className="gradient-title mb-2">echo</h1>
						<p className="text-secondary">Create your account</p>
					</div>

					<div className="space-y-6">
						<Form onSubmit={handleSubmit} className="space-y-4">
							<Form.Group className="mb-3">
								<Form.Label className="text-secondary">Username</Form.Label>
								<Form.Control
									type="text"
									name="username"
									value={formData.username}
									onChange={handleChange}
									minLength="3"
									maxLength="30"
									required
									className="custom-input"
									placeholder="Choose a username"
								/>
							</Form.Group>

							<Form.Group className="mb-3">
								<Form.Label className="text-secondary">Full Name</Form.Label>
								<Form.Control
									type="text"
									name="fullName"
									value={formData.fullName}
									onChange={handleChange}
									minLength="2"
									maxLength="100"
									required
									className="custom-input"
									placeholder="Enter your full name"
								/>
							</Form.Group>

							<Form.Group className="mb-3">
								<Form.Label className="text-secondary">Email</Form.Label>
								<Form.Control
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
									className="custom-input"
									placeholder="you@example.com"
								/>
							</Form.Group>

							<Form.Group className="mb-3">
								<Form.Label className="text-secondary">Password</Form.Label>
								<Form.Control
									type="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									minLength="8"
									required
									className="custom-input"
									placeholder="••••••••"
								/>
							</Form.Group>

							<Form.Group className="mb-4">
								<Form.Label className="text-secondary">
									Confirm Password
								</Form.Label>
								<Form.Control
									type="password"
									name="passwordConfirm"
									value={formData.passwordConfirm}
									onChange={handleChange}
									minLength="8"
									required
									className="custom-input"
									placeholder="••••••••"
								/>
							</Form.Group>

							<Button
								type="submit"
								className="w-100 gradient-button"
								disabled={loading}
							>
								{loading ? "Creating Account..." : "Sign up"}
							</Button>
						</Form>

						<div className="divider"></div>
						<p className="text-center mt-4 text-secondary">
							Already have an account?{" "}
							<Link to="/login" className="signup-link">
								Sign in
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

export default RegisterPage;
