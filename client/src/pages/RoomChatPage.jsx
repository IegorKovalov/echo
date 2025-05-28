import { Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatInput from "../components/chat/ChatInput";
import ChatMessage from "../components/chat/ChatMessage";
import RoomHeader from "../components/chat/RoomHeader";
import { getRoomById, mockMessages } from "../data/roomsData";
import { generateAnonymousId } from "../utils/anonymousUtils";

export default function RoomChatPage() {
	const { roomId } = useParams();
	const navigate = useNavigate();
	const [room, setRoom] = useState(null);
	const [messages, setMessages] = useState(mockMessages);
	const messagesEndRef = useRef(null);
	const [currentUserAnonymousId] = useState(() => generateAnonymousId());

	useEffect(() => {
		// Load room data
		const roomData = getRoomById(roomId);
		if (!roomData) {
			navigate("/rooms");
			return;
		}
		setRoom(roomData);
	}, [roomId, navigate]);

	useEffect(() => {
		// Auto-scroll to bottom when new messages arrive
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = async (content) => {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		const message = {
			_id: `msg_${Date.now()}`,
			content,
			timestamp: new Date(),
			anonymousId: currentUserAnonymousId,
			isOwn: true,
		};

		setMessages((prev) => [...prev, message]);
	};

	if (!room) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-950">
			{/* Header */}
			<RoomHeader room={room} />

			{/* Privacy Notice */}
			<div className="bg-blue-600/10 border-b border-blue-600/20">
				<div className="container max-w-6xl mx-auto px-4 py-3">
					<div className="flex items-center gap-2 text-sm text-blue-400">
						<Shield className="h-4 w-4 flex-shrink-0" />
						<span>
							Your identity is anonymous. Messages will be deleted when this room resets.
						</span>
					</div>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-hidden">
				<div className="h-full overflow-y-auto">
					<div className="container max-w-4xl mx-auto px-4 py-6">
						<div className="space-y-4">
							{messages.map((message) => (
								<ChatMessage key={message._id} message={message} />
							))}
							<div ref={messagesEndRef} />
						</div>
					</div>
				</div>
			</div>

			{/* Message Input */}
			<ChatInput onSendMessage={handleSendMessage} />
		</div>
	);
} 