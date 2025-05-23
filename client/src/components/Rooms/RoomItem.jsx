// client/src/components/Rooms/RoomItem.jsx
import { Clock, Tag, Users } from "lucide-react"; // Removed Radio as it's not typically for an item
import React from "react";
import { Link } from "react-router-dom";
import Card from "../UI/Card";

const RoomItem = ({ room }) => {
	const timeUntilReset = () => {
		if (!room.nextResetAt) return "N/A";
		const diff = new Date(room.nextResetAt) - new Date();
		if (diff <= 0) return "Resets soon";
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
	};

	const expiresAtDisplay = () => {
		// Renamed to avoid conflict with variable name
		if (room.roomType === "official" || !room.expiresAt) return null;
		const diff = new Date(room.expiresAt) - new Date();
		if (diff <= 0) return "Expired";
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (days > 1) return `Expires in ${days} days`;
		const hours = Math.floor(diff / (1000 * 60 * 60));
		if (hours < 1) {
			const minutes = Math.floor(diff / (1000 * 60));
			return `Expires in <1h (${minutes}m)`;
		}
		return `Expires in ${hours}h`;
	};

	return (
		<Card className="hover:border-purple-700/50 transition-all duration-200 flex flex-col h-full">
			{" "}
			{/* Ensure Card can take full height */}
			<div className="flex flex-col justify-between flex-grow">
				{" "}
				{/* flex-grow for content */}
				<div>
					<Link to={`/room/${room._id}`} className="block group">
						<h3 className="text-lg font-semibold text-purple-400 group-hover:text-purple-300 mb-1 truncate transition-colors duration-150">
							{room.name}
						</h3>
					</Link>
					<p className="text-sm text-gray-400 mb-3 line-clamp-2 h-10">
						{" "}
						{/* Fixed height for description */}
						{room.description || "No description provided."}
					</p>
				</div>
				<div className="mt-auto pt-3 border-t border-gray-700/50">
					{" "}
					{/* Footer section for stats */}
					<div className="flex items-center text-xs text-gray-500 mb-2">
						<Tag className="h-3.5 w-3.5 mr-1.5 text-purple-500 flex-shrink-0" />
						<span className="truncate">{room.category}</span>
						<span className="mx-1.5">|</span>
						<Users className="h-3.5 w-3.5 mr-1.5 text-blue-500 flex-shrink-0" />
						<span>
							{room.participantCount || 0} / {room.maxParticipants || "∞"}
						</span>
					</div>
					<div className="flex items-center text-xs text-gray-500">
						<Clock className="h-3.5 w-3.5 mr-1.5 text-yellow-500 flex-shrink-0" />
						<span className="truncate">Resets in: {timeUntilReset()}</span>
						{expiresAtDisplay() && (
							<>
								<span className="mx-1.5">|</span>
								<span className="text-red-400 truncate">
									{expiresAtDisplay()}
								</span>
							</>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
};

export default RoomItem;
