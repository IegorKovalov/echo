// client/src/components/Rooms/RoomMessageItem.jsx
import { formatDistanceToNow } from "date-fns";
import {
	CornerUpLeft,
	MessageSquare,
	ShieldAlert,
	Smile,
	Trash2,
	UserCircle,
} from "lucide-react";
import React, { useState } from "react";
import ProfileAvatar from "../UI/ProfileAvatar";

const RoomMessageItem = ({
	message,
	currentUserId,
	onSetReplyTo,
	onAdminDelete,
	onReact,
}) => {
	// Ensure message and its properties are defined before destructuring or accessing
	if (!message) {
		// Optionally render a placeholder or return null if a message is unexpectedly undefined
		console.warn("RoomMessageItem received an undefined message prop.");
		return null;
	}

	const {
		_id,
		roomMember,
		content,
		createdAt,
		replyTo,
		isSystem,
		isAdminDeleted,
	} = message;
	const [showActions, setShowActions] = useState(false);

	const senderUser = roomMember?.user;
	const senderDisplayName =
		senderUser?.fullName ||
		roomMember?.nickname ||
		roomMember?.anonymousId ||
		"System";

	const isOwnMessage = senderUser?._id === currentUserId;
	const timeAgo = createdAt
		? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
		: "a while ago";

	if (isSystem) {
		return (
			<div className="py-2 px-3 my-1 text-center">
				<p className="text-xs text-gray-500 italic">
					{content || "System message"}
				</p>
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
							? "bg-purple-700 text-white"
							: "bg-gray-600 text-gray-300"
					}`}
				>
					<div className="flex items-center mb-1">
						<ShieldAlert size={16} className="mr-2 text-yellow-400" />
						<p className="text-xs italic">{content || "[Message removed]"}</p>
					</div>
				</div>
			</div>
		);
	}

	// Basic reaction display (example)
	const reactionSummary =
		message.reactionCounts && typeof message.reactionCounts === "object"
			? Object.entries(message.reactionCounts)
					.map(([emoji, count]) => `${emoji} ${count}`)
					.join(" ")
			: "";

	return (
		<div
			className={`group flex ${
				isOwnMessage ? "justify-end" : "justify-start"
			} mb-1 relative`}
			onMouseEnter={() => setShowActions(true)}
			onMouseLeave={() => setShowActions(false)}
		>
			<div className={`flex items-start gap-2.5 max-w-[75%]`}>
				{!isOwnMessage && (
					<div className="mt-1 flex-shrink-0">
						<ProfileAvatar
							user={senderUser || { fullName: senderDisplayName }}
							size="xs"
						/>
					</div>
				)}
				<div
					className={`flex flex-col p-2.5 rounded-lg shadow-sm ${
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
					{replyTo && (
						<div
							className="mb-1 p-1.5 border-l-2 border-purple-400/50 bg-black/20 rounded text-xs text-gray-300 italic cursor-pointer hover:bg-black/30"
							onClick={() =>
								console.log("Scroll to replied message (TODO):", replyTo._id)
							}
						>
							<CornerUpLeft size={12} className="inline mr-1" />
							Replying to{" "}
							<span className="font-medium text-purple-300">
								{replyTo.roomMember?.user?.username ||
									replyTo.roomMember?.nickname ||
									"a message"}
							</span>
							:
							<span className="block ml-4 truncate max-w-[150px] text-gray-400">
								{replyTo.content || "Original message content"}
							</span>
						</div>
					)}
					<p className="text-sm leading-snug break-words">
						{content || "[Empty message]"}
					</p>
					{reactionSummary && (
						<div className="mt-1 text-xs text-gray-400 bg-black/20 px-1.5 py-0.5 rounded-full self-start">
							{reactionSummary}
						</div>
					)}
					<p
						className={`text-[10px] mt-1 ${
							isOwnMessage ? "text-purple-200" : "text-gray-500"
						} self-end`}
					>
						{timeAgo}
					</p>
				</div>
				{isOwnMessage && (
					<div className="mt-1 flex-shrink-0 ml-2.5">
						<ProfileAvatar user={senderUser} size="xs" />{" "}
						{/* Make sure senderUser is correct here */}
					</div>
				)}
			</div>
			{showActions &&
				!isSystem &&
				!isAdminDeleted &&
				_id && ( // Ensure _id exists for actions
					<div
						className={`absolute top-0 p-0.5 bg-gray-900/80 border border-gray-700 rounded-md shadow-lg flex items-center text-gray-300 space-x-0.5 transition-opacity duration-150 group-hover:opacity-100 opacity-0
                        ${isOwnMessage ? "right-full mr-2" : "left-full ml-2"}`}
					>
						{onSetReplyTo && (
							<button
								title="Reply"
								onClick={() => onSetReplyTo(message)}
								className="p-1 hover:bg-gray-700 rounded"
							>
								<MessageSquare size={14} />
							</button>
						)}
						{onReact && (
							<button
								title="React"
								onClick={() => onReact(_id, "👍")}
								className="p-1 hover:bg-gray-700 rounded"
							>
								<Smile size={14} />
							</button>
						)}
						{onAdminDelete && (
							<button
								title="Admin Delete"
								onClick={() => onAdminDelete(_id)}
								className="p-1 hover:bg-red-700/50 hover:text-red-400 rounded"
							>
								<Trash2 size={14} />
							</button>
						)}
					</div>
				)}
		</div>
	);
};

export default RoomMessageItem;
