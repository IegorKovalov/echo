import { Clock, Info, Users } from "lucide-react";
import React from "react";

const RoomHeader = ({ room, onToggleMembers, onToggleInfo }) => {
	if (!room) return null;

	const timeUntilReset = () => {
		if (!room.nextResetAt) return "N/A";
		const diff = new Date(room.nextResetAt) - new Date();
		if (diff <= 0) return "Resets soon";
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m left`;
	};

	return (
		<div className="bg-gray-800 p-4 rounded-t-lg shadow-md">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-xl font-semibold text-white">{room.name}</h2>
					<p className="text-sm text-gray-400">
						{room.description || "Welcome to the room!"}
					</p>
				</div>
				<div className="flex items-center space-x-3">
					<button
						onClick={onToggleMembers}
						className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white transition"
						title="View Members"
					>
						<Users size={20} />
					</button>
					<button
						onClick={onToggleInfo}
						className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white transition"
						title="Room Info"
					>
						<Info size={20} />
					</button>
				</div>
			</div>
			<div className="mt-2 text-xs text-gray-500 flex items-center">
				<Clock size={14} className="mr-1" />
				<span>Room resets in: {timeUntilReset()}</span>
				<span className="mx-2">|</span>
				<span>Category: {room.category}</span>
				{room.roomType === "user-created" && room.expiresAt && (
					<>
						<span className="mx-2">|</span>
						<span>
							Expires: {new Date(room.expiresAt).toLocaleDateString()}
						</span>
					</>
				)}
			</div>
		</div>
	);
};

export default RoomHeader;
