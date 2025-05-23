// client/src/context/RoomContext.jsx
import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import RoomService from "../services/room.service";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const RoomContext = createContext();

export const useRoom = () => {
	const context = useContext(RoomContext);
	if (!context) {
		throw new Error("useRoom must be used within a RoomProvider");
	}
	return context;
};

export const RoomProvider = ({ children }) => {
	const { user } = useAuth();
	const { showSuccess, showError } = useToast(); // Changed from showToastError

	// ... (existing states for discover, official, user rooms) ...
	const [discoverRooms, setDiscoverRooms] = useState([]);
	const [officialRooms, setOfficialRooms] = useState([]);
	const [userRooms, setUserRooms] = useState([]);

	const [currentRoom, setCurrentRoom] = useState(null);
	const [currentRoomMembers, setCurrentRoomMembers] = useState([]);
	const [currentRoomMessages, setCurrentRoomMessages] = useState([]);

	// ... (existing loading states) ...
	const [loadingDiscover, setLoadingDiscover] = useState(false);
	const [loadingOfficial, setLoadingOfficial] = useState(false);
	const [loadingUserRooms, setLoadingUserRooms] = useState(false);
	const [loadingCurrentRoom, setLoadingCurrentRoom] = useState(false);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [loadingMessages, setLoadingMessages] = useState(false);

	const [discoverPage, setDiscoverPage] = useState(1);
	const [hasMoreDiscover, setHasMoreDiscover] = useState(true);

	// Pagination for messages
	const [messagesPage, setMessagesPage] = useState(1);
	const [hasMoreMessages, setHasMoreMessages] = useState(true);
	const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

	const fetchApiData = async (
		apiCall,
		setData,
		setLoading,
		page,
		setPage,
		setHasMore,
		isLoadMore = false,
		itemKey = "rooms"
	) => {
		if (!user && !["discoverRooms", "officialRooms"].includes(itemKey)) return; // Allow unauth for discover/official
		setLoading(true);
		try {
			const response = await apiCall(page);
			if (response.status === "success" && response.data) {
				const newItems = response.data[itemKey] || [];
				if (isLoadMore) {
					setData((prev) => {
						// Prepend for messages (older messages), append for room lists
						return itemKey === "messages"
							? [...newItems, ...prev]
							: [...prev, ...newItems];
					});
				} else {
					setData(itemKey === "messages" ? newItems.reverse() : newItems); // Reverse messages for initial load
				}

				if (response.data.pagination) {
					if (setPage) setPage(response.data.pagination.currentPage);
					if (setHasMore) setHasMore(response.data.pagination.hasMore);
				} else {
					if (setHasMore) setHasMore(false);
				}
			} else {
				showError(response.message || `Failed to fetch ${itemKey}.`);
				if (setHasMore) setHasMore(false);
			}
		} catch (err) {
			showError(err.message || `An error occurred while fetching ${itemKey}.`);
			if (setHasMore) setHasMore(false);
		} finally {
			setLoading(false);
		}
	};

	const fetchDiscoverRooms = useCallback(
		(isLoadMore = false) => {
			const pageToFetch = isLoadMore ? discoverPage + 1 : 1;
			fetchApiData(
				(p) => RoomService.discoverRooms(p),
				setDiscoverRooms,
				setLoadingDiscover,
				pageToFetch,
				setDiscoverPage,
				setHasMoreDiscover,
				isLoadMore,
				"rooms"
			);
		},
		[user, showError, discoverPage]
	);

	const fetchOfficialRooms = useCallback(() => {
		fetchApiData(
			RoomService.getOfficialRooms,
			setOfficialRooms,
			setLoadingOfficial,
			1,
			null,
			null,
			false,
			"rooms"
		);
	}, [user, showError]);

	const fetchUserRooms = useCallback(() => {
		fetchApiData(
			RoomService.getUserRooms,
			setUserRooms,
			setLoadingUserRooms,
			1,
			null,
			null,
			false,
			"rooms"
		);
	}, [user, showError]);

	const fetchRoomMessages = useCallback(
		async (roomId, page = 1, isLoadMore = false) => {
			if (!user || !roomId) return;
			if (isLoadMore) setLoadingMoreMessages(true);
			else setLoadingMessages(true);

			try {
				const response = await RoomService.getRoomMessages(roomId, page);
				if (response.status === "success" && response.data) {
					const newMessages = response.data.messages || [];
					if (isLoadMore) {
						setCurrentRoomMessages((prev) => [
							...newMessages.reverse(),
							...prev,
						]); // Prepend older messages
					} else {
						setCurrentRoomMessages(newMessages.reverse()); // Initial load, newest at bottom
					}
					setMessagesPage(response.data.pagination.currentPage);
					setHasMoreMessages(response.data.pagination.hasMore);
				} else {
					showError(response.message || "Failed to fetch room messages.");
					setHasMoreMessages(false);
				}
			} catch (err) {
				showError(err.message || "An error occurred fetching room messages.");
				setHasMoreMessages(false);
			} finally {
				if (isLoadMore) setLoadingMoreMessages(false);
				else setLoadingMessages(false);
			}
		},
		[user, showError]
	);

	const fetchRoomDetails = useCallback(
		async (roomId) => {
			if (!user || !roomId) return;
			setLoadingCurrentRoom(true);
			setLoadingMembers(true);
			// setLoadingMessages(true); // fetchRoomMessages handles its own loading state
			setCurrentRoom(null);
			setCurrentRoomMembers([]);
			setCurrentRoomMessages([]);
			setMessagesPage(1); // Reset message page for new room
			setHasMoreMessages(true);

			try {
				const [roomRes, membersRes] = await Promise.all([
					RoomService.getRoom(roomId),
					RoomService.getRoomMembers(roomId),
				]);

				if (roomRes.status === "success" && roomRes.data.room) {
					setCurrentRoom(roomRes.data.room);
					// Fetch initial messages for this room
					await fetchRoomMessages(roomId, 1);
				} else {
					showError(roomRes.message || "Failed to fetch room details.");
					setCurrentRoom(null); // Ensure room is null on error
				}
				setLoadingCurrentRoom(false);

				if (membersRes.status === "success" && membersRes.data.members) {
					setCurrentRoomMembers(membersRes.data.members);
				} else {
					showError(membersRes.message || "Failed to fetch room members.");
				}
				setLoadingMembers(false);
			} catch (err) {
				showError(err.message || "An error occurred fetching room details.");
				setCurrentRoom(null); // Ensure room is null on error
				setLoadingCurrentRoom(false);
				setLoadingMembers(false);
				setLoadingMessages(false); // Also reset this one
				throw err; // Re-throw for page level handling
			}
		},
		[user, showError, fetchRoomMessages]
	); // Added fetchRoomMessages

	const createRoom = useCallback(
		async (roomData) => {
			if (!user) return null;
			try {
				const response = await RoomService.createRoom(roomData);
				if (response.status === "success" && response.data.room) {
					fetchUserRooms();
					return response.data.room;
				} else {
					showError(response.message || "Failed to create room.");
					return null;
				}
			} catch (err) {
				showError(err.message || "Error creating room.");
				throw err;
			}
		},
		[user, showError, fetchUserRooms]
	);

	const joinRoom = useCallback(
		async (roomId) => {
			if (!user) return false;
			try {
				const response = await RoomService.joinRoom(roomId);
				if (response.status === "success") {
					await fetchRoomDetails(roomId);
					fetchUserRooms();
					return true;
				} else {
					showError(response.message || "Failed to join room.");
					return false;
				}
			} catch (err) {
				showError(err.message || "Error joining room.");
				return false;
			}
		},
		[user, showError, fetchRoomDetails, fetchUserRooms]
	);

	const leaveRoom = useCallback(
		async (roomId) => {
			if (!user) return false;
			try {
				await RoomService.leaveRoom(roomId); // Backend returns 204, so direct response.data check might fail
				// Assume success if no error is thrown by RoomService
				await fetchRoomDetails(roomId);
				fetchUserRooms();
				return true;
			} catch (err) {
				showError(err.message || "Error leaving room.");
				return false;
			}
		},
		[user, showError, fetchRoomDetails, fetchUserRooms]
	);

	const sendMessage = useCallback(
		async (roomId, messageData) => {
			if (!user) return null;
			try {
				const response = await RoomService.createMessage(roomId, messageData);
				if (response.status === "success" && response.data.message) {
					// Optimistically add the message, assuming it contains populated roomMember.user
					const newMessage = response.data.message;
					setCurrentRoomMessages((prev) => [...prev, newMessage]);
					// Scroll to bottom can be handled in RoomMessageList or RoomDetailPage
					return newMessage;
				} else {
					showError(response.message || "Failed to send message.");
					return null;
				}
			} catch (err) {
				showError(err.message || "Error sending message.");
				throw err;
			}
		},
		[user, showError]
	);

	const replyToMessage = useCallback(
		async (roomId, messageId, replyData) => {
			if (!user) return null;
			try {
				const response = await RoomService.replyToMessage(
					roomId,
					messageId,
					replyData
				);
				if (response.status === "success" && response.data.message) {
					setCurrentRoomMessages((prev) => [...prev, response.data.message]);
					return response.data.message;
				} else {
					showError(response.message || "Failed to send reply.");
					return null;
				}
			} catch (err) {
				showError(err.message || "Error sending reply.");
				throw err;
			}
		},
		[user, showError]
	);

	// Basic placeholders for reaction and admin delete, will require UI implementation
	const reactToMessage = useCallback(
		async (roomId, messageId, emoji) => {
			// ... call RoomService.reactToMessage ...
			// ... update currentRoomMessages state ...
			console.log("React to message:", roomId, messageId, emoji);
			showError("Reaction feature not fully implemented yet.");
		},
		[user, showError]
	);

	const adminDeleteMessage = useCallback(
		async (roomId, messageId) => {
			// ... call RoomService.adminDeleteMessage ...
			// ... update currentRoomMessages state (mark as deleted or filter out) ...
			console.log("Admin delete message:", roomId, messageId);
			try {
				await RoomService.adminDeleteMessage(roomId, messageId);
				setCurrentRoomMessages((prevMessages) =>
					prevMessages.map((msg) =>
						msg._id === messageId
							? {
									...msg,
									isAdminDeleted: true,
									content: "[This message has been removed by an admin]",
							  }
							: msg
					)
				);
				showSuccess("Message deleted by admin.");
			} catch (err) {
				showError(err.message || "Failed to delete message.");
			}
		},
		[user, showError, showSuccess]
	);

	const value = useMemo(
		() => ({
			discoverRooms,
			officialRooms,
			userRooms,
			currentRoom,
			currentRoomMembers,
			currentRoomMessages,
			loadingDiscover,
			loadingOfficial,
			loadingUserRooms,
			loadingCurrentRoom,
			loadingMembers,
			loadingMessages,
			loadingMoreMessages,
			fetchDiscoverRooms,
			fetchOfficialRooms,
			fetchUserRooms,
			fetchRoomDetails,
			fetchRoomMessages, // Expose fetchRoomMessages for polling/refresh
			discoverPage,
			hasMoreDiscover,
			messagesPage,
			hasMoreMessages, // For message pagination
			createRoom,
			joinRoom,
			leaveRoom,
			sendMessage,
			replyToMessage,
			reactToMessage,
			adminDeleteMessage,
		}),
		[
			discoverRooms,
			officialRooms,
			userRooms,
			currentRoom,
			currentRoomMembers,
			currentRoomMessages,
			loadingDiscover,
			loadingOfficial,
			loadingUserRooms,
			loadingCurrentRoom,
			loadingMembers,
			loadingMessages,
			loadingMoreMessages,
			fetchDiscoverRooms,
			fetchOfficialRooms,
			fetchUserRooms,
			fetchRoomDetails,
			fetchRoomMessages,
			discoverPage,
			hasMoreDiscover,
			messagesPage,
			hasMoreMessages,
			createRoom,
			joinRoom,
			leaveRoom,
			sendMessage,
			replyToMessage,
			reactToMessage,
			adminDeleteMessage,
		]
	);

	return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
