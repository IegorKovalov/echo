import React from "react";

export default function ProfileStats({ postsCount, onOpenFollowersModal }) {
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
				<div className="font-bold text-white">0</div>
				<div className="text-sm text-gray-400">Following</div>
			</button>
			<button
				onClick={() => onOpenFollowersModal("followers")}
				className="text-center hover:opacity-80 transition-opacity"
			>
				<div className="font-bold text-white">0</div>
				<div className="text-sm text-gray-400">Followers</div>
			</button>
		</div>
	);
}
