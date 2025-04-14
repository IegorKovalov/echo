import {
	Navbar as BootstrapNavbar,
	Container,
	Form,
	Nav,
} from "react-bootstrap";
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
		} else {
			console.error("Logout error:", result.error);
			toast.error("Logout failed on the server. Try again later.");
		}
	};

	return (
		<BootstrapNavbar expand="lg" className="custom-navbar">
			<Container>
				<BootstrapNavbar.Brand as={Link} to="/" className="navbar-logo">
					SocialNetwork
				</BootstrapNavbar.Brand>

				<BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

				<BootstrapNavbar.Collapse id="basic-navbar-nav">
					{isAuthenticated() ? (
						<Nav className="ms-auto align-items-center">
							<Form className="d-flex me-3">
								<Form.Control
									type="search"
									placeholder="Search SocialNetwork"
									className="me-2 search-input"
									aria-label="Search"
								/>
							</Form>
							<UserMenu fullName={userFullName} onLogout={handleLogout} />
						</Nav>
					) : (
						<></>
					)}
				</BootstrapNavbar.Collapse>
			</Container>
		</BootstrapNavbar>
	);
};

export default Navbar;
