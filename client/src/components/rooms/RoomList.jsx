import { Clock, Lock, MessageSquare, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRoom } from "../../context/RoomContext";
import Card from "../UI/Card";

export default function RoomList() {
	const { rooms, loadingRooms, fetchRooms } = useRoom();
	const [filter, setFilter] = useState(null);

	useEffect(() => {
		fetchRooms(filter);
	}, [fetchRooms, filter]);

	const getTimeLeft = (expiresAt) => {
		const now = new Date();
		const expiry = new Date(expiresAt);
		const diffMs = expiry - now;
		const diffHrs = Math.round(diffMs / (1000 * 60 * 60));

		if (diffHrs < 1) {
			const diffMins = Math.round(diffMs / (1000 * 60));
			return `${diffMins}m left`;
		}
		return `${diffHrs}h left`;
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold text-white">Anonymous Rooms</h2>
				<Link
					to="/rooms/create"
					className="flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
				>
					<Plus className="h-4 w-4" />
					New Room
				</Link>
			</div>

			<div className="flex flex-wrap gap-2 mb-4">
				<button
					onClick={() => setFilter(null)}
					className={`rounded-full px-3 py-1 text-sm ${
						filter === null
							? "bg-purple-600 text-white"
							: "bg-gray-800 text-gray-300 hover:bg-gray-700"
					}`}
				>
					All Rooms
				</button>
				<button
					onClick={() => setFilter("joined")}
					className={`rounded-full px-3 py-1 text-sm ${
						filter === "joined"
							? "bg-purple-600 text-white"
							: "bg-gray-800 text-gray-300 hover:bg-gray-700"
					}`}
				>
					My Rooms
				</button>
				<button
					onClick={() => setFilter("created")}
					className={`rounded-full px-3 py-1 text-sm ${
						filter === "created"
							? "bg-purple-600 text-white"
							: "bg-gray-800 text-gray-300 hover:bg-gray-700"
					}`}
				>
					Created by Me
				</button>
			</div>

			{loadingRooms ? (
				<div className="text-center py-10">
					<Sparkles className="mx-auto h-8 w-8 animate-pulse text-purple-500" />
					<p className="mt-2 text-gray-400">Loading rooms...</p>
				</div>
			) : rooms.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{rooms.map((room) => (
						<Link
							key={room._id}
							to={`/rooms/${room._id}`}
							className="transition-transform hover:scale-[1.02]"
						>
							<Card className="h-full">
								<div className="flex flex-col h-full">
									<div className="flex items-start justify-between mb-2">
										<h3 className="text-lg font-medium text-white">
											{room.name}
											{room.isPrivate && (
												<Lock className="inline-block ml-2 h-4 w-4 text-yellow-500" />
											)}
										</h3>
										<div className="rounded-full bg-purple-900/30 px-2 py-1 text-xs text-purple-400 flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{getTimeLeft(room.expiresAt)}
										</div>
									</div>

									<p className="text-sm text-gray-300 mb-4 flex-grow">
										{room.description || "No description provided"}
									</p>

									<div className="flex items-center justify-between mt-auto">
										<div className="flex items-center text-xs text-gray-400">
											<MessageSquare className="h-3 w-3 mr-1" />
											{room.participants?.length || 0} participants
										</div>

										<div className="text-xs text-gray-400">
											Created by {room.creator?.username || "Anonymous"}
										</div>
									</div>
								</div>
							</Card>
						</Link>
					))}
				</div>
			) : (
				<Card>
					<div className="text-center py-10">
						<div className="mx-auto h-16 w-16 rounded-full bg-gray-800 p-4">
							<MessageSquare className="h-8 w-8 text-gray-600" />
						</div>
						<h3 className="mt-4 text-lg font-medium text-white">
							No rooms found
						</h3>
						<p className="mt-2 text-gray-400">
							{filter
								? "No rooms found matching your filter. Try a different filter or create a new room."
								: "No rooms available. Be the first to create a room!"}
						</p>
						<Link
							to="/rooms/create"
							className="mt-4 inline-block rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
						>
							Create a Room
						</Link>
					</div>
				</Card>
			)}
		</div>
	);
}
