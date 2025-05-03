import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NotFoundPage = () => {
	const { isAuthenticated } = useAuth();
	const redirectPath = isAuthenticated() ? "/home" : "/login";

	return (
		<div className="min-vh-100 bg-light d-flex flex-column">
			<div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
				<div
					className="bg-white rounded-4 shadow-sm p-5 text-center"
					style={{ maxWidth: "450px" }}
				>
					<div className="display-1 fw-bold text-primary mb-3">404</div>
					<h2 className="mb-4 fw-bold">Page Not Found</h2>

					<p className="text-secondary mb-4">
						The page you're looking for doesn't exist or has been moved.
					</p>

					<Link
						to={redirectPath}
						className="btn btn-primary btn-lg rounded-3 px-5"
					>
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
