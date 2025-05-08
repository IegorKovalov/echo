import {
	Bell,
	Home,
	LogOut,
	Search,
	Settings,
	Sparkles,
	User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationsDropdown from "../UI/NotificationsDropdown";
import ProfileAvatar from "../UI/ProfileAvatar";
import SearchModal from "../UI/SearchModal";

export default function Header() {
	const { user, logout } = useAuth();
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchAnchorRect, setSearchAnchorRect] = useState(null);
	const searchButtonRef = useRef(null);
	const notificationsButtonRef = useRef(null);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [notificationsAnchorRect, setNotificationsAnchorRect] = useState(null);
	const location = useLocation();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Close mobile menu when route changes
	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, [location.pathname]);

	const handleLogout = async () => {
		try {
			await logout();
			// Navigation is handled in AuthContext
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	const handleOpenSearch = () => {
		// Get the position of the search button to anchor the search bubble
		if (searchButtonRef.current) {
			setSearchAnchorRect(searchButtonRef.current.getBoundingClientRect());
		}
		setIsSearchOpen(true);
		setIsNotificationsOpen(false);
	};

	const handleCloseSearch = () => {
		setIsSearchOpen(false);
	};

	const handleToggleNotifications = () => {
		// Get the position of the notifications button to anchor the dropdown
		if (notificationsButtonRef.current) {
			setNotificationsAnchorRect(
				notificationsButtonRef.current.getBoundingClientRect()
			);
		}
		setIsNotificationsOpen(!isNotificationsOpen);
		if (isSearchOpen) setIsSearchOpen(false);
	};

	const handleCloseNotifications = () => {
		setIsNotificationsOpen(false);
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const isActive = (path) => {
		return location.pathname === path;
	};

	return (
		<>
			<header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
				<div className="container flex h-16 items-center justify-between px-4">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<Link to="/" className="flex items-center gap-2">
							<Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
							<span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
								Echo
							</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-6">
						<Link
							to="/"
							className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
								isActive("/")
									? "text-purple-400"
									: "text-gray-200 hover:text-purple-400"
							}`}
						>
							<Home className="h-4 w-4" />
							Feed
						</Link>
						<button
							ref={searchButtonRef}
							onClick={handleOpenSearch}
							className="text-sm font-medium text-gray-200 hover:text-purple-400 flex items-center gap-1.5 cursor-pointer transition-colors"
						>
							<Search className="h-4 w-4" />
							Search
						</button>
						<button
							ref={notificationsButtonRef}
							onClick={handleToggleNotifications}
							className="text-sm font-medium text-gray-200 hover:text-purple-400 flex items-center gap-1.5 cursor-pointer transition-colors"
						>
							<Bell className="h-4 w-4" />
							Notifications
							<span className="flex h-1.5 w-1.5 relative">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
							</span>
						</button>
					</nav>

					{/* Mobile menu button */}
					<button
						className="md:hidden p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
						onClick={toggleMobileMenu}
						aria-label="Toggle menu"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							{isMobileMenuOpen ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							)}
						</svg>
					</button>

					{/* User Profile & Menu */}
					{user && (
						<div className="hidden md:flex items-center gap-4">
							<div className="relative group">
								<button className="rounded-full p-2 hover:bg-gray-800 transition-colors">
									<ProfileAvatar user={user} size="xs" />
									<span className="sr-only">Profile</span>
								</button>
								<div className="absolute right-0 top-full mt-1 w-52 origin-top-right rounded-xl border border-gray-800 bg-gray-900 shadow-lg focus:outline-none invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-[999]">
									<div className="py-2">
										<div className="px-4 py-3 text-sm text-gray-200 border-b border-gray-800">
											<div className="font-medium">
												{user.fullName || "User"}
											</div>
											<div className="text-xs text-gray-400 truncate">
												{user.email}
											</div>
										</div>
										<Link
											to="/profile"
											className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
										>
											<User className="h-4 w-4" />
											Your Profile
										</Link>
										<Link
											to="/settings"
											className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 transition-colors"
										>
											<Settings className="h-4 w-4" />
											Settings
										</Link>
										<div className="border-t border-gray-800 mt-1 pt-1">
											<button
												onClick={handleLogout}
												className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition-colors"
											>
												<LogOut className="mr-2 h-4 w-4" />
												Logout
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<nav className="md:hidden bg-gray-900 border-t border-gray-800">
						<div className="px-2 pt-2 pb-3 space-y-1">
							<Link
								to="/"
								className={`flex items-center gap-2 px-3 py-2 rounded-md ${
									isActive("/")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<Home className="h-5 w-5" />
								Feed
							</Link>
							<button
								onClick={() => {
									handleOpenSearch();
									setIsMobileMenuOpen(false);
								}}
								className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
							>
								<Search className="h-5 w-5" />
								Search
							</button>
							<button
								onClick={() => {
									handleToggleNotifications();
									setIsMobileMenuOpen(false);
								}}
								className="w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
							>
								<div className="flex items-center gap-2">
									<Bell className="h-5 w-5" />
									Notifications
								</div>
								<span className="flex h-2 w-2 relative">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
								</span>
							</button>
							{user && (
								<>
									<Link
										to="/profile"
										className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
									>
										<User className="h-5 w-5" />
										Your Profile
									</Link>
									<Link
										to="/settings"
										className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
									>
										<Settings className="h-5 w-5" />
										Settings
									</Link>
									<button
										onClick={handleLogout}
										className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-red-400 hover:bg-gray-800"
									>
										<LogOut className="h-5 w-5" />
										Logout
									</button>
								</>
							)}
						</div>
					</nav>
				)}
			</header>

			{/* Floating Bubble Search */}
			<SearchModal
				isOpen={isSearchOpen}
				onClose={handleCloseSearch}
				anchorRect={searchAnchorRect}
			/>

			{/* Notifications Dropdown */}
			<NotificationsDropdown
				isOpen={isNotificationsOpen}
				onClose={handleCloseNotifications}
				anchorRect={notificationsAnchorRect}
			/>
		</>
	);
}
