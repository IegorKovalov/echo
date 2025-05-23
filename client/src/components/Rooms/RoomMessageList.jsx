// client/src/components/Rooms/RoomMessageList.jsx
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import EmptyState from "../UI/EmptyState";
import LoadingSpinner from "../UI/LoadingSpinner";
import RoomMessageItem from "./RoomMessageItem"; // Correct import

const RoomMessageList = ({
	messages,
	loading,
	loadingMore,
	currentUserId,
	onFetchMoreMessages,
	hasMoreMessages,
	onSetReplyTo,
	onAdminDelete,
	onReact,
}) => {
	const messagesEndRef = useRef(null);
	const messagesContainerRef = useRef(null);
	const prevScrollHeightRef = useRef(null);

	const scrollToBottom = (behavior = "smooth") => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior });
		}
	};

	useEffect(() => {
		if (messagesContainerRef.current) {
			const { scrollHeight, scrollTop, clientHeight } =
				messagesContainerRef.current;
			// If it's not loading more (i.e., new messages at bottom or initial load)
			if (!loadingMore) {
				// Check if user was near the bottom OR it's the initial set of messages (prevScrollHeight is null)
				// The 300px threshold is arbitrary, adjust as needed
				const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
				if (isNearBottom || prevScrollHeightRef.current === null) {
					scrollToBottom("auto");
				}
			}
			// Update prevScrollHeight *after* potential scroll adjustment or new messages render
			// Do this in a timeout to ensure DOM has updated
			setTimeout(() => {
				if (messagesContainerRef.current) {
					prevScrollHeightRef.current =
						messagesContainerRef.current.scrollHeight;
				}
			}, 0);
		}
	}, [messages, loadingMore]);

	useEffect(() => {
		// This effect is for maintaining scroll position when older messages are loaded (prepended)
		if (
			!loadingMore &&
			messagesContainerRef.current &&
			prevScrollHeightRef.current != null
		) {
			const currentScrollHeight = messagesContainerRef.current.scrollHeight;
			if (prevScrollHeightRef.current !== currentScrollHeight) {
				// Content was prepended, adjust scroll to maintain view
				messagesContainerRef.current.scrollTop +=
					currentScrollHeight - prevScrollHeightRef.current;
			}
		}
	}, [loadingMore]); // Only run when loadingMore changes

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
			className="flex-grow p-4 space-y-1 overflow-y-auto bg-gray-850 rounded-b-lg"
		>
			{hasMoreMessages && !loadingMore && (
				<div className="text-center my-3">
					<button
						onClick={onFetchMoreMessages}
						className="text-purple-400 hover:text-purple-300 text-xs py-1.5 px-4 rounded-full border border-purple-500/50 hover:bg-purple-500/10 transition-colors"
					>
						Load older messages
					</button>
				</div>
			)}
			{loadingMore && (
				<div className="text-center my-3 flex justify-center items-center text-purple-400">
					<Loader2 size={18} className="animate-spin mr-2" /> Loading...
				</div>
			)}

			{!loading && (!messages || messages.length === 0) && (
				<div className="flex-grow flex items-center justify-center h-full">
					<EmptyState message="No messages yet. Be the first to say something!" />
				</div>
			)}

			{messages &&
				messages.map(
					(
						msg // msg should be defined here
					) =>
						msg ? ( // Add a check to ensure msg itself is not undefined in the array
							<RoomMessageItem
								key={msg._id || `msg-${Math.random()}`} // Fallback key if _id is missing
								message={msg}
								currentUserId={currentUserId}
								onSetReplyTo={onSetReplyTo}
								onAdminDelete={onAdminDelete}
								onReact={onReact}
							/>
						) : null
				)}
			<div ref={messagesEndRef} />
		</div>
	);
};

export default RoomMessageList;
