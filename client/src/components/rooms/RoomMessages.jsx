import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef, memo } from "react";
import { useRoom } from "../../context/RoomContext";

// Message item component - extracted for better organization
const MessageItem = memo(({ message, isCurrentUser }) => {
	const messageTime = new Date(message.createdAt).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div
			className={`mb-4 flex ${
				isCurrentUser ? "justify-end" : "justify-start"
			}`}
		>
			<div
				className={`max-w-[75%] rounded-lg px-4 py-2 ${
					isCurrentUser
						? "bg-purple-700 text-white"
						: "bg-gray-800 text-gray-200"
				}`}
			>
				{!isCurrentUser && (
					<div className="mb-1 text-xs font-medium text-gray-400">
						{message.anonymousName}
					</div>
				)}
				<p className="text-sm">{message.content}</p>

				<div className="mt-1 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<button className="flex items-center gap-1 text-gray-400 hover:text-gray-300">
							<ThumbsUp className="h-3 w-3" />
							<span className="text-xs">
								{message.reactions?.likes || 0}
							</span>
						</button>
						<button className="flex items-center gap-1 text-gray-400 hover:text-gray-300">
							<ThumbsDown className="h-3 w-3" />
							<span className="text-xs">
								{message.reactions?.dislikes || 0}
							</span>
						</button>
					</div>
					<div className="text-xs text-gray-400">{messageTime}</div>
				</div>
			</div>
		</div>
	);
});

// Empty state component - displayed when no messages
const EmptyState = () => (
	<div className="flex h-full flex-col items-center justify-center text-center p-8">
		<div className="mb-4 h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
			<MessageCircle className="h-6 w-6 text-gray-600" />
		</div>
		<h3 className="text-lg font-medium text-white">No messages yet</h3>
		<p className="mt-2 text-gray-400 max-w-md">
			Be the first to send a message in this room. All messages will be
			anonymous.
		</p>
	</div>
);

// Loading indicator component
const LoadingIndicator = () => (
	<div className="text-center py-2">
		<p className="text-sm text-gray-400">Loading more messages...</p>
	</div>
);

export default function RoomMessages() {
	const {
		messages,
		loadingMessages,
		loadMoreMessages,
		hasMoreMessages,
		anonymousIdentity,
	} = useRoom();
	const messagesEndRef = useRef(null);
	const containerRef = useRef(null);
	const sentinelRef = useRef(null);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	useEffect(() => {
		if (!sentinelRef.current || !hasMoreMessages) return;

		const options = {
			root: containerRef.current,
			threshold: 0.1,
			rootMargin: "100px",
		};

		const observer = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting && hasMoreMessages && !loadingMessages) {
				loadMoreMessages();
			}
		}, options);

		observer.observe(sentinelRef.current);

		return () => observer.disconnect();
	}, [hasMoreMessages, loadingMessages, loadMoreMessages]);

	if (!messages || messages.length === 0) {
		return <EmptyState />;
	}

	return (
		<div ref={containerRef} className="h-full overflow-y-auto p-2">
			{/* Sentinel for infinite scroll */}
			<div ref={sentinelRef} className="h-2 w-full">
				{loadingMessages && messages.length > 0 && <LoadingIndicator />}
			</div>

			{/* Message list */}
			{messages.map((message) => (
				<MessageItem 
					key={message._id}
					message={message}
					isCurrentUser={message.anonymousId === anonymousIdentity?.anonymousId}
				/>
			))}
			
			{/* Auto-scroll anchor */}
			<div ref={messagesEndRef} />
		</div>
	);
}
