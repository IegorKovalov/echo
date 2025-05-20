import { Sparkles, User, UserCheck, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import FollowerService from "../../services/follower.service";
import { useFollower } from "../../context/FollowerContext";
import ProfileAvatar from "./ProfileAvatar";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import ErrorMessage from "./ErrorMessage";

export default function FollowersModal({
	isOpen,
	onClose,
	initialTab,
	userId,
}) {
	const [activeTab, setActiveTab] = useState(initialTab || "followers");
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState(null);
	const [hasMore, setHasMore] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	const { user } = useAuth();
	const { showError, showSuccess } = useToast();
	const { toggleFollow: contextToggleFollow } = useFollower();

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
			setFetchError(null);
			fetchUsers(1);
		}
	}, [isOpen, userId, activeTab]);

	const fetchUsers = async (page = 1) => {
		try {
			if (!userId) return;
			setLoading(true);
			setFetchError(null);

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
			const errorMessage = error.message || `Failed to load ${activeTab}`;
			setFetchError(errorMessage);
			showError(errorMessage);
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
			const success = await contextToggleFollow(targetUserId, isFollowing);

			if (success) {
				setUsers((prevUsers) =>
					prevUsers.map((u) =>
						u.user._id === targetUserId
							? { ...u, isFollowing: !isFollowing }
							: u
					)
				);
			} else {
				showError("Failed to update follow status from modal.");
			}
		} catch (error) {
			console.error("Error toggling follow in modal:", error);
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
						<LoadingSpinner />
					) : fetchError ? (
						<ErrorMessage message={fetchError} />
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
						<EmptyState 
							message={activeTab === "followers" 
								? "This user doesn\'t have any followers yet."
								: "This user isn\'t following anyone yet."}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
