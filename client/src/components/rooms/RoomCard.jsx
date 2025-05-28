import {
	Calendar,
	Clock,
	Crown,
	MessageCircle,
	Star,
	Timer,
	UserCheck,
	Users,
	ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../UI/Card";
import { categoryColors } from "../../data/roomsData";
import { useTimeFormatting } from "../../hooks/useTimeFormatting";
import { isRoomFull, isRoomNearCapacity } from "../../utils/anonymousUtils";

export default function RoomCard({ room, onClick, variant = "card" }) {
	const navigate = useNavigate();
	const { timeUntilReset, timeUntilExpiry } = useTimeFormatting();

	const handleJoinChat = (e) => {
		e.stopPropagation(); // Prevent card click event
		navigate(`/rooms/${room._id}`);
	};

	const isFull = isRoomFull(room);
	const isNearCapacity = isRoomNearCapacity(room);

	if (variant === "list") {
		return (
			<Card
				className="p-4 hover:bg-gray-800/30 transition-all duration-200 cursor-pointer border-l-4 border-l-purple-500"
				onClick={onClick}
			>
				<div className="flex items-center justify-between">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 mb-2">
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-semibold text-white truncate">
									{room.name}
								</h3>
								{room.roomType === "official" && (
									<Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
								)}
							</div>

							<span
								className={`px-2 py-1 rounded-full text-xs font-medium border ${
									categoryColors[room.category] || categoryColors.Discussion
								}`}
							>
								{room.category}
							</span>
						</div>

						<p className="text-gray-300 text-sm mb-3 line-clamp-2">
							{room.description}
						</p>

						<div className="flex items-center gap-4 text-xs text-gray-400">
							<div className="flex items-center gap-1">
								<Users className="h-3 w-3" />
								<span>{room.participantCount}</span>
								{room.maxParticipants && (
									<span className="text-gray-500">
										/ {room.maxParticipants}
									</span>
								)}
							</div>

							<div className="flex items-center gap-1">
								<Timer className="h-3 w-3" />
								<span>Resets in {timeUntilReset(room.nextResetAt)}</span>
							</div>

							{room.expiresAt && (
								<div className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									<span>{timeUntilExpiry(room.expiresAt)}</span>
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col items-end gap-2 ml-4">
						{isFull && (
							<span className="px-2 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-medium">
								Full
							</span>
						)}
						{isNearCapacity && !isFull && (
							<span className="px-2 py-1 rounded-full bg-yellow-600/20 text-yellow-400 text-xs font-medium">
								Almost Full
							</span>
						)}
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card
			className="p-4 hover:bg-gray-800/30 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-purple-900/10"
			onClick={onClick}
		>
			<div className="space-y-3">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2 min-w-0 flex-1">
						<h3 className="font-semibold text-white truncate">{room.name}</h3>
						{room.roomType === "official" && (
							<Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
						)}
					</div>

					{isFull ? (
						<span className="px-2 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-medium flex-shrink-0">
							Full
						</span>
					) : isNearCapacity ? (
						<span className="px-2 py-1 rounded-full bg-yellow-600/20 text-yellow-400 text-xs font-medium flex-shrink-0">
							Almost Full
						</span>
					) : null}
				</div>

				{/* Category Badge */}
				<div className="flex items-center gap-2">
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium border ${
							categoryColors[room.category] || categoryColors.Discussion
						}`}
					>
						{room.category}
					</span>

					{room.roomType === "user-created" && (
						<span className="px-2 py-1 rounded-full bg-gray-700/50 text-gray-300 text-xs font-medium border border-gray-600/50">
							<Crown className="h-3 w-3 inline mr-1" />
							Community
						</span>
					)}
				</div>

				{/* Description */}
				<p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
					{room.description}
				</p>

				{/* Stats */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-1 text-gray-400">
							<Users className="h-4 w-4" />
							<span>{room.participantCount}</span>
							{room.maxParticipants && (
								<span className="text-gray-500">/ {room.maxParticipants}</span>
							)}
						</div>

						<div className="flex items-center gap-1 text-gray-400">
							<MessageCircle className="h-4 w-4" />
							<span>{Math.floor(Math.random() * 50) + 10}</span>{" "}
							{/* Mock message count */}
						</div>
					</div>

					{/* Progress bar for capacity if applicable */}
					{room.maxParticipants && (
						<div className="w-full bg-gray-700 rounded-full h-1.5">
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

				{/* Join Chat Button */}
				<div className="pt-2 border-t border-gray-800/50">
					<button
						onClick={handleJoinChat}
						disabled={isFull}
						className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
							isFull
								? "bg-gray-800 text-gray-500 cursor-not-allowed"
								: "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md hover:shadow-purple-900/20"
						}`}
					>
						{isFull ? (
							"Room Full"
						) : (
							<>
								Join Chat
								<ArrowRight className="h-4 w-4" />
							</>
						)}
					</button>
				</div>

				{/* Footer info */}
				<div className="pt-2 border-t border-gray-800/50 space-y-1">
					<div className="flex items-center gap-1 text-xs text-gray-400">
						<Timer className="h-3 w-3" />
						<span>Resets in {timeUntilReset(room.nextResetAt)}</span>
					</div>

					{room.expiresAt && (
						<div className="flex items-center gap-1 text-xs text-gray-400">
							<Calendar className="h-3 w-3" />
							<span>{timeUntilExpiry(room.expiresAt)}</span>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}
