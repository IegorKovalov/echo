import { formatDistanceToNow } from "date-fns";
import { CornerUpLeft, ShieldAlert, UserCircle } from "lucide-react";
import React from "react";
import ProfileAvatar from "../UI/ProfileAvatar"; // Assuming member might have user data later

const RoomMessageItem = ({ message, currentUserId }) => {
	const {
		roomMember,
		content,
		createdAt,
		format,
		replyTo,
		isSystem,
		isAdminDeleted,
	} = message;

	// Use anonymousId or nickname from roomMember for display
	// The roomMember object from the message should have anonymousId and nickname
	const senderDisplayName =
		roomMember?.nickname || roomMember?.anonymousId || "System";
	const senderProfilePic = roomMember?.user?.profilePicture; // If user is populated on roomMember

	// Check if the message is from the current user
	// This requires roomMember.user to be populated with the actual user ID
	// const isOwnMessage = roomMember?.user?._id === currentUserId;
	// For now, let's assume we don't have user._id on roomMember directly for messages for simplicity
	const isOwnMessage = false;

	const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

	if (isSystem) {
		return (
			<div className="py-2 px-3 my-1 text-center">
				<p className="text-xs text-gray-500 italic">{content}</p>
			</div>
		);
	}

	if (isAdminDeleted) {
		return (
			<div
				className={`flex ${
					isOwnMessage ? "justify-end" : "justify-start"
				} mb-2`}
			>
				<div
					className={`py-2 px-3 rounded-lg max-w-xs lg:max-w-md ${
						isOwnMessage
							? "bg-purple-600 text-white"
							: "bg-gray-700 text-gray-200"
					}`}
				>
					<div className="flex items-center mb-1">
						<ShieldAlert size={16} className="mr-2 text-yellow-400" />
						<p className="text-xs italic">{content}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`flex ${
				isOwnMessage ? "justify-end" : "justify-start"
			} mb-3 last:mb-0`}
		>
			<div className={`flex items-start gap-2.5 max-w-[75%]`}>
				{!isOwnMessage && (
					<div className="mt-1">
						{senderProfilePic ? (
							<ProfileAvatar
								user={{ profilePicture: senderProfilePic }}
								size="xs"
							/>
						) : (
							<UserCircle size={32} className="text-gray-500 flex-shrink-0" />
						)}
					</div>
				)}
				<div
					className={`flex flex-col p-2.5 rounded-lg ${
						isOwnMessage
							? "bg-purple-600 text-white rounded-br-none"
							: "bg-gray-700 text-gray-200 rounded-bl-none"
					}`}
				>
					{!isOwnMessage && (
						<p className="text-xs font-semibold text-purple-300 mb-0.5">
							{senderDisplayName}
						</p>
					)}
					{replyTo && ( // Basic display for reply context
						<div className="mb-1 p-1.5 border-l-2 border-purple-400 bg-gray-600/50 rounded text-xs text-gray-300 italic">
							<CornerUpLeft size={12} className="inline mr-1" />
							Replying to a message...{" "}
							{/* Enhance this later to show replied message snippet */}
						</div>
					)}
					{/* TODO: Handle markdown if format === 'markdown' */}
					<p className="text-sm leading-snug break-words">{content}</p>
					<p
						className={`text-xs mt-1 ${
							isOwnMessage ? "text-purple-200" : "text-gray-500"
						} self-end`}
					>
						{timeAgo}
					</p>
				</div>
			</div>
		</div>
	);
};

export default RoomMessageItem;
