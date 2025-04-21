import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NotFoundPage = () => {
	const { isAuthenticated } = useAuth();
	const redirectPath = isAuthenticated() ? "/home" : "/login";

	return (
		<div className="min-h-screen bg-black text-white d-flex flex-column">
			<div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
				<div className="auth-card-container animate-fade-down text-center">
					<h1 className="gradient-title mb-4">404</h1>
					<h2 className="mb-4">Page Not Found</h2>

					<p className="text-secondary mb-4">
						The page you're looking for doesn't exist or has been moved.
					</p>

					<Link to={redirectPath} className="btn gradient-button px-5 py-3">
						Go to {isAuthenticated() ? "Home" : "Login"}
					</Link>
				</div>
			</div>

			<footer className="py-3 text-center text-secondary">
				© 2025 Echo. All rights reserved.
			</footer>
		</div>
	);
};

export default NotFoundPage;
