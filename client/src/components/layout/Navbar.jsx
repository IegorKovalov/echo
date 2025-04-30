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
	FaUsers,
	FaUser,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import UserAvatar from "../common/UserAvatar";

const Navbar = () => {
	const { currentUser, logout } = useAuth();
	const { showToast } = useToast();
	const navigate = useNavigate();
	const location = useLocation();
	const userFullName = currentUser ? currentUser.fullName || "User" : "User";
	const [scrolled, setScrolled] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [notifications, setNotifications] = useState([
		{
			id: 1,
			type: "friend_request",
			message: "John Doe sent you a friend request",
			time: "2 minutes ago",
			read: false,
		},
		{
			id: 2,
			type: "like",
			message: "Jane Smith liked your post",
			time: "1 hour ago",
			read: false,
		},
		{
			id: 3,
			type: "comment",
			message: "Mike Johnson commented on your post",
			time: "3 hours ago",
			read: true,
		},
	]);
	const [showNotifications, setShowNotifications] = useState(false);

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

	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, [location.pathname]);

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
			showToast("Successfully logged out", "success");
		} catch (error) {
			console.error("Logout error:", error);
			showToast("Logout failed. Please try again later.", "error");
		}
	};

	const handleSearch = (e) => {
		e.preventDefault();
	};

	const unreadNotifications = notifications.filter((n) => !n.read).length;

	const handleNotificationClick = (notification) => {
		// Mark notification as read
		setNotifications(
			notifications.map((n) =>
				n.id === notification.id ? { ...n, read: true } : n
			)
		);
	};

	const navItems = [
		{ icon: <FaHome />, label: "Home", path: "/home" },
		{ icon: <FaUsers />, label: "Friends", path: "/friends" },
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

					{/* Notifications */}
					<Nav className="ms-auto align-items-center">
						{/* Notifications Dropdown */}
						<Dropdown
							show={showNotifications}
							onToggle={(nextShow) => setShowNotifications(nextShow)}
							align="end"
						>
							<Dropdown.Toggle
								as="div"
								className="notifications-toggle"
								onClick={() => setShowNotifications(!showNotifications)}
							>
								<div className="position-relative">
									<FaBell className="notifications-icon" />
									{unreadNotifications > 0 && (
										<span className="notification-badge">
											{unreadNotifications}
										</span>
									)}
								</div>
							</Dropdown.Toggle>

							<Dropdown.Menu className="notifications-dropdown">
								<Dropdown.Header className="notifications-header">
									<div className="d-flex justify-content-between align-items-center">
										<span>Notifications</span>
										{unreadNotifications > 0 && (
											<Button
												variant="link"
												className="mark-all-read p-0"
												onClick={() =>
													setNotifications(
														notifications.map((n) => ({ ...n, read: true }))
													)
												}
											>
												Mark all as read
											</Button>
										)}
									</div>
								</Dropdown.Header>
								<Dropdown.Divider />
								{notifications.length > 0 ? (
									notifications.map((notification) => (
										<Dropdown.Item
											key={notification.id}
											className={`notification-item ${
												!notification.read ? "unread" : ""
											}`}
											onClick={() => handleNotificationClick(notification)}
										>
											<div className="notification-content">
												<p className="notification-message mb-0">
													{notification.message}
												</p>
												<small className="notification-time">
													{notification.time}
												</small>
											</div>
										</Dropdown.Item>
									))
								) : (
									<Dropdown.Item className="text-center py-3">
										No notifications yet
									</Dropdown.Item>
								)}
							</Dropdown.Menu>
						</Dropdown>

						{/* User Menu */}
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
