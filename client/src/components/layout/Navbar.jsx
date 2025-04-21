import { useEffect, useState } from "react";
import {
	Navbar as BootstrapNavbar,
	Button,
	Container,
	Dropdown,
	Form,
	Nav,
} from "react-bootstrap";
import {
	FaBell,
	FaCog,
	FaHome,
	FaSearch,
	FaSignOutAlt,
	FaUser,
	FaUsers,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../common/UserAvatar";

const Navbar = () => {
	const { currentUser, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const userFullName = currentUser ? currentUser.fullName || "User" : "User";
	const [scrolled, setScrolled] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

	// Close mobile menu when route changes
	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, [location.pathname]);

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
			toast.success("Successfully logged out");
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Logout failed. Please try again later.");
		}
	};

	const handleSearch = (e) => {
		e.preventDefault();
		// Implement search functionality
		if (searchQuery.trim()) {
			toast.info(`Searching for: ${searchQuery}`);
			// navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	};

	const navItems = [
		{ icon: <FaHome />, label: "Home", path: "/home" },
		{ icon: <FaUsers />, label: "Friends", path: "/friends" },
		{ icon: <FaUser />, label: "Profile", path: "/profile" },
	];

	return (
		<BootstrapNavbar
			expand="lg"
			className={`custom-navbar sticky-top ${
				scrolled ? "navbar-scrolled" : ""
			}`}
			expanded={isMobileMenuOpen}
		>
			<Container>
				{/* Logo Section */}
				<BootstrapNavbar.Brand as={Link} to="/home" className="navbar-logo">
					<span className="gradient-text">echo</span>
				</BootstrapNavbar.Brand>

				<BootstrapNavbar.Toggle
					aria-controls="basic-navbar-nav"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				/>

				<BootstrapNavbar.Collapse id="basic-navbar-nav">
					{/* Navigation items for desktop view */}
					<Nav className="me-auto d-none d-lg-flex">
						{navItems.map((item, index) => (
							<Nav.Link
								key={index}
								as={Link}
								to={item.path}
								className={`nav-item mx-2 ${
									location.pathname === item.path ? "active" : ""
								}`}
							>
								{item.icon}
								<span className="ms-2">{item.label}</span>
							</Nav.Link>
						))}
					</Nav>

					{/* Search Bar */}
					<div className="search-container mx-auto">
						<Form onSubmit={handleSearch} className="d-flex">
							<div className="search-input-wrapper w-100">
								<Form.Control
									type="search"
									placeholder="Search..."
									className="search-input"
									aria-label="Search"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
								<Button
									type="submit"
									variant="link"
									className="search-icon"
									aria-label="Submit search"
								>
									<FaSearch />
								</Button>
							</div>
						</Form>
					</div>

					{/* Navigation items for mobile view */}
					<Nav className="d-lg-none mt-3">
						{navItems.map((item, index) => (
							<Nav.Link
								key={index}
								as={Link}
								to={item.path}
								className={`nav-item mobile-nav-item my-1 ${
									location.pathname === item.path ? "active" : ""
								}`}
							>
								{item.icon}
								<span className="ms-2">{item.label}</span>
							</Nav.Link>
						))}
					</Nav>

					{/* User Menu */}
					<Nav className="ms-auto align-items-center">
						<Dropdown align="end">
							<Dropdown.Toggle as="div" className="user-menu-toggle">
								<div className="d-flex align-items-center">
									<div className="navbar-avatar">
										<UserAvatar fullName={userFullName} variant="navbar" />
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
				</BootstrapNavbar.Collapse>
			</Container>
		</BootstrapNavbar>
	);
};

export default Navbar;
