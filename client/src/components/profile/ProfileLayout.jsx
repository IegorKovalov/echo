import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePost } from "../../context/PostContext";
import UserService from "../../services/user.service";
import FollowersModal from "../UI/FollowersModal";
import ProfileContent from "./ProfileContent";
import ProfileHeader from "./ProfileHeader";
import ProfileMedia from "./ProfileMedia";
import ProfilePosts from "./ProfilePosts";
import ProfileStats from "./ProfileStats";
import ProfileTabs from "./ProfileTabs";

export default function ProfileLayout({ userId }) {
	const { user } = useAuth();
	const { fetchUserPosts, createPost, deletePost, renewPost } = usePost();

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

	// Refs for tracking state changes to prevent unnecessary fetches
	const fetchPostsRef = useRef({
		profileId: null,
		showExpired: false,
		fetchCount: 0,
	});

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

	// Load user posts using PostContext - with proper dependency handling
	useEffect(() => {
		if (!user || !profileData) return;

		// Check if we need to fetch posts again
		const shouldFetchPosts =
			profileData._id !== fetchPostsRef.current.profileId ||
			showExpiredPosts !== fetchPostsRef.current.showExpired;

		if (!shouldFetchPosts) return;

		// Update ref to avoid redundant fetches
		fetchPostsRef.current = {
			profileId: profileData._id,
			showExpired: showExpiredPosts,
			fetchCount: fetchPostsRef.current.fetchCount + 1,
		};

		const loadUserPosts = async () => {
			try {
				setLoadingPosts(true);
				// Fetch posts for the profile we're viewing
				const userPosts = await fetchUserPosts(
					profileData._id,
					showExpiredPosts && isOwnProfile
				);
				setPosts(userPosts || []);
			} catch (error) {
				console.error("Error fetching posts:", error);
			} finally {
				setLoadingPosts(false);
			}
		};

		loadUserPosts();
	}, [user, profileData, showExpiredPosts, isOwnProfile, fetchUserPosts]);

	// Handle post creation - only available on own profile
	const handleCreatePost = async (formData) => {
		if (!isOwnProfile) return;

		try {
			setIsSubmitting(true);
			await createPost(formData);

			// Track that we need to fetch posts again
			fetchPostsRef.current.fetchCount += 1;

			// Refresh posts after creating a new one
			const userPosts = await fetchUserPosts(user._id, showExpiredPosts);
			setPosts(userPosts || []);
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
			await deletePost(postId);
			// Filter out the deleted post from the local state instead of refetching
			setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
		} catch (error) {
			console.error("Error deleting post:", error);
		}
	};

	// Handle post renewal - only available on own profile
	const handleRenewPost = async (postId) => {
		if (!isOwnProfile) return;

		try {
			const renewedPost = await renewPost(postId);
			// Update the post in local state instead of refetching
			setPosts((prevPosts) =>
				prevPosts.map((post) => (post._id === postId ? renewedPost : post))
			);
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
