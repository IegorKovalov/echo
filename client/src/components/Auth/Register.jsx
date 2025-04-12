import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
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

		// Simple validation
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
		<div className="form-container">
			<h2 className="form-title">Create Your Account</h2>

			{error && <div className="error-message">{error}</div>}

			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="username" className="form-label">
						Username
					</label>
					<input
						type="text"
						id="username"
						name="username"
						className="form-input"
						value={formData.username}
						onChange={handleChange}
						minLength="3"
						maxLength="30"
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="fullName" className="form-label">
						Full Name
					</label>
					<input
						type="text"
						id="fullName"
						name="fullName"
						className="form-input"
						value={formData.fullName}
						onChange={handleChange}
						minLength="2"
						maxLength="100"
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="email" className="form-label">
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						className="form-input"
						value={formData.email}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="password" className="form-label">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						className="form-input"
						value={formData.password}
						onChange={handleChange}
						minLength="8"
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="passwordConfirm" className="form-label">
						Confirm Password
					</label>
					<input
						type="password"
						id="passwordConfirm"
						name="passwordConfirm"
						className="form-input"
						value={formData.passwordConfirm}
						onChange={handleChange}
						minLength="8"
						required
					/>
				</div>

				<button type="submit" className="btn btn-block" disabled={loading}>
					{loading ? "Creating Account..." : "Register"}
				</button>
			</form>

			<div className="text-center mt-3">
				<p>
					Already have an account?{" "}
					<Link to="/login" className="form-link">
						Login
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Register;
