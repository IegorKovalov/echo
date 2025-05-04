import { User, UserCheck, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function FollowersModal({ isOpen, onClose, initialTab }) {
	const [activeTab, setActiveTab] = useState(initialTab || "followers");
	useEffect(() => {
		if (initialTab) {
			setActiveTab(initialTab);
		}
	}, [initialTab]);

	const modalRef = useRef(null);

	// Mock data for the placeholder UI
	const mockFollowers = [
		{ id: 1, fullName: "Alex Johnson", username: "alexj", profilePicture: "" },
		{ id: 2, fullName: "Morgan Smith", username: "msmith", profilePicture: "" },
		{
			id: 3,
			fullName: "Jamie Wilson",
			username: "jwilson",
			profilePicture: "",
		},
		{ id: 4, fullName: "Jordan Lee", username: "jlee", profilePicture: "" },
		{ id: 5, fullName: "Taylor Swift", username: "tswift", profilePicture: "" },
	];

	const mockFollowing = [
		{
			id: 6,
			fullName: "Chris Rodriguez",
			username: "chrisr",
			profilePicture: "",
		},
		{ id: 7, fullName: "Pat Taylor", username: "ptaylor", profilePicture: "" },
		{ id: 8, fullName: "Casey Brown", username: "cbrown", profilePicture: "" },
	];

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Close on escape key
	useEffect(() => {
		const handleEsc = (event) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEsc);
		}

		return () => {
			document.removeEventListener("keydown", handleEsc);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	// Get the appropriate user list based on active tab
	const users = activeTab === "followers" ? mockFollowers : mockFollowing;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
			<div
				ref={modalRef}
				className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
			>
				{/* Header with tabs */}
				<div className="border-b border-gray-800">
					<div className="flex items-center justify-between px-4 py-3">
						<h2 className="text-lg font-semibold text-white">Connections</h2>
						<button
							onClick={onClose}
							className="p-1 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<div className="flex border-b border-gray-800">
						<button
							onClick={() => setActiveTab("followers")}
							className={`flex-1 py-3 text-sm font-medium ${
								activeTab === "followers"
									? "text-purple-400 border-b-2 border-purple-400"
									: "text-gray-400 hover:text-gray-200"
							}`}
						>
							Followers
						</button>
						<button
							onClick={() => setActiveTab("following")}
							className={`flex-1 py-3 text-sm font-medium ${
								activeTab === "following"
									? "text-purple-400 border-b-2 border-purple-400"
									: "text-gray-400 hover:text-gray-200"
							}`}
						>
							Following
						</button>
					</div>
				</div>

				{/* User list */}
				<div className="max-h-96 overflow-y-auto">
					{users.length > 0 ? (
						<div>
							{users.map((user) => (
								<div
									key={user.id}
									className="flex items-center justify-between p-4 border-b border-gray-800 hover:bg-gray-800/50"
								>
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
											{user.profilePicture ? (
												<img
													src={user.profilePicture}
													alt={user.fullName}
													className="h-full w-full rounded-full object-cover"
												/>
											) : (
												<User className="h-5 w-5 text-gray-300" />
											)}
										</div>
										<div>
											<p className="font-medium text-white">{user.fullName}</p>
											<p className="text-xs text-gray-400">@{user.username}</p>
										</div>
									</div>

									{/* Follow/Following button - changes based on the active tab */}
									{activeTab === "followers" ? (
										<button className="rounded-full border border-purple-500 bg-transparent px-3 py-1 text-xs font-medium text-purple-400 hover:bg-purple-500/10">
											<span className="flex items-center gap-1">
												<UserPlus className="h-3 w-3" />
												Follow
											</span>
										</button>
									) : (
										<button className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 hover:bg-purple-500/20">
											<span className="flex items-center gap-1">
												<UserCheck className="h-3 w-3" />
												Following
											</span>
										</button>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="py-12 text-center">
							<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-800 p-4">
								<User className="h-8 w-8 text-gray-600" />
							</div>
							<h3 className="text-lg font-medium text-white">
								{activeTab === "followers"
									? "No followers yet"
									: "Not following anyone"}
							</h3>
							<p className="mt-2 text-sm text-gray-400">
								{activeTab === "followers"
									? "When people follow you, they'll appear here."
									: "When you follow people, they'll appear here."}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
