import { PlusCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // For "Create Room" button
import RoomList from "../components/Rooms/RoomList";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { useRoom } from "../context/RoomContext";

const RoomsPage = () => {
	const {
		discoverRooms,
		officialRooms,
		userRooms,
		loadingDiscover,
		loadingOfficial,
		loadingUserRooms,
		fetchDiscoverRooms,
		fetchOfficialRooms,
		fetchUserRooms,
		hasMoreDiscover,
	} = useRoom();

	const [activeTab, setActiveTab] = useState("discover");

	useEffect(() => {
		if (activeTab === "discover" && discoverRooms.length === 0) {
			fetchDiscoverRooms();
		} else if (activeTab === "official" && officialRooms.length === 0) {
			fetchOfficialRooms();
		} else if (activeTab === "myRooms" && userRooms.length === 0) {
			fetchUserRooms();
		}
	}, [
		activeTab,
		fetchDiscoverRooms,
		fetchOfficialRooms,
		fetchUserRooms,
		discoverRooms.length,
		officialRooms.length,
		userRooms.length,
	]);

	const handleLoadMoreDiscover = () => {
		if (hasMoreDiscover && !loadingDiscover) {
			fetchDiscoverRooms(true); // Pass true for loadMore
		}
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "discover":
				return (
					<>
						<RoomList
							rooms={discoverRooms}
							loading={loadingDiscover && discoverRooms.length === 0}
							title="Discover Rooms"
							emptyMessage="No public rooms available to discover right now."
						/>
						{hasMoreDiscover && !loadingDiscover && (
							<div className="text-center mt-6">
								<button
									onClick={handleLoadMoreDiscover}
									className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
								>
									Load More
								</button>
							</div>
						)}
						{loadingDiscover && discoverRooms.length > 0 && (
							<div className="mt-6">
								<LoadingSpinner />
							</div>
						)}
					</>
				);
			case "official":
				return (
					<RoomList
						rooms={officialRooms}
						loading={loadingOfficial}
						title="Official Echo Rooms"
						emptyMessage="No official rooms are currently available."
					/>
				);
			case "myRooms":
				return (
					<RoomList
						rooms={userRooms}
						loading={loadingUserRooms}
						title="My Rooms"
						emptyMessage="You haven't joined or created any rooms yet."
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-white">Chat Rooms</h1>
				<Link
					to="/create-room" // Link to create room page (Phase 2)
					className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
				>
					<PlusCircle size={20} />
					Create Room
				</Link>
			</div>

			<div className="mb-6 border-b border-gray-700">
				<nav className="-mb-px flex space-x-8" aria-label="Tabs">
					<button
						onClick={() => setActiveTab("discover")}
						className={`${
							activeTab === "discover"
								? "border-purple-500 text-purple-400"
								: "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300"
						} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
					>
						Discover
					</button>
					<button
						onClick={() => setActiveTab("official")}
						className={`${
							activeTab === "official"
								? "border-purple-500 text-purple-400"
								: "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300"
						} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
					>
						Official
					</button>
					<button
						onClick={() => setActiveTab("myRooms")}
						className={`${
							activeTab === "myRooms"
								? "border-purple-500 text-purple-400"
								: "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300"
						} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
					>
						My Rooms
					</button>
				</nav>
			</div>

			{renderTabContent()}
		</div>
	);
};

export default RoomsPage;
