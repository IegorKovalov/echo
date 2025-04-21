import { useEffect, useState } from "react";
import {
	Navbar as BootstrapNavbar,
	Container,
	Dropdown,
	Form,
	Nav,
} from "react-bootstrap";
import {
	FaBell,
	FaClock,
	FaCog,
	FaSearch,
	FaSignOutAlt,
	FaUser,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import UserAvatar from "../Profile/shared/UserAvatar";
import "./Navbar.css";

const Navbar = () => {
	const { currentUser, logout } = useAuth();
	const navigate = useNavigate();
	const userFullName = currentUser ? currentUser.fullName || "User" : "User";
	const [scrolled, setScrolled] = useState(false);

	// Handle scrolling effect
	useEffect(() => {
		const handleScroll = () => {
			const isScrolled = window.scrollY > 10;
			if (isScrolled !== scrolled) {
				setScrolled(isScrolled);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [scrolled]);

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
		<BootstrapNavbar
			expand="lg"
			className={`custom-navbar sticky-top ${
				scrolled ? "navbar-scrolled" : ""
			}`}
		>
			<Container>
				{/* Logo Section */}
				<BootstrapNavbar.Brand as={Link} to="/" className="navbar-logo">
					<span className="gradient-text">echo</span>
				</BootstrapNavbar.Brand>

				<BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

				<BootstrapNavbar.Collapse id="basic-navbar-nav">
					<>
						{/* Search Bar */}
						<div className="search-container mx-auto">
							<div className="search-input-wrapper">
								<Form.Control
									type="search"
									placeholder="Search..."
									className="search-input"
									aria-label="Search"
								/>
								<div className="search-icon">
									<FaSearch />
								</div>
							</div>
						</div>

						{/* User Menu - Modified for better proportions */}
						<Nav className="ms-auto align-items-center">
							<Dropdown align="end">
								<Dropdown.Toggle as="div" className="user-menu-toggle">
									<div className="d-flex align-items-center">
										<div className="navbar-avatar">
											<UserAvatar fullName={userFullName} size="sm" />
										</div>
										<span className="navbar-username d-none d-sm-block">
											{userFullName}
										</span>
									</div>
								</Dropdown.Toggle>

								<Dropdown.Menu className="user-dropdown-menu">
									<Dropdown.Header>My Account</Dropdown.Header>
									<Dropdown.Divider />
									<Dropdown.Item
										as={Link}
										to="/profile"
										className="dropdown-menu-item"
									>
										<FaUser className="me-2" />
										Profile
									</Dropdown.Item>
									<Dropdown.Item
										as={Link}
										to="/settings"
										className="dropdown-menu-item"
									>
										<FaCog className="me-2" />
										Settings
									</Dropdown.Item>
									<Dropdown.Divider />
									<Dropdown.Item
										onClick={handleLogout}
										className="dropdown-menu-item text-danger"
									>
										<FaSignOutAlt className="me-2" />
										Log Out
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</Nav>
					</>
				</BootstrapNavbar.Collapse>
			</Container>
		</BootstrapNavbar>
	);
};

export default Navbar;
