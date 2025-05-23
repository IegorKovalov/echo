import RoomCard from "./RoomCard";

export default function RoomsList({ rooms, onRoomClick, viewMode = "grid" }) {
	if (viewMode === "list") {
		return (
			<div className="space-y-4">
				{rooms.map((room) => (
					<RoomCard
						key={room._id}
						room={room}
						onClick={() => onRoomClick(room)}
						variant="list"
					/>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-4 gap-6">
			{rooms.map((room) => (
				<RoomCard
					key={room._id}
					room={room}
					onClick={() => onRoomClick(room)}
					variant="card"
				/>
			))}
		</div>
	);
}
