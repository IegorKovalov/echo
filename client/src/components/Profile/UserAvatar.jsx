import React from "react";
import User from "../../../../server/models/userModel";
import {
	getInitials,
	getInitialsBackgroundColor,
} from "../../utils/avatarUtils";
import "./UserAvatar.css";

const UserAvatar = ({ fullName, className = "" }) => {
	return (
		<div
			className={`initials-avatar ${className}`}
			style={{
				backgroundColor: getInitialsBackgroundColor(fullName),
			}}
		>
			{getInitials(fullName)}
		</div>
	);
};

export default UserAvatar;
