import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

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
	const { showToast } = useToast();
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
			showToast("Registration successful!", "success");
			navigate("/profile");
		} catch (err) {
			const errorMessage =
				err.response?.data?.message ||
				"Failed to create an account. Please try again.";
			showToast(errorMessage || error, "error");
		} finally {
			setLoading(false);
			setError("");
		}
	};

	return (
		<div className="auth-container d-flex flex-column min-vh-100 bg-light">
			<div className="auth-content flex-grow-1 d-flex align-items-center justify-content-center py-5">
				<div
					className="auth-card bg-white rounded-4 shadow-sm p-4 p-md-5 mx-auto"
					style={{ maxWidth: "480px" }}
				>
					<div className="text-center mb-4">
						<h1 className="display-5 fw-bold text-primary mb-2">echo</h1>
						<p className="text-secondary">Create your account</p>
					</div>

					{error && (
						<div className="alert alert-danger py-2 rounded-3 mb-3">
							{error}
						</div>
					)}

					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label className="fw-medium">Username</Form.Label>
							<Form.Control
								type="text"
								name="username"
								value={formData.username}
								onChange={handleChange}
								minLength="3"
								maxLength="30"
								required
								className="form-control-lg rounded-3 border-light-subtle"
								placeholder="Choose a username"
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label className="fw-medium">Full Name</Form.Label>
							<Form.Control
								type="text"
								name="fullName"
								value={formData.fullName}
								onChange={handleChange}
								minLength="2"
								maxLength="100"
								required
								className="form-control-lg rounded-3 border-light-subtle"
								placeholder="Enter your full name"
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label className="fw-medium">Email</Form.Label>
							<Form.Control
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								required
								className="form-control-lg rounded-3 border-light-subtle"
								placeholder="you@example.com"
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label className="fw-medium">Password</Form.Label>
							<Form.Control
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								minLength="8"
								required
								className="form-control-lg rounded-3 border-light-subtle"
								placeholder="••••••••"
							/>
							<Form.Text className="text-secondary small">
								Password must be at least 8 characters long
							</Form.Text>
						</Form.Group>

						<Form.Group className="mb-4">
							<Form.Label className="fw-medium">Confirm Password</Form.Label>
							<Form.Control
								type="password"
								name="passwordConfirm"
								value={formData.passwordConfirm}
								onChange={handleChange}
								minLength="8"
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
									Creating Account...
								</>
							) : (
								"Sign up"
							)}
						</Button>
					</Form>

					<div className="d-flex align-items-center my-4">
						<div className="flex-grow-1 border-top"></div>
						<div className="mx-3 text-secondary small">or</div>
						<div className="flex-grow-1 border-top"></div>
					</div>

					<p className="text-center mb-0">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-primary text-decoration-none fw-medium"
						>
							Sign in
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

export default RegisterPage;
