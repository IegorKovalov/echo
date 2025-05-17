import { Clock, Filter, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRoom } from "../../context/RoomContext";
import Card from "../UI/Card";

export default function RoomList() {
	const { rooms, loadingRooms, fetchRooms } = useRoom();
	const [filter, setFilter] = useState(null);
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);

	useEffect(() => {
		fetchRooms(filter);
	}, [fetchRooms, filter]);

	const formatResetTime = (expiresAt) => {
		const now = new Date();
		const expiry = new Date(expiresAt);
		const diffMs = Math.max(0, expiry - now);
		
		const hours = Math.floor(diffMs / (1000 * 60 * 60));
		const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		
		if (hours < 1) {
			return `${minutes}m`;
		} else if (hours < 24) {
			return `${hours}h ${minutes}m`;
		} else {
			const days = Math.floor(hours / 24);
			const remainingHours = hours % 24;
			return `${days}d ${remainingHours}h`;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold text-white">Anonymous Rooms</h2>
					<p className="text-gray-400 text-sm mt-1">Join anonymously, share openly, reset regularly</p>
				</div>
				<div className="flex gap-2">
					<div className="relative">
						<button 
							onClick={() => setShowFilterDropdown(!showFilterDropdown)}
							className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
						>
							<Filter className="h-4 w-4" />
							Filter
						</button>
						{showFilterDropdown && (
							<div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden border border-gray-700">
								<div className="py-1">
									<button
										onClick={() => {
											setFilter("official");
											setShowFilterDropdown(false);
										}}
										className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
									>
										Official Rooms
									</button>
									<button
										onClick={() => {
											setFilter(null);
											setShowFilterDropdown(false);
										}}
										className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
									>
										All Rooms
									</button>
								</div>
							</div>
						)}
					</div>
					<Link
						to="/rooms/create"
						className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors shadow-md shadow-purple-900/20"
					>
						<Plus className="h-4 w-4" />
						Create Room
					</Link>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 mb-4">
				<button
					onClick={() => setFilter(null)}
					className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
						filter === null
							? "bg-purple-600 text-white shadow-md shadow-purple-900/20"
							: "bg-gray-800 text-gray-300 hover:bg-gray-700"
					}`}
				>
					All Rooms
				</button>
				<button
					onClick={() => setFilter("joined")}
					className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
						filter === "joined"
							? "bg-purple-600 text-white shadow-md shadow-purple-900/20"
							: "bg-gray-800 text-gray-300 hover:bg-gray-700"
					}`}
				>
					My Rooms
				</button>
				{filter === "official" && (
					<button
						onClick={() => setFilter(null)}
						className="rounded-full bg-purple-600 px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-purple-900/20 flex items-center gap-1"
					>
						Official Rooms
						<span className="ml-1 text-xs">×</span>
					</button>
				)}
			</div>

			{loadingRooms ? (
				<div className="flex justify-center py-12">
					<div className="animate-pulse text-purple-500">Loading rooms...</div>
				</div>
			) : rooms.length > 0 ? (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{rooms.map((room) => (
						<Link
							key={room._id}
							to={`/rooms/${room._id}`}
							className="block"
						>
							<Card className="h-full border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors p-5">
								<div className="flex flex-col h-full">
									<h3 className="text-xl font-bold text-white mb-2">
										{room.name}
									</h3>
									
									<p className="text-sm text-gray-300 mb-4 flex-grow">
										{room.description || "A safe space to discuss topics anonymously"}
									</p>

									<div className="mt-auto space-y-3">
										<div className="flex items-center text-sm text-gray-400">
											<Users className="h-4 w-4 mr-2" />
											<span>{room.participants?.length || 0} active members</span>
										</div>
										
										<div className="flex items-center text-sm text-gray-400">
											<Clock className="h-4 w-4 mr-2" />
											<span>Resets in {formatResetTime(room.expiresAt)}</span>
										</div>
										
										{room.isOfficial && (
											<div className="text-sm text-purple-400 font-medium">
												Official Echo Room
											</div>
										)}
										
										<button className="w-full py-2.5 text-center rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors">
											Join Room
										</button>
									</div>
								</div>
							</Card>
						</Link>
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<p className="text-gray-400 mb-4">No rooms available at the moment</p>
					<Link
						to="/rooms/create"
						className="inline-block rounded-lg bg-purple-600 px-5 py-2.5 text-white hover:bg-purple-700 transition-colors shadow-md shadow-purple-900/20"
					>
						Create a Room
					</Link>
				</div>
			)}
		</div>
	);
}
