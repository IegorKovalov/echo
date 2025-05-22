import { Send } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileAvatar from "./ProfileAvatar";

const RoomMessageForm = ({ onSendMessage, roomId, isSending }) => {
	const [messageContent, setMessageContent] = useState("");
	const { user } = useAuth();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!messageContent.trim()) return;
		onSendMessage(roomId, { content: messageContent.trim(), format: "plain" });
		setMessageContent("");
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="p-4 border-t border-gray-700 bg-gray-800"
		>
			<div className="flex items-center gap-3">
				<ProfileAvatar user={user} size="sm" />
				<input
					type="text"
					value={messageContent}
					onChange={(e) => setMessageContent(e.target.value)}
					placeholder="Type your message..."
					className="flex-grow bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
					disabled={isSending}
				/>
				<button
					type="submit"
					disabled={isSending || !messageContent.trim()}
					className="p-2.5 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
				>
					<Send size={20} />
				</button>
			</div>
		</form>
	);
};

export default RoomMessageForm;
