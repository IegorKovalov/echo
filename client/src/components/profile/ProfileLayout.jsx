import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PostService from "../../services/post.service";
import UserService from "../../services/user.service";
import FollowersModal from "../UI/FollowersModal";
import ProfileContent from "./ProfileContent";
import ProfileHeader from "./ProfileHeader";
import ProfileMedia from "./ProfileMedia";
import ProfilePosts from "./ProfilePosts";
import ProfileStats from "./ProfileStats";
import ProfileTabs from "./ProfileTabs";

export default function ProfileLayout({ userId }) {
	const { user, loading } = useAuth();
	const navigate = useNavigate();

	// State management
	const [profileData, setProfileData] = useState(null);
	const [posts, setPosts] = useState([]);
	const [loadingPosts, setLoadingPosts] = useState(true);
	const [activeTab, setActiveTab] = useState("posts");
	const [showExpiredPosts, setShowExpiredPosts] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
	const [followersModalTab, setFollowersModalTab] = useState("");
	const [isOwnProfile, setIsOwnProfile] = useState(true);

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
					let data;

					// If userId is provided and not the current user's ID, fetch that user's profile
					if (userId && userId !== user._id) {
						data = await UserService.getUserProfile(userId);
						setIsOwnProfile(false);
					} else {
						// Otherwise fetch the current user's profile
						data = await UserService.getProfile();
						setIsOwnProfile(true);
					}

					setProfileData(data.data.user);
				} catch (error) {
					console.error("Error fetching profile:", error);
					// If profile not found, redirect to own profile
					if (error.response && error.response.status === 404) {
						navigate("/profile");
					}
				}
			};

			fetchProfileData();
		}
	}, [user, userId, navigate]);

	// Load user posts
	useEffect(() => {
		if (user && profileData) {
			const fetchPosts = async () => {
				try {
					setLoadingPosts(true);
					// Fetch posts for the profile we're viewing (either own or another user's)
					const data = await PostService.getUserPosts(
						profileData._id,
						showExpiredPosts && isOwnProfile // Only show expired posts on own profile
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
	}, [user, profileData, showExpiredPosts, isOwnProfile]);

	// Handle post creation - only available on own profile
	const handleCreatePost = async (formData) => {
		if (!isOwnProfile) return;

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

	// Handle post deletion - only available on own profile
	const handleDeletePost = async (postId) => {
		if (!isOwnProfile) return;

		try {
			await PostService.deletePost(postId);
			// Refresh posts after deleting
			const data = await PostService.getUserPosts(
				profileData._id,
				showExpiredPosts
			);
			setPosts(data.data.posts || []);
		} catch (error) {
			console.error("Error deleting post:", error);
		}
	};

	// Handle post renewal - only available on own profile
	const handleRenewPost = async (postId) => {
		if (!isOwnProfile) return;

		try {
			await PostService.renewPost(postId);
			// Refresh posts after renewing
			const data = await PostService.getUserPosts(
				profileData._id,
				showExpiredPosts
			);
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
			<ProfileHeader profileUsername={profileData.username} />

			<main className="flex-1">
				<div className="relative">
					<ProfileContent
						profileData={profileData}
						isOwnProfile={isOwnProfile}
					/>

					<div className="container px-4">
						<ProfileStats
							postsCount={posts.length}
							onOpenFollowersModal={openFollowersModal}
						/>

						<ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
					</div>

					{activeTab === "posts" ? (
						<ProfilePosts
							loadingPosts={loadingPosts}
							posts={posts}
							profileData={profileData}
							handleDeletePost={handleDeletePost}
							handleRenewPost={handleRenewPost}
							showExpiredPosts={showExpiredPosts}
							setShowExpiredPosts={setShowExpiredPosts}
							handleCreatePost={handleCreatePost}
							isSubmitting={isSubmitting}
							isOwnProfile={isOwnProfile}
						/>
					) : (
						<ProfileMedia
							loadingPosts={loadingPosts}
							posts={posts}
							showExpiredPosts={showExpiredPosts}
							setShowExpiredPosts={setShowExpiredPosts}
							isOwnProfile={isOwnProfile}
						/>
					)}
				</div>
			</main>

			{/* Followers/Following Modal */}
			<FollowersModal
				isOpen={isFollowersModalOpen}
				onClose={closeFollowersModal}
				initialTab={followersModalTab}
				userId={profileData._id}
			/>
		</div>
	);
}
