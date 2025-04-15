import {
	Navbar as BootstrapNavbar,
	Button,
	Container,
	Form,
	InputGroup,
	Nav,
} from "react-bootstrap";
import { FaSearch, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";
import UserMenu from "./UserMenu";

const Navbar = () => {
	const { currentUser, logout, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const userFullName = currentUser ? currentUser.fullName || "User" : "User";

	const handleLogout = async () => {
		const result = await logout();

		if (result.success) {
			navigate("/login");
			toast.success("Successfully logged out");
		} else {
			console.error("Logout error:", result.error);
			toast.error("Logout failed. Please try again later.");
		}
	};

	return (
		<BootstrapNavbar expand="lg" className="custom-navbar sticky-top">
			<Container>
				<BootstrapNavbar.Brand as={Link} to="/" className="navbar-logo">
					SocialNetwork
				</BootstrapNavbar.Brand>

				<BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

				<BootstrapNavbar.Collapse id="basic-navbar-nav">
					{isAuthenticated() ? (
						<>
							<Nav className="ms-auto align-items-center">
								<UserMenu fullName={userFullName} onLogout={handleLogout} />
							</Nav>
						</>
					) : (
						<Nav className="ms-auto">
							<Nav.Link as={Link} to="/login" className="text-white">
								Login
							</Nav.Link>
							<Nav.Link as={Link} to="/register" className="text-white">
								Register
							</Nav.Link>
						</Nav>
					)}
				</BootstrapNavbar.Collapse>
			</Container>
		</BootstrapNavbar>
	);
};

export default Navbar;
