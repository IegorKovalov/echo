import { Clock, Filter, Plus, Search, Star, Users } from "lucide-react";
import { useState } from "react";
import CreateRoomModal from "../components/rooms/CreateRoomModal";
import RoomDetailModal from "../components/rooms/RoomDetailModal";
import RoomsList from "../components/rooms/RoomsList";
import Card from "../components/UI/Card";
import { mockRooms, categories, filterRoomsByCategory } from "../data/roomsData";

export default function RoomsPage() {
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState(null);

	// Filter rooms based on current category selection
	const filteredRooms = filterRoomsByCategory(mockRooms, selectedCategory);

	return (
		<div className="flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 min-h-screen">
			<main className="flex-1">
				<div className="container px-4 py-6 max-w-7xl mx-auto">
					{/* Header Section */}
					<div className="mb-8">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
							<div>
								<h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
									<Users className="h-8 w-8 text-purple-400" />
									Anonymous Rooms
								</h1>
								<p className="text-gray-400">
									Join anonymous conversations that reset regularly. Share
									freely, connect authentically.
								</p>
							</div>

							<button
								onClick={() => setIsCreateModalOpen(true)}
								className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md shadow-purple-900/20"
							>
								<Plus className="h-5 w-5" />
								Create Room
							</button>
						</div>

						{/* Category Filters */}
						<Card className="p-4">
							<div className="flex flex-wrap gap-2">
								{categories.map((category) => (
									<button
										key={category}
										onClick={() => setSelectedCategory(category)}
										className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
											selectedCategory === category
												? "bg-purple-600 text-white shadow-md shadow-purple-900/20"
												: "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
										}`}
									>
										{category}
									</button>
								))}
							</div>
						</Card>
					</div>

					{/* Stats Section */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="rounded-full bg-purple-600/20 p-3">
									<Users className="h-6 w-6 text-purple-400" />
								</div>
								<div>
									<p className="text-sm text-gray-400">Total Rooms</p>
									<p className="text-2xl font-bold text-white">
										{mockRooms.length}
									</p>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="rounded-full bg-blue-600/20 p-3">
									<Star className="h-6 w-6 text-blue-400" />
								</div>
								<div>
									<p className="text-sm text-gray-400">Official Rooms</p>
									<p className="text-2xl font-bold text-white">
										{
											mockRooms.filter((room) => room.roomType === "official")
												.length
										}
									</p>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="rounded-full bg-green-600/20 p-3">
									<Clock className="h-6 w-6 text-green-400" />
								</div>
								<div>
									<p className="text-sm text-gray-400">Active Participants</p>
									<p className="text-2xl font-bold text-white">
										{mockRooms.reduce(
											(sum, room) => sum + room.participantCount,
											0
										)}
									</p>
								</div>
							</div>
						</Card>
					</div>

					{/* Results Info */}
					<div className="mb-6">
						<p className="text-gray-400">
							{filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""}{" "}
							found
							{selectedCategory !== "All" && ` in ${selectedCategory}`}
						</p>
					</div>

					{/* Rooms List */}
					<RoomsList
						rooms={filteredRooms}
						onRoomClick={setSelectedRoom}
					/>

					{/* Empty State */}
					{filteredRooms.length === 0 && (
						<Card className="p-12 text-center">
							<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-800 p-4">
								<Search className="h-8 w-8 text-gray-600" />
							</div>
							<h3 className="text-lg font-medium text-white mb-2">
								No rooms found
							</h3>
							<p className="text-gray-400 mb-4">
								Try selecting a different category, or create a new room.
							</p>
							<button
								onClick={() => setIsCreateModalOpen(true)}
								className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
							>
								<Plus className="h-4 w-4" />
								Create Room
							</button>
						</Card>
					)}
				</div>
			</main>

			{/* Modals */}
			<CreateRoomModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>

			<RoomDetailModal
				room={selectedRoom}
				isOpen={!!selectedRoom}
				onClose={() => setSelectedRoom(null)}
			/>
		</div>
	);
}
