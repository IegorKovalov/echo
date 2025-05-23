// client/src/components/Rooms/RoomMessageList.jsx
import { Loader2 } from "lucide-react"; // For loading more spinner
import React, { useEffect, useRef } from "react";
import EmptyState from "../UI/EmptyState";
import LoadingSpinner from "../UI/LoadingSpinner";
import RoomMessageItem from "./RoomMessageItem";

const RoomMessageList = ({
	messages,
	loading, // Initial loading
	loadingMore, // Loading more messages
	currentUserId,
	onFetchMoreMessages,
	hasMoreMessages,
	onSetReplyTo,
	onAdminDelete,
	onReact,
}) => {
	const messagesEndRef = useRef(null);
	const messagesContainerRef = useRef(null);
	const prevScrollHeightRef = useRef(null); // To keep track of scroll height before new messages load

	const scrollToBottom = (behavior = "smooth") => {
		messagesEndRef.current?.scrollIntoView({ behavior });
	};

	useEffect(() => {
		// On initial load or when messages array fundamentally changes (e.g., new room)
		if (!loadingMore && messagesContainerRef.current) {
			// If it's not loading more, it's likely initial load or new messages at bottom
			const { scrollHeight } = messagesContainerRef.current;
			if (scrollHeight !== prevScrollHeightRef.current && messages.length > 0) {
				const isNearBottom =
					messagesContainerRef.current.scrollHeight -
						messagesContainerRef.current.scrollTop -
						messagesContainerRef.current.clientHeight <
					200;
				if (isNearBottom || !prevScrollHeightRef.current) {
					// Scroll if near bottom or first load
					scrollToBottom("auto"); // "auto" for instant scroll on new message/initial
				}
			}
			prevScrollHeightRef.current = scrollHeight;
		}
	}, [messages, loadingMore]);

	useEffect(() => {
		// When loading more (older) messages, try to maintain scroll position
		if (
			loadingMore &&
			messagesContainerRef.current &&
			prevScrollHeightRef.current != null
		) {
			// Content is being prepended.
			// No specific action needed here if prepending maintains visual stability.
			// If jumpiness occurs, one might need to adjust scrollTop after new messages are rendered.
		} else if (
			!loadingMore &&
			messagesContainerRef.current &&
			prevScrollHeightRef.current != null
		) {
			// After older messages are loaded
			const currentScrollHeight = messagesContainerRef.current.scrollHeight;
			if (
				prevScrollHeightRef.current !== currentScrollHeight &&
				prevScrollHeightRef.current !== null
			) {
				// Adjust scroll position to maintain view
				messagesContainerRef.current.scrollTop +=
					currentScrollHeight - prevScrollHeightRef.current;
			}
		}

		// Update previous scroll height *before* new messages potentially change it in the next render cycle
		if (messagesContainerRef.current) {
			prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
		}
	}, [messages, loadingMore]);

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
					{" "}
					{/* Ensure it takes height */}
					<EmptyState message="No messages yet. Be the first to say something!" />
				</div>
			)}

			{messages &&
				messages.map((msg) => (
					<RoomMessageItem
						key={msg._id}
						message={msg}
						currentUserId={currentUserId}
						onSetReplyTo={onSetReplyTo}
						onAdminDelete={onAdminDelete}
						onReact={onReact}
					/>
				))}
			<div ref={messagesEndRef} />
		</div>
	);
};

export default RoomMessageList;
