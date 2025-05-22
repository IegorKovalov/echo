import React from "react";
import EmptyState from "../UI/EmptyState";
import LoadingSpinner from "../UI/LoadingSpinner";
import RoomItem from "./RoomItem";

const RoomList = ({
	rooms,
	loading,
	title,
	emptyMessage = "No rooms found.",
}) => {
	if (loading && (!rooms || rooms.length === 0)) {
		return (
			<div className="py-10">
				<LoadingSpinner />
			</div>
		);
	}

	if (!loading && (!rooms || rooms.length === 0)) {
		return (
			<div className="py-10">
				<EmptyState message={emptyMessage} />
			</div>
		);
	}

	return (
		<div>
			{title && (
				<h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
			)}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{rooms.map((room) => (
					<RoomItem key={room._id} room={room} />
				))}
			</div>
		</div>
	);
};

export default RoomList;
