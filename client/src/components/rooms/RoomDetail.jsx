import { ArrowLeft, Clock, Lock, Send, Shield, UserX } from "lucide-react";
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
	const [accessCode, setAccessCode] = useState("");
	const [messageContent, setMessageContent] = useState("");
	const [timeLeft, setTimeLeft] = useState("");
	const [isSending, setIsSending] = useState(false);

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
		if (currentRoom?.isPrivate && !accessCode) {
			showError("Access code is required for private rooms");
			return;
		}

		setIsJoining(true);
		try {
			const success = await joinRoom(
				roomId,
				currentRoom?.isPrivate ? accessCode : null
			);

			if (success) {
				await fetchMessages(roomId);
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
				<div className="mb-6 flex items-center gap-2">
					<Link to="/rooms" className="text-purple-400 hover:text-purple-300">
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<h1 className="text-2xl font-bold text-white">Room Not Found</h1>
				</div>

				<Card>
					<div className="p-6 text-center">
						<div className="mx-auto h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
							<UserX className="h-8 w-8 text-gray-600" />
						</div>
						<h2 className="mt-4 text-xl font-semibold text-white">
							Room Not Found
						</h2>
						<p className="mt-2 text-gray-400">
							This room may have expired or been deleted.
						</p>
						<Link
							to="/rooms"
							className="mt-6 inline-block rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
						>
							Browse Available Rooms
						</Link>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Link to="/rooms" className="text-purple-400 hover:text-purple-300">
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<h1 className="text-xl font-bold text-white">
						{currentRoom.name}
						{currentRoom.isPrivate && (
							<Lock className="inline-block ml-2 h-4 w-4 text-yellow-500" />
						)}
					</h1>
					{isParticipant && anonymousIdentity && (
						<div className="ml-4 text-xs text-purple-400 flex items-center">
							<Shield className="h-3 w-3 mr-1" />
							{anonymousIdentity.anonymousName}
						</div>
					)}
				</div>

				<div className="flex items-center gap-3">
					<div className="rounded-full bg-purple-900/30 px-3 py-1 text-xs text-purple-400 flex items-center gap-1">
						<Clock className="h-3 w-3" />
						{timeLeft}
					</div>

					{isParticipant ? (
						<button
							onClick={handleLeaveRoom}
							disabled={isLeaving}
							className="rounded-full border border-red-500 bg-transparent px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-900/20"
						>
							{isLeaving ? "Leaving..." : "Leave Room"}
						</button>
					) : (
						<button
							onClick={handleJoinRoom}
							disabled={isJoining}
							className="rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700"
						>
							{isJoining ? "Joining..." : "Join Room"}
						</button>
					)}
				</div>
			</div>

			{currentRoom.description && (
				<Card className="mb-4">
					<p className="text-sm text-gray-300">{currentRoom.description}</p>
					{currentRoom.tags && currentRoom.tags.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-2">
							{currentRoom.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300"
								>
									#{tag}
								</span>
							))}
						</div>
					)}
				</Card>
			)}

			{/* Private room access code entry */}
			{currentRoom.isPrivate && !isParticipant && (
				<Card className="mb-4">
					<div className="p-4 flex flex-col md:flex-row md:items-center">
						<div className="flex-1">
							<div className="flex items-center mb-2">
								<Lock className="h-5 w-5 text-yellow-500 mr-2" />
								<h3 className="text-lg font-medium text-white">Private Room</h3>
							</div>
							<p className="text-sm text-gray-400">
								This room requires an access code to join. Enter the code to
								participate.
							</p>
						</div>

						<div className="mt-4 md:mt-0 flex md:w-64">
							<input
								type="text"
								placeholder="Enter access code"
								value={accessCode}
								onChange={(e) => setAccessCode(e.target.value)}
								className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 uppercase"
								maxLength={6}
							/>
						</div>
					</div>
				</Card>
			)}

			{/* Message area */}
			<div className="flex flex-col h-[calc(100vh-260px)]">
				{isParticipant ? (
					<>
						<div className="flex-1 overflow-y-auto mb-4">
							<RoomMessages />
						</div>

						<form onSubmit={handleSendMessage} className="mt-auto">
							<div className="relative">
								<input
									type="text"
									placeholder="Type a message..."
									value={messageContent}
									onChange={(e) => setMessageContent(e.target.value)}
									disabled={isSending}
									className="w-full rounded-full border border-gray-700 bg-gray-800 px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
								/>
								<button
									type="submit"
									disabled={!messageContent.trim() || isSending}
									className="absolute right-2 top-2 rounded-full bg-purple-600 p-2 text-white hover:bg-purple-700 disabled:opacity-50"
								>
									<Send className="h-4 w-4" />
								</button>
							</div>
						</form>
					</>
				) : (
					<Card className="flex flex-col items-center justify-center py-16">
						<div className="mb-4 h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
							<UserX className="h-8 w-8 text-gray-600" />
						</div>
						<h3 className="text-lg font-medium text-white">
							You are not a member of this room
						</h3>
						<p className="mt-2 text-gray-400 text-center max-w-md">
							Join this room to see messages and participate in the
							conversation. All participants remain anonymous.
						</p>
						<button
							onClick={handleJoinRoom}
							disabled={isJoining || (currentRoom.isPrivate && !accessCode)}
							className="mt-6 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
						>
							{isJoining ? "Joining..." : "Join Room"}
						</button>
					</Card>
				)}
			</div>
		</div>
	);
}
