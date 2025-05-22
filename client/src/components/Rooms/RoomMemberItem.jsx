import { ShieldCheck, UserCircle } from "lucide-react"; // ShieldCheck for admin
import React from "react";

const RoomMemberItem = ({ member }) => {
	// Backend provides anonymousId and nickname. Prioritize nickname if available.
	// The `member.user` object might not be populated in roomMember list,
	// so rely on fields available directly on the `member` object from RoomMember model.
	const displayName = member.nickname || member.anonymousId || "Anonymous";
	const isAdmin = member.role === "admin";

	return (
		<div className="flex items-center p-2 hover:bg-gray-700 rounded-md transition-colors duration-150">
			<UserCircle size={20} className="text-gray-400 mr-2" />
			<span
				className={`text-sm ${
					isAdmin ? "text-purple-400 font-semibold" : "text-gray-300"
				}`}
			>
				{displayName}
			</span>
			{isAdmin && (
				<ShieldCheck
					size={16}
					className="ml-auto text-purple-500"
					title="Admin"
				/>
			)}
			{/* Add online/offline indicator later based on member.isOnline */}
		</div>
	);
};

export default RoomMemberItem;
