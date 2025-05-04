import {
	ArrowLeft,
	Calendar,
	Camera,
	Clock,
	Edit,
	Grid,
	ImageIcon,
	MapPin,
	MessageCircle,
	Settings,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FollowersModal from "../components/UI/FollowersModal";
import PostForm from "../components/UI/PostForm";
import PostItem from "../components/UI/PostItem";
import ProfileAvatar from "../components/UI/ProfileAvatar";
import { useAuth } from "../context/AuthContext";
import PostService from "../services/post.service";
import UserService from "../services/user.service";

export default function ProfilePage() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const [profileData, setProfileData] = useState(null);
	const [posts, setPosts] = useState([]);
	const [loadingPosts, setLoadingPosts] = useState(true);
	const [activeTab, setActiveTab] = useState("posts");
	const [showExpiredPosts, setShowExpiredPosts] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
	const [followersModalTab, setFollowersModalTab] = useState("");

	// Redirect if not logged in
	useEffect(() => {
		if (!loading && !user) {
			navigate("/login");
		}
	}, [user, loading, navigate]);

	// Load profile data from API
	useEffect(() => {
		if (user) {
			const fetchProfileData = async () => {
				try {
					const data = await UserService.getProfile();
					setProfileData(data.data.user);
				} catch (error) {
					console.error("Error fetching profile:", error);
				}
			};

			fetchProfileData();
		}
	}, [user]);

	// Load user posts
	useEffect(() => {
		if (user) {
			const fetchPosts = async () => {
				try {
					setLoadingPosts(true);
					const data = await PostService.getUserPosts(
						user._id,
						showExpiredPosts
					);
					setPosts(data.data.posts || []);
				} catch (error) {
					console.error("Error fetching posts:", error);
				} finally {
					setLoadingPosts(false);
				}
			};

			fetchPosts();
		}
	}, [user, showExpiredPosts]);

	// Handle post creation
	const handleCreatePost = async (formData) => {
		try {
			setIsSubmitting(true);
			await PostService.createPost(formData);

			// Refresh posts after creating a new one
			const data = await PostService.getUserPosts(user._id, showExpiredPosts);
			setPosts(data.data.posts || []);
		} catch (error) {
			console.error("Error creating post:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle post deletion
	const handleDeletePost = async (postId) => {
		try {
			await PostService.deletePost(postId);
			// Refresh posts after deleting
			const data = await PostService.getUserPosts(user._id, showExpiredPosts);
			setPosts(data.data.posts || []);
		} catch (error) {
			console.error("Error deleting post:", error);
		}
	};

	// Handle post renewal
	const handleRenewPost = async (postId) => {
		try {
			await PostService.renewPost(postId);
			// Refresh posts after renewing
			const data = await PostService.getUserPosts(user._id, showExpiredPosts);
			setPosts(data.data.posts || []);
		} catch (error) {
			console.error("Error renewing post:", error);
		}
	};

	// Handle opening followers modal
	const openFollowersModal = (tab) => {
		setFollowersModalTab(tab);
		setIsFollowersModalOpen(true);
	};

	// Handle closing followers modal
	const closeFollowersModal = () => {
		setFollowersModalTab("");
		setIsFollowersModalOpen(false);
	};

	// Loading state
	if (loading || !user || !profileData) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<div className="text-center">
					<Sparkles className="mx-auto h-12 w-12 animate-pulse text-purple-500" />
					<p className="mt-4 text-gray-400">Loading profile...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-950">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b bg-gray-950/80 backdrop-blur-md">
				<div className="container flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-3">
						<Link to="/" className="rounded-full p-2 hover:bg-gray-800">
							<ArrowLeft className="h-5 w-5 text-white" />
							<span className="sr-only">Back</span>
						</Link>
						<h1 className="text-lg font-semibold text-white">Profile</h1>
					</div>
					<div className="flex items-center gap-2">
						<Link to="/settings" className="rounded-full p-2 hover:bg-gray-800">
							<Settings className="h-5 w-5 text-white" />
							<span className="sr-only">Settings</span>
						</Link>
					</div>
				</div>
			</header>

			<main className="flex-1">
				{/* Profile Header */}
				<div className="relative">
					{/* Cover Image */}
					<div className="h-40 w-full bg-gradient-to-r from-purple-900 to-blue-900 md:h-60" />

					{/* Profile Image and Basic Info */}
					<div className="container px-4">
						<div className="relative -mt-16 flex flex-col items-center md:-mt-20 md:flex-row md:items-end">
							<div className="relative">
								<ProfileAvatar
									user={profileData}
									size="3xl"
									className="border-4 border-gray-950"
								/>
								<Link
									to="/settings"
									className="absolute bottom-0 right-0 rounded-full bg-purple-600 p-2 text-white shadow-lg hover:bg-purple-700"
								>
									<Camera className="h-4 w-4" />
									<span className="sr-only">Change profile picture</span>
								</Link>
							</div>

							<div className="mt-4 text-center md:ml-6 md:text-left">
								<h2 className="text-2xl font-bold text-white">
									{profileData.fullName}
								</h2>
								<p className="text-gray-400">
									@{profileData.username || "username"}
								</p>
							</div>

							<div className="mt-4 md:ml-auto">
								<Link
									to="/settings"
									className="flex items-center gap-1 rounded-full bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
								>
									<Edit className="h-4 w-4" />
									<span>Edit Profile</span>
								</Link>
							</div>
						</div>

						{/* Profile Bio */}
						<div className="mt-6 max-w-2xl">
							<p className="text-gray-300">
								{profileData.bio || "No bio yet. Add one in your settings!"}
							</p>
							<div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
								{profileData.location && (
									<div className="flex items-center gap-1">
										<MapPin className="h-4 w-4" />
										<span>{profileData.location}</span>
									</div>
								)}
								<div className="flex items-center gap-1">
									<Calendar className="h-4 w-4" />
									<span>
										Joined{" "}
										{new Date(profileData.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>

						{/* Stats */}
						<div className="mt-6 flex justify-start gap-8 border-b border-gray-800 py-4">
							<div className="text-center">
								<div className="font-bold text-white">{posts.length}</div>
								<div className="text-sm text-gray-400">Echoes</div>
							</div>
							<button
								onClick={() => openFollowersModal("following")}
								className="text-center hover:opacity-80 transition-opacity"
							>
								<div className="font-bold text-white">0</div>
								<div className="text-sm text-gray-400">Following</div>
							</button>
							<button
								onClick={() => openFollowersModal("followers")}
								className="text-center hover:opacity-80 transition-opacity"
							>
								<div className="font-bold text-white">0</div>
								<div className="text-sm text-gray-400">Followers</div>
							</button>
						</div>

						{/* Tabs */}
						<div className="mt-4 flex">
							<button
								onClick={() => setActiveTab("posts")}
								className={`mr-8 border-b-2 pb-2 font-medium ${
									activeTab === "posts"
										? "border-purple-600 text-purple-600"
										: "border-transparent text-gray-400 hover:text-white"
								}`}
							>
								Posts
							</button>
							<button
								onClick={() => setActiveTab("media")}
								className={`border-b-2 pb-2 font-medium ${
									activeTab === "media"
										? "border-purple-600 text-purple-600"
										: "border-transparent text-gray-400 hover:text-white"
								}`}
							>
								Media
							</button>
						</div>
					</div>

					{/* Post Creation Form */}
					{activeTab === "posts" && (
						<div className="container px-4 mt-8">
							<PostForm
								user={profileData}
								onSubmit={handleCreatePost}
								isSubmitting={isSubmitting}
							/>
						</div>
					)}

					{/* Post Filter Toggle */}
					<div className="container mt-4 px-4">
						<div className="flex items-center justify-between">
							<h3 className="font-medium text-white">
								{activeTab === "posts" ? "Your Echoes" : "Media"}
							</h3>
							<label className="flex items-center text-sm text-gray-400">
								<input
									type="checkbox"
									checked={showExpiredPosts}
									onChange={(e) => setShowExpiredPosts(e.target.checked)}
									className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
								/>
								Show expired posts
							</label>
						</div>
					</div>

					{/* Post/Media Content */}
					<div className="container mt-4 px-4 pb-16">
						{loadingPosts ? (
							<div className="mt-8 text-center">
								<Sparkles className="mx-auto h-8 w-8 animate-pulse text-purple-500" />
								<p className="mt-2 text-gray-400">Loading...</p>
							</div>
						) : posts.length === 0 ? (
							<div className="mt-8 rounded-lg bg-gray-900 p-8 text-center">
								<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-800 p-4">
									{activeTab === "posts" ? (
										<MessageCircle className="h-8 w-8 text-gray-600" />
									) : (
										<ImageIcon className="h-8 w-8 text-gray-600" />
									)}
								</div>
								<h3 className="text-lg font-medium text-white">
									{activeTab === "posts"
										? "No echoes yet"
										: "No media uploads yet"}
								</h3>
								<p className="mt-2 text-gray-400">
									{activeTab === "posts"
										? "Create your first Echo using the form above."
										: "When you share photos or videos, they'll appear here."}
								</p>
							</div>
						) : activeTab === "posts" ? (
							<div className="space-y-6">
								{/* Post List using PostItem component */}
								{posts.map((post) => (
									<PostItem
										key={post._id}
										post={post}
										currentUser={profileData}
										onDelete={handleDeletePost}
										onRenew={handleRenewPost}
									/>
								))}
							</div>
						) : (
							<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
								{/* Media Grid */}
								{posts
									.filter((post) => post.image)
									.map((post) => (
										<div
											key={post._id}
											className="group relative aspect-square overflow-hidden rounded-lg"
										>
											<img
												src={post.image}
												alt="Media"
												className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
											{post.expired ? (
												<div className="absolute bottom-2 right-2 rounded-full bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300">
													<Clock className="h-3 w-3" /> Expired
												</div>
											) : (
												<div className="absolute bottom-2 right-2 rounded-full bg-purple-900/60 px-2 py-1 text-xs font-medium text-purple-300">
													<Clock className="h-3 w-3" />{" "}
													{Math.ceil(
														(new Date(post.expiresAt) - new Date()) /
															(1000 * 60 * 60)
													)}
													h left
												</div>
											)}
										</div>
									))}
							</div>
						)}
					</div>
				</div>
			</main>

			{/* Followers/Following Modal */}
			<FollowersModal
				isOpen={isFollowersModalOpen}
				onClose={closeFollowersModal}
				initialTab={followersModalTab}
			/>
		</div>
	);
}
