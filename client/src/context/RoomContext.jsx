import {
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
	const { showSuccess, showError } = useToast();

	// Room state
	const [rooms, setRooms] = useState([]);
	const [currentRoom, setCurrentRoom] = useState(null);
	const [loadingRooms, setLoadingRooms] = useState(false);
	
	// Message state
	const [messages, setMessages] = useState([]);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [hasMoreMessages, setHasMoreMessages] = useState(false);
	const [messagesPage, setMessagesPage] = useState(1);
	
	// Anonymous identity state
	const [anonymousIdentity, setAnonymousIdentity] = useState(null);

	// Room CRUD operations
	const fetchRooms = useCallback(async (filter = null) => {
		if (!user) return [];

		try {
			setLoadingRooms(true);
			const response = await RoomService.getRooms(filter);

			if (response.status === "success") {
				setRooms(response.data.rooms);
				return response.data.rooms;
			}
			return [];
		} catch (error) {
			console.error("Error fetching rooms:", error);
			showError("Failed to fetch rooms");
			return [];
		} finally {
			setLoadingRooms(false);
		}
	}, [user, showError]);

	const fetchRoom = useCallback(async (roomId) => {
		if (!user || !roomId) return null;

		try {
			const response = await RoomService.getRoom(roomId);

			if (response.status === "success") {
				setCurrentRoom(response.data.room);
				return response.data.room;
			}
			return null;
		} catch (error) {
			console.error("Error fetching room details:", error);
			if (error.response?.status === 410) {
				showError("This room has expired");
			} else {
				showError("Failed to fetch room details");
			}
			return null;
		}
	}, [user, showError]);

	const createRoom = useCallback(async (roomData) => {
		if (!user) return null;

		try {
			const response = await RoomService.createRoom(roomData);

			if (response.status === "success") {
				showSuccess("Room created successfully");
				return response.data.room;
			}
			return null;
		} catch (error) {
			console.error("Error creating room:", error);
			showError(error.response?.data?.message || "Failed to create room");
			return null;
		}
	}, [user, showSuccess, showError]);

	// Room membership operations
	const joinRoom = useCallback(async (roomId) => {
		if (!user || !roomId) return false;

		try {
			const response = await RoomService.joinRoom(roomId);

			if (response.status === "success") {
				showSuccess("Successfully joined the room");
				setCurrentRoom(response.data.room);

				if (response.data.identity) {
					const identityWithUser = {
						...response.data.identity,
						userId: user._id
					};
					
					setAnonymousIdentity(identityWithUser);
					localStorage.setItem(
						`room_identity_${roomId}`,
						JSON.stringify(identityWithUser)
					);
				}

				return true;
			}
			return false;
		} catch (error) {
			console.error("Error joining room:", error);
			showError(error.response?.data?.message || "Failed to join room");
			return false;
		}
	}, [user, showSuccess, showError]);

	const leaveRoom = useCallback(async (roomId) => {
		if (!user || !roomId) return false;

		try {
			const response = await RoomService.leaveRoom(roomId);

			if (response.status === "success") {
				showSuccess("Successfully left the room");
				localStorage.removeItem(`room_identity_${roomId}`);

				if (currentRoom?._id === roomId) {
					setCurrentRoom(null);
					setMessages([]);
					setAnonymousIdentity(null);
				}

				return true;
			}
			return false;
		} catch (error) {
			console.error("Error leaving room:", error);
			showError(error.response?.data?.message || "Failed to leave room");
			return false;
		}
	}, [user, currentRoom, showSuccess, showError]);

	// Message operations
	const sendMessage = useCallback(async (content) => {
		if (!user || !currentRoom || !anonymousIdentity) {
			showError("Unable to send message - please try rejoining the room");
			return null;
		}

		try {
			const messageData = {
				content,
				anonymousId: anonymousIdentity.anonymousId,
				anonymousName: anonymousIdentity.anonymousName,
			};
			
			const response = await RoomService.sendMessage(
				currentRoom._id,
				messageData
			);

			if (response.status === "success" && response.data.message) {
				setMessages((prevMessages) => [
					...prevMessages,
					response.data.message,
				]);
				return response.data.message;
			} 
			
			showError("Server returned an unexpected response");
			return null;
		} catch (error) {
			showError(error.response?.data?.message || "Failed to send message");
			return null;
		}
	}, [user, currentRoom, anonymousIdentity, showError]);

	const fetchMessages = useCallback(async (roomId, page = 1) => {
		if (!user || !roomId) return [];

		try {
			setLoadingMessages(true);
			const response = await RoomService.getMessages(roomId, page);

			if (response.status === "success") {
				const newMessages = response.data.messages;

				setMessages(prev => page === 1 ? newMessages : [...prev, ...newMessages]);
				setHasMoreMessages(response.data.hasMore);
				setMessagesPage(response.data.currentPage);

				return newMessages;
			}
			return [];
		} catch (error) {
			console.error("Error fetching messages:", error);
			showError("Failed to fetch messages");
			return [];
		} finally {
			setLoadingMessages(false);
		}
	}, [user, showError]);

	const loadMoreMessages = useCallback(() => {
		if (!currentRoom || !hasMoreMessages || loadingMessages) return;
		return fetchMessages(currentRoom._id, messagesPage + 1);
	}, [currentRoom, hasMoreMessages, loadingMessages, messagesPage, fetchMessages]);

	// Identity management
	const initializeRoomIdentity = useCallback((roomId) => {
		if (!roomId || !user) return null;

		const storedIdentity = localStorage.getItem(`room_identity_${roomId}`);
		if (!storedIdentity) return null;

		try {
			const parsedIdentity = JSON.parse(storedIdentity);
			
			if (!parsedIdentity.anonymousId || !parsedIdentity.anonymousName) {
				localStorage.removeItem(`room_identity_${roomId}`);
				return null;
			}
			
			if (parsedIdentity.userId && parsedIdentity.userId !== user._id) {
				localStorage.removeItem(`room_identity_${roomId}`);
				return null;
			}
			
			setAnonymousIdentity(parsedIdentity);
			return parsedIdentity;
		} catch (error) {
			console.error("Error parsing stored room identity:", error);
			localStorage.removeItem(`room_identity_${roomId}`);
			return null;
		}
	}, [user]);

	// Memoized context value
	const value = useMemo(() => ({
		// State
		rooms,
		currentRoom,
		messages,
		loadingRooms,
		loadingMessages,
		hasMoreMessages,
		anonymousIdentity,
		
		// Methods
		fetchRooms,
		fetchRoom,
		createRoom,
		joinRoom,
		leaveRoom,
		sendMessage,
		fetchMessages,
		loadMoreMessages,
		initializeRoomIdentity,
	}), [
		rooms,
		currentRoom,
		messages,
		loadingRooms,
		loadingMessages,
		hasMoreMessages,
		anonymousIdentity,
		fetchRooms,
		fetchRoom,
		createRoom,
		joinRoom,
		leaveRoom,
		sendMessage,
		fetchMessages,
		loadMoreMessages,
		initializeRoomIdentity,
	]);

	return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
