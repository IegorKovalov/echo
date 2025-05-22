import React from "react";
import EmptyState from "../UI/EmptyState";
import LoadingSpinner from "../UI/LoadingSpinner";
import RoomMemberItem from "./RoomMemberItem";

const RoomMemberList = ({ members, loading, title = "Members" }) => {
	if (loading) {
		return (
			<div className="p-4">
				<LoadingSpinner />
			</div>
		);
	}

	if (!members || members.length === 0) {
		return (
			<div className="p-4">
				<EmptyState message="No members in this room yet." />
			</div>
		);
	}

	return (
		<div className="bg-gray-800 p-4 rounded-lg shadow-md h-full overflow-y-auto">
			<h3 className="text-md font-semibold text-white mb-3 border-b border-gray-700 pb-2">
				{title} ({members.length})
			</h3>
			<div className="space-y-1">
				{members.map((member) => (
					<RoomMemberItem
						key={member._id || member.anonymousId}
						member={member}
					/>
				))}
			</div>
		</div>
	);
};

export default RoomMemberList;
