import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import LoadingSpinner from "../UI/LoadingSpinner";
import ErrorMessage from "../UI/ErrorMessage";

export default function ProfileLayout({ userId }) {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { fetchUserPosts, createPost, posts, loadingPosts, deletePost } =
		usePost();

	const [isLoading, setIsLoading] = useState(true);
	const [profileData, setProfileData] = useState(null);
	const [profileError, setProfileError] = useState(null);
	const [activeTab, setActiveTab] = useState("posts");
	const [showExpiredPosts, setShowExpiredPosts] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
	const [followersModalTab, setFollowersModalTab] = useState("");
	const [isOwnProfile, setIsOwnProfile] = useState(false);
	const [userPosts, setUserPosts] = useState([]);

	const profilePostIds = useRef(new Set());

	useEffect(() => {
		const fetchProfileData = async () => {
			try {
				setIsLoading(true);
				setProfileData(null);
				setProfileError(null);
				let data;
				const viewingOwnProfile = !userId || (user && userId === user._id);
				setIsOwnProfile(viewingOwnProfile);

				if (viewingOwnProfile && user) {
					setProfileData(user);
					data = await UserService.getProfile();
					setProfileData(data.data.user);
				} else if (userId) {
					data = await UserService.getUserProfile(userId);
					setProfileData(data.data.user);
				} else {
					navigate("/login");
					return;
				}
			} catch (error) {
				console.error("Error fetching profile:", error);
				if (error.response && error.response.status === 404) {
					setProfileError("Profile not found. It may have been moved or deleted.");
				} else {
					setProfileError(error.message || "Could not load profile. Please try again later.");
				}
			} finally {
				setIsLoading(false);
			}
		};

		if (user) {
			fetchProfileData();
		} else if (!userId) {
			navigate("/login");
		} else if (userId) {
			fetchProfileData();
		}
	}, [user, userId, navigate]);

	useEffect(() => {
		if (!user || !profileData) return;

		const loadUserPosts = async () => {
			try {
				const fetchedPosts = await fetchUserPosts(
					profileData._id,
					showExpiredPosts && isOwnProfile
				);
				setUserPosts(fetchedPosts || []);
				profilePostIds.current = new Set(fetchedPosts.map((post) => post._id));
			} catch (error) {
				console.error("Error fetching posts:", error);
			}
		};

		loadUserPosts();
	}, [user, profileData, showExpiredPosts, isOwnProfile, fetchUserPosts]);

	useEffect(() => {
		if (posts.length && profilePostIds.current.size) {
			const updatedProfilePosts = posts.filter((post) =>
				profilePostIds.current.has(post._id)
			);

			if (updatedProfilePosts.length) {
				setUserPosts((prevPosts) => {
					if (prevPosts.length !== updatedProfilePosts.length) {
						return prevPosts;
					}
					return prevPosts.map((post) => {
						const updatedPost = updatedProfilePosts.find(
							(p) => p._id === post._id
						);
						return updatedPost || post;
					});
				});
			}
		}
	}, [posts]);

	const handleCreatePost = useCallback(
		async (formData) => {
			try {
				setIsSubmitting(true);
				const newPost = await createPost(formData);
				setUserPosts((prevPosts) => [...prevPosts, newPost]);
				profilePostIds.current.add(newPost._id);
			} catch (error) {
				console.error("Error creating post:", error);
			} finally {
				setIsSubmitting(false);
			}
		},
		[createPost, setUserPosts, profilePostIds]
	);

	const handleDeletePost = useCallback(
		async (postId) => {
			if (!isOwnProfile) return;

			try {
				await deletePost(postId);
				setUserPosts((prevPosts) =>
					prevPosts.filter((post) => post._id !== postId)
				);
				profilePostIds.current.delete(postId);
			} catch (error) {
				console.error("Error deleting post:", error);
			} finally {
				setIsSubmitting(false);
			}
		},
		[isOwnProfile, deletePost]
	);

	const handleRenewPost = async (postId) => {
		const updatedPosts = await fetchUserPosts(
			profileData._id,
			showExpiredPosts && isOwnProfile
		);
		setUserPosts(updatedPosts || []);
		profilePostIds.current = new Set(updatedPosts.map((post) => post._id));
	};
	const openFollowersModal = (tab) => {
		setFollowersModalTab(tab);
		setIsFollowersModalOpen(true);
	};
	const closeFollowersModal = () => {
		setFollowersModalTab("");
		setIsFollowersModalOpen(false);
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<LoadingSpinner />
			</div>
		);
	}

	if (profileError) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
				<ErrorMessage message={profileError} />
			</div>
		);
	}

	if (!user || !profileData) {
		if(!user) navigate("/login");
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
				<ErrorMessage message="Profile data could not be loaded or user not authenticated." />
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
							postsCount={userPosts.length}
							onOpenFollowersModal={openFollowersModal}
							userId={profileData._id}
						/>

						<ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
					</div>

					{activeTab === "posts" ? (
						<ProfilePosts
							loadingPosts={loadingPosts}
							posts={userPosts}
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
							posts={userPosts}
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
