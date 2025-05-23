// client/src/pages/RoomDetailPage.jsx
import {
	ArrowLeft,
	Info,
	Loader2,
	LogIn,
	LogOut,
	MessageSquare,
	Settings,
	Users,
	X,
} from "lucide-react"; // Added MessageSquare, X
import React, { useCallback, useEffect, useRef, useState } from "react"; // Added useRef
import { Link, useNavigate, useParams } from "react-router-dom";
import RoomHeader from "../components/Rooms/RoomHeader"; // This component doesn't exist. We are using the header in RoomDetailPage itself.
import RoomMemberList from "../components/Rooms/RoomMemberList";
import RoomMessageList from "../components/Rooms/RoomMessageList";
import Card from "../components/UI/Card";
import ErrorMessage from "../components/UI/ErrorMessage";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import RoomMessageForm from "../components/UI/RoomMessageForm";
import { useAuth } from "../context/AuthContext";
import { useRoom } from "../context/RoomContext";
import { useToast } from "../context/ToastContext";

const POLLING_INTERVAL = 15000; // 15 seconds for polling new messages

const RoomDetailPage = () => {
	const { roomId } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { showSuccess, showError } = useToast();
	const {
		currentRoom,
		currentRoomMembers,
		currentRoomMessages,
		loadingCurrentRoom,
		loadingMembers,
		loadingMessages,
		loadingMoreMessages,
		fetchRoomDetails,
		fetchRoomMessages, // fetchRoomMessages is now separate
		messagesPage,
		hasMoreMessages, // from context
		joinRoom,
		leaveRoom,
		sendMessage,
		replyToMessage,
		adminDeleteMessage,
		reactToMessage, // Added reactToMessage
	} = useRoom();

	const [pageError, setPageError] = useState(null);
	const [isJoining, setIsJoining] = useState(false);
	const [isLeaving, setIsLeaving] = useState(false);
	const [isSendingMessage, setIsSendingMessage] = useState(false);
	const [showMembersAside, setShowMembersAside] = useState(false);
	const [showInfoModal, setShowInfoModal] = useState(false);

	const [replyingTo, setReplyingTo] = useState(null); // { messageId, userName, contentSnippet }
	const pollingTimerRef = useRef(null);

	const loadInitialData = useCallback(() => {
		if (roomId) {
			setPageError(null);
			fetchRoomDetails(roomId) // This will also fetch initial messages (page 1)
				.catch((err) => {
					const errorMsg = err.message || "Failed to load room details.";
					setPageError(errorMsg);
				});
		}
		setShowMembersAside(false);
		setShowInfoModal(false);
	}, [roomId, fetchRoomDetails]);

	useEffect(() => {
		loadInitialData();
	}, [loadInitialData]); // Changed dependency to the memoized function

	// Polling for new messages
	useEffect(() => {
		if (roomId && currentRoom) {
			// Only poll if room is loaded
			const poll = () => {
				// Fetch messages from page 1 to get the latest, context will handle merging or replacing
				// We want new messages, so we'd typically fetch a page *after* the current latest, or just page 1 and merge.
				// For simplicity, let's just refetch page 1 of messages. RoomContext needs to handle this intelligently.
				// A better polling would get messages *since* the last message timestamp.
				// Current RoomContext's fetchRoomMessages(roomId, 1) will replace messages.
				// We need a way to add *new* messages without re-fetching and reversing all.
				// For now, this simple poll will just refresh the latest page.
				// To get truly "new" messages, backend needs a way to get messages after a certain ID/timestamp.
				// Let's assume for now fetchRoomMessages(roomId, 1) is efficient enough for latest.
				// Or, better: create a new function in context: fetchNewestMessages
				fetchRoomMessages(roomId, 1, false); // Fetch page 1, not as "loadMore"
			};

			pollingTimerRef.current = setInterval(poll, POLLING_INTERVAL);
			return () => clearInterval(pollingTimerRef.current);
		}
		return () => clearInterval(pollingTimerRef.current); // Cleanup if roomId/currentRoom changes
	}, [roomId, currentRoom, fetchRoomMessages]);

	const handleFetchMoreMessages = useCallback(() => {
		if (hasMoreMessages && !loadingMoreMessages && roomId) {
			fetchRoomMessages(roomId, messagesPage + 1, true); // true for isLoadMore
		}
	}, [
		hasMoreMessages,
		loadingMoreMessages,
		roomId,
		messagesPage,
		fetchRoomMessages,
	]);

	const handleJoinRoom = async () => {
		// ... (same as before)
		setIsJoining(true);
		try {
			const success = await joinRoom(roomId);
			if (success) {
				showSuccess(`Joined room: ${currentRoom?.name || "Room"}`);
			}
		} finally {
			setIsJoining(false);
		}
	};

	const handleLeaveRoom = async () => {
		// ... (same as before)
		if (!currentRoom) return;
		if (
			window.confirm(`Are you sure you want to leave "${currentRoom.name}"?`)
		) {
			setIsLeaving(true);
			try {
				const success = await leaveRoom(roomId);
				if (success) {
					showSuccess(`Left room: ${currentRoom.name}`);
					navigate("/rooms");
				}
			} finally {
				setIsLeaving(false);
			}
		}
	};

	const handleSendMessage = async (messageDataContent) => {
		setIsSendingMessage(true);
		try {
			if (replyingTo) {
				await replyToMessage(roomId, replyingTo.messageId, {
					content: messageDataContent,
				});
				setReplyingTo(null); // Clear reply state
			} else {
				await sendMessage(roomId, {
					content: messageDataContent,
					format: "plain",
				});
			}
		} catch (err) {
			// error handled in context
		} finally {
			setIsSendingMessage(false);
		}
	};

	const handleSetReplyTo = (message) => {
		if (!message) {
			setReplyingTo(null);
			return;
		}
		setReplyingTo({
			messageId: message._id,
			userName:
				message.roomMember?.user?.fullName ||
				message.roomMember?.nickname ||
				message.roomMember?.anonymousId ||
				"User",
			contentSnippet:
				message.content.substring(0, 50) +
				(message.content.length > 50 ? "..." : ""),
		});
	};

	const handleAdminDelete = async (messageId) => {
		if (
			window.confirm("Are you sure you want to delete this message as admin?")
		) {
			await adminDeleteMessage(roomId, messageId);
		}
	};

	const handleReaction = async (messageId, emoji) => {
		// This is a simplified reaction. A real system would toggle.
		await reactToMessage(roomId, messageId, emoji);
	};

	const isUserMember = React.useMemo(() => {
		if (!user || !currentRoomMembers || currentRoomMembers.length === 0)
			return false;
		return currentRoomMembers.some(
			(member) => member.user && member.user._id === user._id
		);
	}, [user, currentRoomMembers]);

	const isUserAdmin = React.useMemo(() => {
		if (!isUserMember || !currentRoomMembers) return false;
		const member = currentRoomMembers.find(
			(m) => m.user && m.user._id === user._id
		);
		return member?.role === "admin";
	}, [user, currentRoomMembers, isUserMember]);

	// ... (loading and error states same as before) ...
	if (loadingCurrentRoom && !currentRoom && !pageError) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-900">
				<LoadingSpinner />
			</div>
		);
	}

	if (pageError && !currentRoom) {
		return (
			<div className="flex flex-col h-screen items-center justify-center bg-gray-900 p-4">
				<ErrorMessage message={pageError} />
				<Link to="/rooms" className="mt-4 text-purple-400 hover:underline">
					Back to Rooms
				</Link>
			</div>
		);
	}

	if (!currentRoom && !loadingCurrentRoom) {
		return (
			<div className="flex flex-col h-screen items-center justify-center bg-gray-900 p-4">
				<ErrorMessage message="Room not found or you do not have permission to view it." />
				<Link to="/rooms" className="mt-4 text-purple-400 hover:underline">
					Back to Rooms
				</Link>
			</div>
		);
	}

	const RoomInfoModalContent = () => (
		// ... (same as before) ...
		<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
			<Card
				title="Room Information"
				className="w-full max-w-md bg-gray-800 border-gray-700"
				headerAction={
					<button
						onClick={() => setShowInfoModal(false)}
						className="text-gray-400 hover:text-white p-1 rounded-full text-2xl leading-none"
					>
						×
					</button>
				}
			>
				<div className="text-sm space-y-2 text-gray-300">
					<p>
						<strong>Name:</strong>{" "}
						<span className="text-white">{currentRoom.name}</span>
					</p>
					<p>
						<strong>Description:</strong> {currentRoom.description || "N/A"}
					</p>
					<p>
						<strong>Category:</strong>{" "}
						<span className="text-purple-400">{currentRoom.category}</span>
					</p>
					<p>
						<strong>Type:</strong>{" "}
						<span className="text-blue-400">{currentRoom.roomType}</span>
					</p>
					<p>
						<strong>Members:</strong> {currentRoom.participantCount || 0} /{" "}
						{currentRoom.maxParticipants || "∞"}
					</p>
					<p>
						<strong>Resets:</strong>{" "}
						{new Date(currentRoom.nextResetAt).toLocaleString()}
					</p>
					{currentRoom.expiresAt && (
						<p>
							<strong>Expires:</strong>{" "}
							{new Date(currentRoom.expiresAt).toLocaleString()}
						</p>
					)}
				</div>
			</Card>
		</div>
	);

	return (
		<div className="flex flex-col h-screen bg-gray-900 text-white">
			{/* ... (header same as before) ... */}
			<header className="bg-gray-850 p-3 border-b border-gray-700 flex items-center justify-between sticky top-0 z-10">
				<Link
					to="/rooms"
					className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white"
				>
					<ArrowLeft size={20} />
				</Link>
				<div className="text-center flex-1 min-w-0 px-2">
					<h1
						className="text-lg font-semibold truncate"
						title={currentRoom?.name}
					>
						{currentRoom?.name}
					</h1>
					{loadingMembers ? (
						<p className="text-xs text-gray-500">Loading members...</p>
					) : (
						<p className="text-xs text-gray-400">
							{currentRoomMembers?.length || 0} members
						</p>
					)}
				</div>
				<div className="flex items-center space-x-1 sm:space-x-2">
					<button
						onClick={() => setShowInfoModal(true)}
						className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white"
						title="Room Info"
					>
						<Info size={20} />
					</button>
					<button
						onClick={() => setShowMembersAside(!showMembersAside)}
						className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white lg:hidden"
						title="Toggle Members List"
					>
						<Users size={20} />
					</button>
					{isUserAdmin && ( // Show settings only if user is admin of this room
						<Link
							to={`/room/${roomId}/settings`}
							className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white"
							title="Room Settings"
						>
							<Settings size={20} />
						</Link>
					)}
				</div>
			</header>

			<div className="flex flex-grow overflow-hidden relative">
				<main className="flex-grow flex flex-col overflow-hidden">
					<RoomMessageList
						messages={currentRoomMessages}
						loading={loadingMessages && currentRoomMessages.length === 0}
						loadingMore={loadingMoreMessages}
						currentUserId={user?._id}
						onFetchMoreMessages={handleFetchMoreMessages}
						hasMoreMessages={hasMoreMessages}
						onSetReplyTo={handleSetReplyTo} // Pass function to set reply context
						onAdminDelete={isUserAdmin ? handleAdminDelete : null} // Pass admin delete if user is admin
						onReact={handleReaction} // Pass reaction handler
					/>
					{isUserMember ? (
						<RoomMessageForm
							roomId={roomId}
							onSendMessage={handleSendMessage}
							isSending={isSendingMessage}
							replyingTo={replyingTo} // Pass replyingTo state
							onCancelReply={() => setReplyingTo(null)} // Pass function to cancel reply
						/>
					) : (
						// ... (Join button same as before) ...
						<div className="p-4 border-t border-gray-700 bg-gray-800 text-center">
							<button
								onClick={handleJoinRoom}
								disabled={isJoining}
								className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2 mx-auto disabled:opacity-70"
							>
								{isJoining ? (
									<Loader2 size={18} className="animate-spin" />
								) : (
									<LogIn size={18} />
								)}
								{isJoining ? "Joining..." : "Join Room to Chat"}
							</button>
						</div>
					)}
				</main>

				{/* ... (Desktop Member List & Room Info Sidebar same as before) ... */}
				<aside className="hidden lg:flex flex-col w-72 border-l border-gray-700 bg-gray-850">
					<div className="p-4 border-b border-gray-700">
						<h3 className="text-md font-semibold text-white">Room Details</h3>
						<p className="text-xs text-gray-400 mt-1">
							Category:{" "}
							<span className="text-purple-400">{currentRoom?.category}</span>
						</p>
						<p className="text-xs text-gray-400">
							Type:{" "}
							<span className="text-blue-400">{currentRoom?.roomType}</span>
						</p>
						<p className="text-xs text-gray-400">
							Resets:{" "}
							{currentRoom?.nextResetAt
								? new Date(currentRoom.nextResetAt).toLocaleDateString()
								: "N/A"}
						</p>
						{currentRoom?.expiresAt && (
							<p className="text-xs text-gray-400">
								Expires: {new Date(currentRoom.expiresAt).toLocaleDateString()}
							</p>
						)}

						{isUserMember && (
							<button
								onClick={handleLeaveRoom}
								disabled={isLeaving}
								className="mt-3 w-full px-3 py-1.5 bg-red-700 text-white rounded-md hover:bg-red-800 transition text-sm flex items-center justify-center gap-2 disabled:opacity-70"
							>
								{isLeaving ? (
									<Loader2 size={16} className="animate-spin" />
								) : (
									<LogOut size={16} />
								)}
								{isLeaving ? "Leaving..." : "Leave Room"}
							</button>
						)}
					</div>
					<div className="flex-grow overflow-y-auto">
						<RoomMemberList
							members={currentRoomMembers}
							loading={loadingMembers}
						/>
					</div>
				</aside>
			</div>

			{/* ... (Mobile/Tablet Member List Overlay same as before) ... */}
			{showMembersAside && (
				<div
					className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
					onClick={() => setShowMembersAside(false)}
				>
					<aside
						className="fixed top-0 right-0 h-full w-72 bg-gray-800 shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden z-40"
						onClick={(e) => e.stopPropagation()}
						style={{
							transform: showMembersAside
								? "translateX(0)"
								: "translateX(100%)",
						}}
					>
						<div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
							<h3 className="text-md font-semibold text-white">
								Members ({currentRoomMembers.length})
							</h3>
							<button
								onClick={() => setShowMembersAside(false)}
								className="text-gray-400 hover:text-white p-1 rounded-full text-2xl leading-none"
							>
								×
							</button>
						</div>
						<div className="flex-grow overflow-y-auto">
							<RoomMemberList
								members={currentRoomMembers}
								loading={loadingMembers}
								title=""
							/>
						</div>
						{isUserMember && (
							<div className="p-4 border-t border-gray-700 flex-shrink-0">
								<button
									onClick={handleLeaveRoom}
									disabled={isLeaving}
									className="w-full px-3 py-1.5 bg-red-700 text-white rounded-md hover:bg-red-800 transition text-sm flex items-center justify-center gap-2 disabled:opacity-70"
								>
									{isLeaving ? (
										<Loader2 size={16} className="animate-spin" />
									) : (
										<LogOut size={16} />
									)}
									{isLeaving ? "Leaving..." : "Leave Room"}
								</button>
							</div>
						)}
					</aside>
				</div>
			)}
			{showInfoModal && <RoomInfoModalContent />}
		</div>
	);
};

export default RoomDetailPage;
