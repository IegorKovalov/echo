import { LogOut, Search, Settings, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileAvatar from "../UI/ProfileAvatar";
import SearchModal from "../UI/SearchModal";

export default function Header() {
	const { user, logout } = useAuth();
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
			// Navigation is handled in AuthContext
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	return (
		<>
			<header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
				<div className="container flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-2">
						<Link to="/" className="flex items-center gap-2">
							<Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
							<span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
								Echo
							</span>
						</Link>
					</div>

					<nav className="hidden md:flex items-center gap-6">
						<Link
							to="/"
							className="text-sm font-medium text-gray-200 hover:text-purple-400"
						>
							Feed
						</Link>
						<button
							onClick={() => setIsSearchOpen(true)}
							className="text-sm font-medium text-gray-200 hover:text-purple-400 flex items-center gap-1"
						>
							<Search className="h-4 w-4" />
							Search
						</button>
						<Link
							to="#"
							className="text-sm font-medium text-gray-200 hover:text-purple-400"
						>
							Notifications
						</Link>
					</nav>

					{user && (
						<div className="flex items-center gap-4">
							<div className="relative group">
								<button className="rounded-full p-2 hover:bg-gray-800">
									<ProfileAvatar user={user} size="xs" />
									<span className="sr-only">Profile</span>
								</button>
								<div className="absolute right-0 top-full mt-1 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none invisible group-hover:visible">
									<div className="py-1">
										<div className="px-4 py-2 text-sm text-gray-200 border-b border-gray-700">
											<div className="font-medium">
												{user.fullName || "User"}
											</div>
											<div className="text-xs text-gray-400 truncate">
												{user.email}
											</div>
										</div>
										<Link
											to="/profile"
											className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
										>
											<User className="h-4 w-4" />
											Your Profile
										</Link>
										<Link
											to="/settings"
											className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
										>
											<Settings className="h-4 w-4" />
											Settings
										</Link>
										<button
											onClick={handleLogout}
											className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
										>
											<LogOut className="mr-2 h-4 w-4" />
											Logout
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</header>

			{/* Search Modal */}
			<SearchModal
				isOpen={isSearchOpen}
				onClose={() => setIsSearchOpen(false)}
			/>
		</>
	);
}
