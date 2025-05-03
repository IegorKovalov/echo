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
				scrolled ? "navbar-scrolled shadow-sm" : ""
			}`}
			expanded={isMobileMenuOpen}
		>
			<Container>
				{/* Logo Section */}
				<BootstrapNavbar.Brand as={Link} to="/home" className="navbar-logo">
					<span className="fw-bold fs-4 text-primary">echo</span>
				</BootstrapNavbar.Brand>

				<BootstrapNavbar.Toggle
					aria-controls="basic-navbar-nav"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					className="border-0 shadow-none"
				/>

				<BootstrapNavbar.Collapse id="basic-navbar-nav">
					{/* Navigation items for desktop view */}
					<Nav className="me-auto d-none d-lg-flex">
						{navItems.map((item, index) => (
							<Nav.Link
								key={index}
								as={Link}
								to={item.path}
								className={`nav-item mx-3 d-flex align-items-center ${
									location.pathname === item.path ? "active fw-bold" : ""
								}`}
							>
								<span className="nav-icon me-2">{item.icon}</span>
								<span>{item.label}</span>
							</Nav.Link>
						))}
					</Nav>

					{/* Search Bar */}
					<div className="search-container mx-auto">
						<Form onSubmit={handleSearch} className="d-flex">
							<div className="search-input-wrapper position-relative w-100">
								<div className="position-absolute top-50 start-0 translate-middle-y ms-3">
									<FaSearch className="text-secondary" />
								</div>
								<Form.Control
									type="search"
									placeholder="Search..."
									className="search-input ps-5 border-0 bg-light rounded-pill"
									aria-label="Search"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
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
								className={`nav-item mobile-nav-item py-2 px-3 mb-2 rounded-3 ${
									location.pathname === item.path
										? "active bg-primary text-white"
										: "bg-light"
								}`}
							>
								<span className="nav-icon me-3">{item.icon}</span>
								<span>{item.label}</span>
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
							className="me-2"
						>
							<Dropdown.Toggle as="div" className="notifications-toggle">
								<div
									className="notifications-button p-2 position-relative rounded-circle d-flex align-items-center justify-content-center"
									style={{ width: "40px", height: "40px" }}
									onClick={() => setShowNotifications(!showNotifications)}
								>
									<FaBell className="text-secondary" />
									{unreadNotifications > 0 && (
										<span
											className="notification-badge position-absolute bg-danger text-white d-flex align-items-center justify-content-center rounded-circle"
											style={{
												width: "18px",
												height: "18px",
												top: "0",
												right: "0",
												fontSize: "10px",
											}}
										>
											{unreadNotifications}
										</span>
									)}
								</div>
							</Dropdown.Toggle>

							<Dropdown.Menu className="notifications-dropdown shadow-sm border-0 py-0 overflow-hidden">
								<div className="notifications-header py-3 px-3 bg-light">
									<div className="d-flex justify-content-between align-items-center">
										<span className="fw-bold">Notifications</span>
										{unreadNotifications > 0 && (
											<Button
												variant="link"
												className="mark-all-read p-0 text-primary"
												style={{ fontSize: "0.85rem", textDecoration: "none" }}
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
								</div>
								<div
									className="notifications-body"
									style={{ maxHeight: "350px", overflowY: "auto" }}
								>
									{notifications.length > 0 ? (
										notifications.map((notification) => (
											<div
												key={notification.id}
												className={`notification-item py-3 px-3 border-bottom ${
													!notification.read ? "unread bg-light" : ""
												}`}
												onClick={() => handleNotificationClick(notification)}
											>
												<div className="notification-content">
													<p className="notification-message mb-1">
														{notification.message}
													</p>
													<small className="notification-time text-secondary">
														{notification.time}
													</small>
												</div>
											</div>
										))
									) : (
										<div className="text-center py-4 text-secondary">
											No notifications yet
										</div>
									)}
								</div>
							</Dropdown.Menu>
						</Dropdown>

						{/* User Menu */}
						<Dropdown align="end">
							<Dropdown.Toggle as="div" className="user-menu-toggle">
								<div className="d-flex align-items-center user-dropdown-button py-1 px-2">
									<div className="navbar-avatar me-2">
										<UserAvatar fullName={userFullName} variant="navbar" />
									</div>
									<span className="navbar-username d-none d-lg-block me-1 fw-medium">
										{userFullName}
									</span>
								</div>
							</Dropdown.Toggle>

							<Dropdown.Menu className="user-dropdown-menu shadow-sm border-0 py-0 overflow-hidden">
								<div className="user-dropdown-header bg-light p-3">
									<div className="d-flex align-items-center">
										<UserAvatar fullName={userFullName} variant="navbar" />
										<div className="ms-2">
											<div className="fw-bold">{userFullName}</div>
											<small className="text-secondary">
												@{currentUser?.username}
											</small>
										</div>
									</div>
								</div>
								<div className="user-dropdown-body">
									<Dropdown.Item
										as={Link}
										to="/profile"
										className="dropdown-menu-item py-3"
									>
										<FaUser className="me-3 text-primary" />
										Profile
									</Dropdown.Item>
									<Dropdown.Item
										as={Link}
										to="/settings"
										className="dropdown-menu-item py-3"
									>
										<FaCog className="me-3 text-primary" />
										Settings
									</Dropdown.Item>
									<Dropdown.Divider className="my-0" />
									<Dropdown.Item
										onClick={handleLogout}
										className="dropdown-menu-item py-3 text-danger"
									>
										<FaSignOutAlt className="me-3" />
										Log Out
									</Dropdown.Item>
								</div>
							</Dropdown.Menu>
						</Dropdown>
					</Nav>
				</BootstrapNavbar.Collapse>
			</Container>
		</BootstrapNavbar>
	);
};

export default Navbar;
