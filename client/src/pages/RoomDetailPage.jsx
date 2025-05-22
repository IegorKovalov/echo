import { ArrowLeft, Info, LogIn, LogOut, Settings, Users } from "lucide-react"; // Added icons
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RoomHeader from "../components/Rooms/RoomHeader";
import RoomMemberList from "../components/Rooms/RoomMemberList";
import RoomMessageList from "../components/Rooms/RoomMessageList";
import Card from "../components/UI/Card"; // For room info display
import ErrorMessage from "../components/UI/ErrorMessage";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import RoomMessageForm from "../components/UI/RoomMessageForm"; // Phase 3
import { useAuth } from "../context/AuthContext";
import { useRoom } from "../context/RoomContext";

const RoomDetailPage = () => {
	const { roomId } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const {
		currentRoom,
		currentRoomMembers,
		currentRoomMessages,
		loadingCurrentRoom,
		loadingMembers,
		loadingMessages,
		fetchRoomDetails,
		joinRoom,
		leaveRoom,
		sendMessage, // Phase 2 & 3
	} = useRoom();

	const [error, setError] = useState(null);
	const [isSendingMessage, setIsSendingMessage] = useState(false); // Phase 3
	const [showMembersAside, setShowMembersAside] = useState(false); // State for mobile member list
	const [showInfoModal, setShowInfoModal] = useState(false); // State for room info modal

	useEffect(() => {
		if (roomId) {
			fetchRoomDetails(roomId).catch((err) => {
				setError(err.message || "Failed to load room details.");
				if (err.response && err.response.status === 404) {
					// Handle 404 from backend if room doesn't exist
					navigate("/404", { replace: true });
				}
			});
		}
		// Reset aside/modal on room change
		setShowMembersAside(false);
		setShowInfoModal(false);
	}, [roomId, fetchRoomDetails, navigate]);

	const handleJoinRoom = async () => {
		const success = await joinRoom(roomId);
		if (success) {
			// Optionally show a success toast
		}
	};

	const handleLeaveRoom = async () => {
		const success = await leaveRoom(roomId);
		if (success) {
			// Optionally show a success toast, or navigate away
			navigate("/rooms");
		}
	};

	const handleSendMessage = async (roomId, messageData) => {
		// Phase 3
		setIsSendingMessage(true);
		try {
			await sendMessage(roomId, messageData);
		} catch (err) {
			// error handled in context
		} finally {
			setIsSendingMessage(false);
		}
	};

	const isUserMember = currentRoomMembers.some(
		(member) => member.user === user?._id || member.user?._id === user?._id
	);

	if (loadingCurrentRoom && !currentRoom) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-900">
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-900 p-4">
				<ErrorMessage message={error} />
			</div>
		);
	}

	if (!currentRoom && !loadingCurrentRoom) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-900 p-4">
				<ErrorMessage message="Room not found or could not be loaded." />
				<Link to="/rooms" className="mt-4 text-purple-400 hover:underline">
					Back to Rooms
				</Link>
			</div>
		);
	}

	const RoomInfoModal = () => (
		<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
			<Card
				title="Room Information"
				className="w-full max-w-md bg-gray-800"
				headerAction={
					<button
						onClick={() => setShowInfoModal(false)}
						className="text-gray-400 hover:text-white p-1 rounded-full"
					>
						×
					</button>
				}
			>
				<p>
					<strong>Name:</strong> {currentRoom.name}
				</p>
				<p>
					<strong>Description:</strong> {currentRoom.description || "N/A"}
				</p>
				<p>
					<strong>Category:</strong> {currentRoom.category}
				</p>
				<p>
					<strong>Type:</strong> {currentRoom.roomType}
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
			</Card>
		</div>
	);

	return (
		<div className="flex flex-col h-screen bg-gray-900 text-white">
			<header className="bg-gray-850 p-3 border-b border-gray-700 flex items-center justify-between sticky top-0 z-10">
				<Link
					to="/rooms"
					className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white"
				>
					<ArrowLeft size={20} />
				</Link>
				<div className="text-center">
					<h1 className="text-lg font-semibold truncate">
						{currentRoom?.name}
					</h1>
					<p className="text-xs text-gray-400">
						{currentRoom?.participantCount || 0} members
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<button
						onClick={() => setShowInfoModal(true)}
						className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white md:hidden" // Show on mobile, hide on md+
						title="Room Info"
					>
						<Info size={20} />
					</button>
					<button
						onClick={() => setShowMembersAside(!showMembersAside)}
						className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white lg:hidden" // Show on mobile/tablet, hide on lg+
						title="Toggle Members List"
					>
						<Users size={20} />
					</button>
					{isUserMember &&
						currentRoom?.createdBy === user?._id && ( // Placeholder for Room Settings
							<Link
								to={`/room/${roomId}/settings`}
								className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white"
							>
								<Settings size={20} />
							</Link>
						)}
				</div>
			</header>

			<div className="flex flex-grow overflow-hidden">
				{/* Main Chat Area */}
				<main className="flex-grow flex flex-col">
					<RoomMessageList
						messages={currentRoomMessages}
						loading={loadingMessages}
						currentUserId={user?._id}
						// onFetchMoreMessages={...} // Add pagination later
						// hasMoreMessages={...}
					/>
					{isUserMember ? (
						<RoomMessageForm
							roomId={roomId}
							onSendMessage={handleSendMessage}
							isSending={isSendingMessage}
						/>
					) : (
						<div className="p-4 border-t border-gray-700 bg-gray-800 text-center">
							<button
								onClick={handleJoinRoom}
								className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2 mx-auto"
							>
								<LogIn size={18} /> Join Room to Chat
							</button>
						</div>
					)}
				</main>

				{/* Desktop Member List & Room Info Sidebar */}
				<aside className="hidden lg:flex flex-col w-72 border-l border-gray-700 bg-gray-850 p-0">
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
							Resets: {new Date(currentRoom?.nextResetAt).toLocaleDateString()}
						</p>
						{currentRoom?.expiresAt && (
							<p className="text-xs text-gray-400">
								Expires: {new Date(currentRoom?.expiresAt).toLocaleDateString()}
							</p>
						)}
						{isUserMember && (
							<button
								onClick={handleLeaveRoom}
								className="mt-3 w-full px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm flex items-center justify-center gap-2"
							>
								<LogOut size={16} /> Leave Room
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

			{/* Mobile/Tablet Member List Overlay/Drawer */}
			{showMembersAside && (
				<div
					className="fixed inset-0 z-30 bg-black/50 lg:hidden"
					onClick={() => setShowMembersAside(false)}
				>
					<aside
						className="fixed top-0 right-0 h-full w-72 bg-gray-800 shadow-xl p-0 transform transition-transform duration-300 ease-in-out lg:hidden z-40 overflow-y-auto"
						onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
						style={{
							transform: showMembersAside
								? "translateX(0)"
								: "translateX(100%)",
						}}
					>
						<div className="p-4 border-b border-gray-700 flex justify-between items-center">
							<h3 className="text-md font-semibold text-white">
								Members ({currentRoomMembers.length})
							</h3>
							<button
								onClick={() => setShowMembersAside(false)}
								className="text-gray-400 hover:text-white p-1 rounded-full"
							>
								×
							</button>
						</div>
						<RoomMemberList
							members={currentRoomMembers}
							loading={loadingMembers}
							title=""
						/>
						{isUserMember && (
							<div className="p-4 border-t border-gray-700">
								<button
									onClick={handleLeaveRoom}
									className="w-full px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm flex items-center justify-center gap-2"
								>
									<LogOut size={16} /> Leave Room
								</button>
							</div>
						)}
					</aside>
				</div>
			)}
			{showInfoModal && <RoomInfoModal />}
		</div>
	);
};

export default RoomDetailPage;
