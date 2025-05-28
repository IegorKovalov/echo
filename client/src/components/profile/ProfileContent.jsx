import {
	Calendar,
	Camera,
	Edit,
	Mail,
	MapPin,
	UserMinus,
	UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFollower } from "../../context/FollowerContext";
import { useToast } from "../../context/ToastContext";
import ProfileAvatar from "../UI/ProfileAvatar";

export default function ProfileContent({ profileData, isOwnProfile }) {
	const { getFollowerStats, toggleFollow } = useFollower();
	const { showError } = useToast();
	const [followStats, setFollowStats] = useState({ isFollowing: false });
	const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

	useEffect(() => {
		const loadFollowStats = async () => {
			if (profileData && profileData._id && !isOwnProfile) {
				try {
					const stats = await getFollowerStats(profileData._id);
					if (stats) {
						setFollowStats(stats);
					}
				} catch (error) {
					console.error("Error loading follow stats:", error);
				}
			}
		};

		loadFollowStats();
	}, [profileData, isOwnProfile, getFollowerStats]);

	const handleFollowToggle = async () => {
		if (isUpdatingFollow || !profileData || !profileData._id) return;

		try {
			setIsUpdatingFollow(true);
			const success = await toggleFollow(
				profileData._id,
				followStats.isFollowing
			);

			if (success) {
				setFollowStats((prev) => ({
					...prev,
					isFollowing: !prev.isFollowing,
				}));
			}
		} catch (error) {
			console.error("Error toggling follow:", error);
			showError("Failed to update follow status");
		} finally {
			setIsUpdatingFollow(false);
		}
	};

	return (
		<div>
			{/* Cover Image */}
			<div className="h-60 w-full bg-gradient-to-r from-purple-900 to-blue-900" />

			{/* Profile Image and Basic Info */}
			<div className="container px-4">
				<div className="relative -mt-20 flex flex-row items-end">
					<div className="relative">
						<ProfileAvatar
							user={profileData}
							size="3xl"
							className="border-4 border-gray-950"
						/>
						{isOwnProfile && (
							<Link
								to="/settings"
								className="absolute bottom-0 right-0 rounded-full bg-purple-600 p-2 text-white shadow-lg hover:bg-purple-700"
							>
								<Camera className="h-4 w-4" />
								<span className="sr-only">Change profile picture</span>
							</Link>
						)}
					</div>

					<div className="mt-4 ml-6 text-left">
						<h2 className="text-2xl font-bold text-white">
							{profileData.fullName}
						</h2>
						<p className="text-gray-400">
							@{profileData.username || "username"}
						</p>
					</div>

					<div className="mt-4 ml-auto">
						{isOwnProfile ? (
							<Link
								to="/settings"
								className="flex items-center gap-1 rounded-full bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
							>
								<Edit className="h-4 w-4" />
								<span>Edit Profile</span>
							</Link>
						) : (
							<div className="flex gap-2">
								<button
									onClick={handleFollowToggle}
									disabled={isUpdatingFollow}
									className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium ${
										followStats.isFollowing
											? "bg-gray-700 text-white hover:bg-gray-600"
											: "bg-purple-600 text-white hover:bg-purple-700"
									} ${isUpdatingFollow ? "opacity-70" : ""}`}
								>
									{isUpdatingFollow ? (
										"Processing..."
									) : followStats.isFollowing ? (
										<>
											<UserMinus className="h-4 w-4" />
											<span>Unfollow</span>
										</>
									) : (
										<>
											<UserPlus className="h-4 w-4" />
											<span>Follow</span>
										</>
									)}
								</button>
								<button className="flex items-center gap-1 rounded-full bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
									<Mail className="h-4 w-4" />
									<span>Message</span>
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Profile Bio */}
				<div className="mt-6 max-w-2xl">
					<p className="text-gray-300">{profileData.bio || "No bio yet."}</p>
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
								Joined {new Date(profileData.createdAt).toLocaleDateString()}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
