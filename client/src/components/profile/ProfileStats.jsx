import React, { useEffect, useState } from "react";
import { useFollower } from "../../context/FollowerContext";

export default function ProfileStats({
	postsCount,
	onOpenFollowersModal,
	userId,
}) {
	const { getFollowerStats, isLoadingStats } = useFollower();
	const [stats, setStats] = useState({
		followers: 0,
		following: 0,
		isFollowing: false,
	});

	useEffect(() => {
		const loadStats = async () => {
			if (userId) {
				const followerStats = await getFollowerStats(userId);
				if (followerStats) {
					setStats(followerStats);
				}
			}
		};

		loadStats();
	}, [userId, getFollowerStats]);

	return (
		<div className="mt-6 flex justify-start gap-8 border-b border-gray-800 py-4">
			<div className="text-center">
				<div className="font-bold text-white">{postsCount}</div>
				<div className="text-sm text-gray-400">Echoes</div>
			</div>
			<button
				onClick={() => onOpenFollowersModal("following")}
				className="text-center hover:opacity-80 transition-opacity"
			>
				<div className="font-bold text-white">
					{isLoadingStats ? "..." : stats.following}
				</div>
				<div className="text-sm text-gray-400">Following</div>
			</button>
			<button
				onClick={() => onOpenFollowersModal("followers")}
				className="text-center hover:opacity-80 transition-opacity"
			>
				<div className="font-bold text-white">
					{isLoadingStats ? "..." : stats.followers}
				</div>
				<div className="text-sm text-gray-400">Followers</div>
			</button>
		</div>
	);
}
