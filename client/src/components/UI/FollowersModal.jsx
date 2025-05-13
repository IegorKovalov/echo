import { Sparkles, User, UserCheck, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import FollowerService from "../../services/follower.service";
import ProfileAvatar from "./ProfileAvatar";

export default function FollowersModal({
	isOpen,
	onClose,
	initialTab,
	userId,
}) {
	const [activeTab, setActiveTab] = useState(initialTab || "followers");
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	const { user } = useAuth();
	const { showError, showSuccess } = useToast();

	useEffect(() => {
		if (initialTab) {
			setActiveTab(initialTab);
		}
	}, [initialTab]);

	const modalRef = useRef(null);
	useEffect(() => {
		if (isOpen && userId) {
			setLoading(true);
			setUsers([]);
			setCurrentPage(1);
			fetchUsers(1);
		}
	}, [isOpen, userId, activeTab]);

	const fetchUsers = async (page = 1) => {
		try {
			if (!userId) return;

			let response;
			if (activeTab === "followers") {
				response = await FollowerService.getFollowers(userId, page);
			} else {
				response = await FollowerService.getFollowing(userId, page);
			}

			if (response.status === "success") {
				const data =
					activeTab === "followers"
						? response.data.followers
						: response.data.following;

				if (page === 1) {
					setUsers(data);
				} else {
					setUsers((prev) => [...prev, ...data]);
				}

				setTotalCount(response.data.total);
				setTotalPages(response.data.pages);
				setHasMore(response.data.hasMore);
				setCurrentPage(response.data.currentPage);
			}
		} catch (error) {
			console.error(`Error fetching ${activeTab}:`, error);
			showError(`Failed to load ${activeTab}`);
		} finally {
			setLoading(false);
		}
	};

	const loadMore = () => {
		if (hasMore && !loading) {
			fetchUsers(currentPage + 1);
		}
	};

	const handleFollowToggle = async (targetUserId, isFollowing) => {
		try {
			if (isFollowing) {
				await FollowerService.unfollowUser(targetUserId);
				showSuccess("User unfollowed successfully");
			} else {
				await FollowerService.followUser(targetUserId);
				showSuccess("User followed successfully");
			}

			setUsers(
				users.map((u) =>
					u.user._id === targetUserId ? { ...u, isFollowing: !isFollowing } : u
				)
			);
		} catch (error) {
			console.error("Error toggling follow:", error);
			showError(error.message || "Failed to update follow status");
		}
	};

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
	if (!isOpen) return null;

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
							{totalCount > 0 && activeTab === "followers" && (
								<span className="ml-1 text-xs text-gray-500">
									({totalCount})
								</span>
							)}
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
							{totalCount > 0 && activeTab === "following" && (
								<span className="ml-1 text-xs text-gray-500">
									({totalCount})
								</span>
							)}
						</button>
					</div>
				</div>

				{/* User list */}
				<div className="max-h-96 overflow-y-auto">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Sparkles className="h-8 w-8 text-purple-500 mb-2 animate-pulse" />
							<p className="text-gray-400 text-sm">Loading...</p>
						</div>
					) : users.length > 0 ? (
						<div>
							{users.map((item) => (
								<div
									key={item.user._id}
									className="flex items-center justify-between p-4 border-b border-gray-800 hover:bg-gray-800/50"
								>
									<Link
										to={`/profile/${item.user._id}`}
										className="flex items-center gap-3"
									>
										<ProfileAvatar user={item.user} size="sm" />
										<div>
											<p className="font-medium text-white">
												{item.user.fullName}
											</p>
											<p className="text-xs text-gray-400">
												@{item.user.username}
											</p>
										</div>
									</Link>

									{/* Follow/Following button - don't show for current user */}
									{user._id !== item.user._id && (
										<button
											onClick={() =>
												handleFollowToggle(item.user._id, item.isFollowing)
											}
											className={`rounded-full border ${
												item.isFollowing
													? "border-purple-500 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
													: "border-purple-500 bg-transparent text-purple-400 hover:bg-purple-500/10"
											} px-3 py-1 text-xs font-medium`}
										>
											<span className="flex items-center gap-1">
												{item.isFollowing ? (
													<>
														<UserCheck className="h-3 w-3" />
														Following
													</>
												) : (
													<>
														<UserPlus className="h-3 w-3" />
														Follow
													</>
												)}
											</span>
										</button>
									)}
								</div>
							))}

							{hasMore && (
								<div className="p-3 text-center">
									<button
										onClick={loadMore}
										className="text-sm text-purple-400 hover:text-purple-300"
										disabled={loading}
									>
										{loading ? "Loading..." : "Load more"}
									</button>
								</div>
							)}
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
