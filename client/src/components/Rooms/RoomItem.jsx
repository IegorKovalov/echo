import { Clock, Radio, Tag, Users } from "lucide-react";
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

	const expiresAt = () => {
		if (room.roomType === "official" || !room.expiresAt) return null;
		const diff = new Date(room.expiresAt) - new Date();
		if (diff <= 0) return "Expired";
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (days > 1) return `Expires in ${days} days`;
		const hours = Math.floor(diff / (1000 * 60 * 60));
		return `Expires in ${hours}h`;
	};

	return (
		<Card className="hover:border-purple-700/50 transition-all duration-200">
			<div className="flex flex-col justify-between h-full">
				<div>
					<Link to={`/room/${room._id}`}>
						<h3 className="text-lg font-semibold text-purple-400 hover:text-purple-300 mb-1 truncate">
							{room.name}
						</h3>
					</Link>
					<p className="text-sm text-gray-400 mb-3 line-clamp-2 h-10">
						{room.description || "No description provided."}
					</p>
				</div>
				<div className="mt-auto">
					<div className="flex items-center text-xs text-gray-500 mb-2">
						<Tag className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
						<span>{room.category}</span>
						<span className="mx-2">|</span>
						<Users className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
						<span>
							{room.participantCount || 0} / {room.maxParticipants || "∞"}
						</span>
					</div>
					<div className="flex items-center text-xs text-gray-500">
						<Clock className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
						<span>Resets in: {timeUntilReset()}</span>
						{expiresAt() && (
							<>
								<span className="mx-2">|</span>
								<span className="text-red-500">{expiresAt()}</span>
							</>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
};

export default RoomItem;
