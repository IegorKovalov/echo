import {
	ArrowLeft,
	Clock,
	Send,
	Shield,
	UserX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRoom } from "../../context/RoomContext";
import { useToast } from "../../context/ToastContext";
import Card from "../UI/Card";
import RoomMessages from "./RoomMessages";

export default function RoomDetail() {
	const { roomId } = useParams();
	const { user } = useAuth();
	const {
		currentRoom,
		fetchRoom,
		joinRoom,
		leaveRoom,
		fetchMessages,
		sendMessage,
		anonymousIdentity,
		initializeRoomIdentity,
	} = useRoom();
	const { showError, showSuccess } = useToast();
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(true);
	const [isJoining, setIsJoining] = useState(false);
	const [isLeaving, setIsLeaving] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [messageContent, setMessageContent] = useState("");
	const [timeLeft, setTimeLeft] = useState("");
	const intervalRef = useRef(null);

	const timerRef = useRef(null);

	useEffect(() => {
		const loadRoom = async () => {
			setIsLoading(true);
			try {
				const room = await fetchRoom(roomId);

				if (room) {
					// Initialize or retrieve anonymous identity
					const identity = initializeRoomIdentity(roomId);

					// If user is a participant and has an identity, fetch messages
					if (room.participants.includes(user._id) && identity) {
						await fetchMessages(roomId);
					}

					// Start timer for time remaining
					updateTimeLeft();
				}
			} catch (error) {
				console.error("Error loading room:", error);
				if (error.response?.status === 410) {
					// Room expired
					navigate("/rooms");
				}
			} finally {
				setIsLoading(false);
			}
		};

		loadRoom();

		// Cleanup timer on unmount
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [
		roomId,
		fetchRoom,
		fetchMessages,
		user,
		navigate,
		initializeRoomIdentity,
	]);

	// Update time left every minute
	const updateTimeLeft = () => {
		const calculateTimeLeft = () => {
			if (!currentRoom?.expiresAt) return "";

			const now = new Date();
			const expiry = new Date(currentRoom.expiresAt);
			const diffMs = expiry - now;

			if (diffMs <= 0) {
				// Room expired, navigate away
				showError("This room has expired");
				navigate("/rooms");
				return "Expired";
			}

			const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
			const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

			if (diffHrs > 0) {
				return `${diffHrs}h ${diffMins}m remaining`;
			}
			return `${diffMins}m remaining`;
		};

		setTimeLeft(calculateTimeLeft());

		// Update every minute
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}

		timerRef.current = setInterval(() => {
			setTimeLeft(calculateTimeLeft());
		}, 60000); // Update every minute
	};

	const handleJoinRoom = async () => {
		if (isJoining) return;

		try {
			setIsJoining(true);
			const success = await joinRoom(roomId);

			if (success) {
				// Reset states
				setIsJoining(false);
			}
		} catch (error) {
			console.error("Error joining room:", error);
		} finally {
			setIsJoining(false);
		}
	};

	const handleLeaveRoom = async () => {
		if (!window.confirm("Are you sure you want to leave this room?")) {
			return;
		}

		setIsLeaving(true);
		try {
			const success = await leaveRoom(roomId);

			if (success) {
				navigate("/rooms");
			}
		} catch (error) {
			console.error("Error leaving room:", error);
		} finally {
			setIsLeaving(false);
		}
	};

	const handleSendMessage = async (e) => {
		e.preventDefault();

		if (!messageContent.trim()) return;

		setIsSending(true);
		try {
			await sendMessage(messageContent.trim());
			setMessageContent("");
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setIsSending(false);
		}
	};

	const isParticipant = currentRoom?.participants?.includes(user?._id);

	// Loading state
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-purple-900/50"></div>
					<p className="mt-4 text-gray-400">Loading room...</p>
				</div>
			</div>
		);
	}

	// Room not found
	if (!currentRoom) {
		return (
			<div className="max-w-2xl mx-auto">
				<div className="mb-6 flex items-center gap-3">
					<Link to="/rooms" className="text-purple-400 hover:text-purple-300 transition-colors">
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<h1 className="text-2xl font-bold text-white">Room Not Found</h1>
				</div>

				<Card className="border border-gray-800">
					<div className="text-center py-10">
						<div className="mx-auto h-16 w-16 rounded-full bg-gray-800/50 flex items-center justify-center">
							<Shield className="h-8 w-8 text-gray-600" />
						</div>
						<h3 className="mt-4 text-lg font-medium text-white">
							Room Not Available
						</h3>
						<p className="mt-2 text-gray-400 max-w-md mx-auto">
							This room may have expired or been deleted.
						</p>
						<Link
							to="/rooms"
							className="mt-5 inline-block rounded-lg bg-purple-600 px-5 py-2.5 text-white hover:bg-purple-700 transition-colors shadow-md shadow-purple-900/20"
						>
							Back to Rooms
						</Link>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="flex items-center gap-3">
					<Link to="/rooms" className="text-purple-400 hover:text-purple-300 transition-colors">
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<div>
						<div className="mb-6">
							<div className="flex items-center justify-between">
								<h1 className="text-2xl font-bold text-white">{currentRoom.name}</h1>
								<div className="flex items-center gap-2">
									{currentRoom.isOfficial && (
										<div className="flex items-center text-purple-400 gap-1">
											<Shield className="h-4 w-4" />
											<span className="text-sm font-medium">Official Room</span>
										</div>
									)}
									<div className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 flex items-center gap-1 border border-purple-500/20">
										<Clock className="h-3.5 w-3.5" />
										{timeLeft}
									</div>
								</div>
							</div>
							<p className="mt-1 text-gray-400 text-sm">
								{currentRoom.description || "No description provided"}
							</p>
							{currentRoom.isOfficial ? (
								<p className="mt-3 text-xs text-gray-500">Created by {currentRoom.officialName || "Echo Team"}</p>
							) : (
								<p className="mt-3 text-xs text-gray-500">Created by {currentRoom.creator?.username || "Anonymous"}</p>
							)}
						</div>
					</div>
				</div>

				{isParticipant && (
					<button
						onClick={handleLeaveRoom}
						disabled={isLeaving}
						className="flex items-center gap-1.5 rounded-full bg-red-900/30 text-red-400 border border-red-900/40 px-4 py-1.5 text-sm font-medium hover:bg-red-900/40 transition-colors self-start sm:self-center"
					>
						<UserX className="h-4 w-4" />
						{isLeaving ? "Leaving..." : "Leave Room"}
					</button>
				)}
			</div>

			{currentRoom.description && (
				<Card className="mb-6 border border-gray-800">
					<p className="text-gray-300">{currentRoom.description}</p>
				</Card>
			)}

			{/* Room content */}
			<Card className="mb-6 border border-gray-800">
				{!isParticipant ? (
					<div className="text-center py-10">
						<div className="mx-auto h-16 w-16 rounded-full bg-purple-900/20 flex items-center justify-center">
							<Shield className="h-8 w-8 text-purple-400" />
						</div>
						<h3 className="mt-4 text-xl font-medium text-white">
							Join this Room
						</h3>
						<p className="mt-2 text-gray-400 max-w-md mx-auto">
							Join this anonymous room to see and send messages. Your identity will
							remain anonymous.
						</p>
						<button
							onClick={handleJoinRoom}
							disabled={isJoining}
							className="mt-5 rounded-lg bg-purple-600 px-5 py-2.5 text-white font-medium hover:bg-purple-700 transition-colors shadow-md shadow-purple-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
						>
							{isJoining ? "Joining..." : "Join Room"}
						</button>
					</div>
				) : (
					<div className="flex flex-col">
						<div className="flex-1 overflow-hidden">
							{/* Messages container */}
							<RoomMessages />
						</div>

						{/* Message input */}
						<div className="mt-4 pt-4 border-t border-gray-800">
							<form onSubmit={handleSendMessage} className="flex gap-2">
								<input
									type="text"
									value={messageContent}
									onChange={(e) => setMessageContent(e.target.value)}
									placeholder="Type a message..."
									className="flex-1 rounded-lg border border-gray-700 bg-gray-800/80 p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
								/>
								<button
									type="submit"
									disabled={isSending || !messageContent.trim()}
									className="rounded-lg bg-purple-600 px-4 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
								>
									<Send className="h-5 w-5" />
									<span className="sr-only">Send</span>
								</button>
							</form>
							<div className="mt-2 flex items-center justify-between">
								<p className="text-xs text-gray-500">
									Posting as{" "}
									<span className="font-medium text-purple-400">
										{anonymousIdentity?.name || "Anonymous"}
									</span>
								</p>
								<p className="text-xs text-gray-500">
									Messages will disappear when the room expires
								</p>
							</div>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}
