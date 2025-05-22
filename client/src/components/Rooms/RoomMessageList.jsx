import React, { useEffect, useRef } from "react";
import EmptyState from "../UI/EmptyState";
import LoadingSpinner from "../UI/LoadingSpinner";
import RoomMessageItem from "./RoomMessageItem";

const RoomMessageList = ({
	messages,
	loading,
	currentUserId,
	onFetchMoreMessages,
	hasMoreMessages,
}) => {
	const messagesEndRef = useRef(null);
	const messagesContainerRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		// Scroll to bottom when new messages are added,
		// but only if user is already near the bottom (to avoid interrupting scrolling up)
		if (messagesContainerRef.current) {
			const { scrollTop, scrollHeight, clientHeight } =
				messagesContainerRef.current;
			// Consider "near bottom" if scroll is within (e.g.) 2x clientHeight of the bottom
			if (scrollHeight - scrollTop < clientHeight * 2.5) {
				scrollToBottom();
			}
		}
	}, [messages]);

	if (loading && (!messages || messages.length === 0)) {
		return (
			<div className="flex-grow flex items-center justify-center p-4">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div
			ref={messagesContainerRef}
			className="flex-grow p-4 space-y-2 overflow-y-auto bg-gray-850 rounded-b-lg"
		>
			{/* Placeholder for "Load More" button */}
			{hasMoreMessages && !loading && (
				<div className="text-center my-2">
					<button
						onClick={onFetchMoreMessages}
						className="text-purple-400 hover:text-purple-300 text-xs py-1 px-3 rounded-full border border-purple-500 hover:bg-purple-500/10"
					>
						Load older messages
					</button>
				</div>
			)}
			{loading && messages && messages.length > 0 && (
				<div className="text-center my-2">
					<LoadingSpinner />
				</div>
			)}

			{!loading && (!messages || messages.length === 0) && (
				<div className="flex-grow flex items-center justify-center">
					<EmptyState message="No messages yet. Be the first to say something!" />
				</div>
			)}

			{messages &&
				messages.map((msg) => (
					<RoomMessageItem
						key={msg._id}
						message={msg}
						currentUserId={currentUserId}
					/>
				))}
			<div ref={messagesEndRef} />
		</div>
	);
};

export default RoomMessageList;
