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
	const { showError } = useToast();

	const [discoverRooms, setDiscoverRooms] = useState([]);
	const [officialRooms, setOfficialRooms] = useState([]);
	const [userRooms, setUserRooms] = useState([]);

	const [currentRoom, setCurrentRoom] = useState(null);
	const [currentRoomMembers, setCurrentRoomMembers] = useState([]);
	const [currentRoomMessages, setCurrentRoomMessages] = useState([]);

	const [loadingDiscover, setLoadingDiscover] = useState(false);
	const [loadingOfficial, setLoadingOfficial] = useState(false);
	const [loadingUserRooms, setLoadingUserRooms] = useState(false);
	const [loadingCurrentRoom, setLoadingCurrentRoom] = useState(false);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [loadingMessages, setLoadingMessages] = useState(false);

	// Pagination state (example for discover rooms)
	const [discoverPage, setDiscoverPage] = useState(1);
	const [hasMoreDiscover, setHasMoreDiscover] = useState(true);

	const fetchApiData = async (
		apiCall,
		setData,
		setLoading,
		page,
		setPage,
		setHasMore,
		isLoadMore = false
	) => {
		if (!user) return;
		setLoading(true);
		try {
			const response = await apiCall(page);
			if (response.status === "success" && response.data) {
				const newItems =
					response.data.rooms ||
					response.data.members ||
					response.data.messages ||
					[];
				if (isLoadMore) {
					setData((prev) => [...prev, ...newItems]);
				} else {
					setData(newItems);
				}
				if (response.data.pagination) {
					setPage(response.data.pagination.currentPage);
					setHasMore(response.data.pagination.hasMore);
				} else {
					// If no pagination, assume all data is fetched
					setHasMore(false);
				}
			} else {
				showError(response.message || "Failed to fetch data.");
				if (setHasMore) setHasMore(false);
			}
		} catch (err) {
			showError(err.message || "An error occurred while fetching data.");
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
				isLoadMore
			);
		},
		[user, showError, discoverPage]
	);

	const fetchOfficialRooms = useCallback(() => {
		// Simplified for now, add pagination later if needed
		fetchApiData(
			RoomService.getOfficialRooms,
			setOfficialRooms,
			setLoadingOfficial,
			1,
			() => {},
			() => {},
			false
		);
	}, [user, showError]);

	const fetchUserRooms = useCallback(() => {
		// Simplified for now, add pagination later if needed
		fetchApiData(
			RoomService.getUserRooms,
			setUserRooms,
			setLoadingUserRooms,
			1,
			() => {},
			() => {},
			false
		);
	}, [user, showError]);

	const fetchRoomDetails = useCallback(
		async (roomId) => {
			if (!user || !roomId) return;
			setLoadingCurrentRoom(true);
			setLoadingMembers(true);
			setLoadingMessages(true);
			setCurrentRoom(null);
			setCurrentRoomMembers([]);
			setCurrentRoomMessages([]);

			try {
				const [roomRes, membersRes, messagesRes] = await Promise.all([
					RoomService.getRoom(roomId),
					RoomService.getRoomMembers(roomId),
					RoomService.getRoomMessages(roomId),
				]);

				if (roomRes.status === "success" && roomRes.data.room) {
					setCurrentRoom(roomRes.data.room);
				} else {
					showError(roomRes.message || "Failed to fetch room details.");
				}
				setLoadingCurrentRoom(false);

				if (membersRes.status === "success" && membersRes.data.members) {
					setCurrentRoomMembers(membersRes.data.members);
				} else {
					showError(membersRes.message || "Failed to fetch room members.");
				}
				setLoadingMembers(false);

				if (messagesRes.status === "success" && messagesRes.data.messages) {
					setCurrentRoomMessages(messagesRes.data.messages.reverse()); // Reverse to show newest at bottom
				} else {
					showError(messagesRes.message || "Failed to fetch room messages.");
				}
				setLoadingMessages(false);
			} catch (err) {
				showError(err.message || "An error occurred fetching room details.");
				setLoadingCurrentRoom(false);
				setLoadingMembers(false);
				setLoadingMessages(false);
			}
		},
		[user, showError]
	);

	// --- Placeholder for Phase 2 ---
	const createRoom = useCallback(
		async (roomData) => {
			if (!user) return null;
			try {
				const response = await RoomService.createRoom(roomData);
				if (response.status === "success" && response.data.room) {
					// Add to user rooms or refetch
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
					// Optimistically update or refetch room details & user rooms
					fetchRoomDetails(roomId);
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
				const response = await RoomService.leaveRoom(roomId);
				// Backend returns 204 No Content on success
				// Check for response status if available, or assume success if no error
				if ((response && response.status === "success") || !response.message) {
					// Adjust based on actual backend 204 handling
					fetchRoomDetails(roomId); // Refetch details
					fetchUserRooms(); // Refetch user's rooms
					return true;
				} else {
					showError(response.message || "Failed to leave room.");
					return false;
				}
			} catch (err) {
				showError(err.message || "Error leaving room.");
				return false;
			}
		},
		[user, showError, fetchRoomDetails, fetchUserRooms]
	);

	// --- Placeholder for Phase 3 ---
	const sendMessage = useCallback(
		async (roomId, messageData) => {
			if (!user) return null;
			try {
				const response = await RoomService.createMessage(roomId, messageData);
				if (response.status === "success" && response.data.message) {
					setCurrentRoomMessages((prev) => [...prev, response.data.message]);
					return response.data.message;
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
			fetchDiscoverRooms,
			fetchOfficialRooms,
			fetchUserRooms,
			fetchRoomDetails,
			discoverPage,
			hasMoreDiscover, // For pagination
			createRoom,
			joinRoom,
			leaveRoom, // Phase 2
			sendMessage, // Phase 3
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
			fetchDiscoverRooms,
			fetchOfficialRooms,
			fetchUserRooms,
			fetchRoomDetails,
			discoverPage,
			hasMoreDiscover,
			createRoom,
			joinRoom,
			leaveRoom,
			sendMessage,
		]
	);

	return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
