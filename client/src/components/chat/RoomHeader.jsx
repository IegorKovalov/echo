import { ArrowLeft, Star, Timer, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categoryColors } from "../../data/roomsData";
import { useTimeFormatting } from "../../hooks/useTimeFormatting";

export default function RoomHeader({ room }) {
	const navigate = useNavigate();
	const { timeUntilReset } = useTimeFormatting();

	return (
		<div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
			<div className="container max-w-6xl mx-auto px-4 py-4">
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigate("/rooms")}
						className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>

					<div className="flex items-center gap-3 flex-1 min-w-0">
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2 mb-1">
								<h1 className="text-lg font-semibold text-white truncate">
									{room.name}
								</h1>
								{room.roomType === "official" && (
									<Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
								)}
							</div>
							<div className="flex items-center gap-3 text-sm text-gray-400">
								<span className="flex items-center gap-1">
									<Users className="h-4 w-4" />
									{room.participantCount} participants
								</span>
								<span className="flex items-center gap-1">
									<Timer className="h-4 w-4" />
									Resets in {timeUntilReset(room.nextResetAt)}
								</span>
							</div>
						</div>
					</div>

					<span
						className={`px-3 py-1 rounded-full text-sm font-medium border flex-shrink-0 ${
							categoryColors[room.category] || categoryColors.Discussion
						}`}
					>
						{room.category}
					</span>
				</div>
			</div>
		</div>
	);
} 