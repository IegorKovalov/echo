import { Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileAvatar from "./ProfileAvatar";

const RoomMessageForm = ({
	onSendMessage,
	roomId,
	isSending,
	replyingTo,
	onCancelReply,
}) => {
	const [messageContent, setMessageContent] = useState("");
	const { user } = useAuth();
	const inputRef = useRef(null);

	useEffect(() => {
		// Focus input when replyingTo changes (and is not null)
		if (replyingTo && inputRef.current) {
			inputRef.current.focus();
		}
	}, [replyingTo]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!messageContent.trim()) return;
		// onSendMessage now just takes the content, RoomDetailPage handles if it's a reply
		onSendMessage(messageContent.trim());
		setMessageContent("");
		// onCancelReply(); // Automatically cancel reply after sending, handled by RoomDetailPage
	};

	return (
		<div className="p-3 border-t border-gray-700 bg-gray-800">
			{replyingTo && (
				<div className="mb-2 p-2 bg-gray-700 rounded-md text-xs text-gray-300 flex justify-between items-center">
					<div>
						Replying to{" "}
						<span className="font-semibold text-purple-300">
							{replyingTo.userName}
						</span>
						:
						<em className="block truncate max-w-xs sm:max-w-sm md:max-w-md">
							"{replyingTo.contentSnippet}"
						</em>
					</div>
					<button
						onClick={onCancelReply}
						className="p-1 text-gray-400 hover:text-white rounded-full"
					>
						<X size={16} />
					</button>
				</div>
			)}
			<form
				onSubmit={handleSubmit}
				className="flex items-center gap-2 sm:gap-3"
			>
				<div className="flex-shrink-0">
					<ProfileAvatar user={user} size="sm" />
				</div>
				<input
					ref={inputRef}
					type="text"
					value={messageContent}
					onChange={(e) => setMessageContent(e.target.value)}
					placeholder={
						replyingTo
							? `Reply to ${replyingTo.userName}...`
							: "Type your message..."
					}
					className="flex-grow bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-full py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
					disabled={isSending}
				/>
				<button
					type="submit"
					disabled={isSending || !messageContent.trim()}
					className="p-2.5 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors flex-shrink-0"
				>
					<Send size={20} />
				</button>
			</form>
		</div>
	);
};

export default RoomMessageForm;
