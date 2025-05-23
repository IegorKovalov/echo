import {
	Calendar,
	Clock,
	MessageCircle,
	Star,
	Timer,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const categoryColors = {
	Support: "bg-green-600/20 text-green-400 border-green-600/30",
	Professional: "bg-blue-600/20 text-blue-400 border-blue-600/30",
	Creative: "bg-purple-600/20 text-purple-400 border-purple-600/30",
	Relationships: "bg-pink-600/20 text-pink-400 border-pink-600/30",
	Technology: "bg-cyan-600/20 text-cyan-400 border-cyan-600/30",
	Discussion: "bg-orange-600/20 text-orange-400 border-orange-600/30",
};

export default function RoomDetailModal({ room, isOpen, onClose }) {
	const [isJoining, setIsJoining] = useState(false);
	const modalRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onClose();
			}
		};

		const handleEscape = (event) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	const handleJoinRoom = async () => {
		setIsJoining(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			console.log("Joining room:", room._id);

			// In real implementation, this would:
			// 1. Call the join room API
			// 2. Navigate to the room chat interface
			// 3. Close this modal

			onClose();
		} catch (error) {
			console.error("Error joining room:", error);
		} finally {
			setIsJoining(false);
		}
	};

	const timeUntilReset = () => {
		if (!room) return "";

		const now = new Date();
		const resetTime = new Date(room.nextResetAt);
		const diff = resetTime - now;

		if (diff <= 0) return "Resetting now";

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);

		if (days > 0) {
			return `${days}d ${hours % 24}h`;
		}
		return `${hours}h`;
	};

	const timeUntilExpiry = () => {
		if (!room || !room.expiresAt) return null;

		const now = new Date();
		const expiryTime = new Date(room.expiresAt);
		const diff = expiryTime - now;

		if (diff <= 0) return "Expired";

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		return `${days} days left`;
	};

	const formatTime = (date) => {
		const now = new Date();
		const diff = now - date;
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		if (minutes > 0) return `${minutes}m ago`;
		return "Just now";
	};

	const isFull =
		room &&
		room.maxParticipants &&
		room.participantCount >= room.maxParticipants;
	const isNearCapacity =
		room &&
		room.maxParticipants &&
		room.participantCount / room.maxParticipants > 0.8;

	if (!isOpen || !room) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
			<div
				ref={modalRef}
				className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-800">
					<div className="flex items-center gap-4 min-w-0 flex-1">
						<div className="flex items-center gap-3 min-w-0">
							<h2 className="text-xl font-semibold text-white truncate">
								{room.name}
							</h2>
							{room.roomType === "official" && (
								<Star className="h-5 w-5 text-yellow-400 flex-shrink-0" />
							)}
						</div>

						<span
							className={`px-3 py-1 rounded-full text-sm font-medium border flex-shrink-0 ${
								categoryColors[room.category] || categoryColors.Discussion
							}`}
						>
							{room.category}
						</span>
					</div>

					<div className="flex items-center gap-2">
						{isFull ? (
							<span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-sm font-medium">
								Room Full
							</span>
						) : (
							<button
								onClick={handleJoinRoom}
								disabled={isJoining}
								className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70 transition-all duration-200 shadow-md shadow-purple-900/20"
							>
								{isJoining ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
										Joining...
									</>
								) : (
									<>
										<UserPlus className="h-4 w-4" />
										Join Room
									</>
								)}
							</button>
						)}

						<button
							onClick={onClose}
							className="p-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="space-y-6">
						{/* Description */}
						<div>
							<h3 className="text-lg font-semibold text-white mb-3">
								About This Room
							</h3>
							<p className="text-gray-300 leading-relaxed">
								{room.description}
							</p>
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
								<div className="flex items-center gap-2 mb-2">
									<Users className="h-4 w-4 text-blue-400" />
									<span className="text-sm text-gray-400">Participants</span>
								</div>
								<p className="text-xl font-semibold text-white">
									{room.participantCount}
									{room.maxParticipants && (
										<span className="text-sm text-gray-400 font-normal">
											/ {room.maxParticipants}
										</span>
									)}
								</p>
								{room.maxParticipants && (
									<div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
										<div
											className={`h-1.5 rounded-full transition-all duration-300 ${
												isFull
													? "bg-red-500"
													: isNearCapacity
													? "bg-yellow-500"
													: "bg-green-500"
											}`}
											style={{
												width: `${Math.min(
													100,
													(room.participantCount / room.maxParticipants) * 100
												)}%`,
											}}
										/>
									</div>
								)}
							</div>

							<div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
								<div className="flex items-center gap-2 mb-2">
									<MessageCircle className="h-4 w-4 text-green-400" />
									<span className="text-sm text-gray-400">Messages</span>
								</div>
								<p className="text-xl font-semibold text-white">
									{Math.floor(Math.random() * 500) + 100}
								</p>
								<p className="text-xs text-gray-500 mt-1">This reset cycle</p>
							</div>

							<div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
								<div className="flex items-center gap-2 mb-2">
									<Timer className="h-4 w-4 text-purple-400" />
									<span className="text-sm text-gray-400">Next Reset</span>
								</div>
								<p className="text-xl font-semibold text-white">
									{timeUntilReset()}
								</p>
								<p className="text-xs text-gray-500 mt-1">
									Every {room.resetInterval}h
								</p>
							</div>

							<div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
								<div className="flex items-center gap-2 mb-2">
									<Calendar className="h-4 w-4 text-orange-400" />
									<span className="text-sm text-gray-400">Created</span>
								</div>
								<p className="text-xl font-semibold text-white">
									{formatTime(new Date(room.createdAt))}
								</p>
								{room.expiresAt && (
									<p className="text-xs text-gray-500 mt-1">
										{timeUntilExpiry()}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
