import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
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
		<div className="form-container">
			<h2 className="form-title">Login to Your Account</h2>

			{error && <div className="error-message">{error}</div>}

			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="email" className="form-label">
						Email
					</label>
					<input
						type="email"
						id="email"
						className="form-input"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
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
						className="form-input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<button type="submit" className="btn btn-block" disabled={loading}>
					{loading ? "Logging in..." : "Login"}
				</button>
			</form>

			<div className="text-center mt-3">
				<p>
					<Link to="/forgot-password" className="form-link">
						Forgot Password?
					</Link>
				</p>
				<p>
					Don't have an account?{" "}
					<Link to="/register" className="form-link">
						Register
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Login;
