import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
	const { currentUser, logout, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<nav className="navbar">
			<div className="navbar-container">
				<div className="navbar-left">
					<Link to="/" className="navbar-logo">
						SocialNetwork
					</Link>
				</div>

				<div className="navbar-menu">
					{isAuthenticated() ? (
						<>
							<div className="navbar-search">
								<span className="navbar-search-icon">🔍</span>
								<input type="text" placeholder="Search SocialNetwork" />
							</div>
							<Link to="/profile" className="navbar-user">
								{currentUser.fullName}
							</Link>
							<button
								onClick={handleLogout}
								className="navbar-link navbar-button"
							>
								Logout
							</button>
						</>
					) : (
						<></>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
