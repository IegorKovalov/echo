import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
	getInitials,
	getInitialsBackgroundColor,
} from "../../utils/avatarUtils";
import "./UserAvatar.css";

const UserAvatar = ({ fullName, className = "" }) => {
	const { currentUser } = useAuth();
	const [avatarImage, setAvatarImage] = useState(null);
	const [imageLoaded, setImageLoaded] = useState(false);
	const userProfilePicture = currentUser.profilePicture
		? currentUser.profilePicture
		: avatarImage;
	useEffect(() => {
		setImageLoaded(false);
		const img = new Image();
		img.src = userProfilePicture;
		img.onload = () => {
			setAvatarImage(userProfilePicture);
			setImageLoaded(true);
		};
		img.onerror = () => {
			setImageLoaded(false);
			setAvatarImage(null);
		};
	}, [[userProfilePicture]]);
	if (avatarImage && imageLoaded) {
		return (
			<div className={`profile-avatar ${className}`}>
				<img
					src={avatarImage}
					alt={`${fullName}'s avatar`}
					className="avatar-image"
				/>
			</div>
		);
	}
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
