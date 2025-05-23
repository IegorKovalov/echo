import {
	Calendar,
	Clock,
	Crown,
	MessageCircle,
	Star,
	Timer,
	UserCheck,
	Users,
} from "lucide-react";
import Card from "../UI/Card";

const categoryColors = {
	Support: "bg-green-600/20 text-green-400 border-green-600/30",
	Professional: "bg-blue-600/20 text-blue-400 border-blue-600/30",
	Creative: "bg-purple-600/20 text-purple-400 border-purple-600/30",
	Relationships: "bg-pink-600/20 text-pink-400 border-pink-600/30",
	Technology: "bg-cyan-600/20 text-cyan-400 border-cyan-600/30",
	Discussion: "bg-orange-600/20 text-orange-400 border-orange-600/30",
};

export default function RoomCard({ room, onClick, variant = "card" }) {
	const timeUntilReset = () => {
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
		if (!room.expiresAt) return null;

		const now = new Date();
		const expiryTime = new Date(room.expiresAt);
		const diff = expiryTime - now;

		if (diff <= 0) return "Expired";

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		return `${days} days left`;
	};

	const isNearCapacity =
		room.maxParticipants && room.participantCount / room.maxParticipants > 0.8;

	const isFull =
		room.maxParticipants && room.participantCount >= room.maxParticipants;

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
								<span>Resets in {timeUntilReset()}</span>
							</div>

							{room.expiresAt && (
								<div className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									<span>{timeUntilExpiry()}</span>
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

				{/* Footer info */}
				<div className="pt-2 border-t border-gray-800/50 space-y-1">
					<div className="flex items-center gap-1 text-xs text-gray-400">
						<Timer className="h-3 w-3" />
						<span>Resets in {timeUntilReset()}</span>
					</div>

					{room.expiresAt && (
						<div className="flex items-center gap-1 text-xs text-gray-400">
							<Calendar className="h-3 w-3" />
							<span>{timeUntilExpiry()}</span>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}
