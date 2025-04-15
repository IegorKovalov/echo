import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import "../settings/usersettings.css";

const getInitials = (name) => {
	if (!name) return "?";
	const parts = name.split(" ");
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const UserAvatar = ({ fullName, src = null, size = "md" }) => {
	const { currentUser } = useAuth();
	const [avatarImage, setAvatarImage] = useState(null);
	const [imageLoaded, setImageLoaded] = useState(false);

	const imageSrc = src || currentUser?.profilePicture || null;

	useEffect(() => {
		if (!imageSrc) {
			setImageLoaded(false);
			setAvatarImage(null);
			return;
		}

		setImageLoaded(false);
		const img = new Image();
		img.src = imageSrc;
		img.onload = () => {
			setAvatarImage(imageSrc);
			setImageLoaded(true);
		};
		img.onerror = () => {
			setImageLoaded(false);
			setAvatarImage(null);
		};
	}, [imageSrc]);

	if (avatarImage && imageLoaded) {
		return (
			<div className="user-avatar-container">
				<img
					src={avatarImage}
					alt={`${fullName}'s avatar`}
					className="img-fluid rounded-circle"
				/>
			</div>
		);
	}

	return <div className="user-avatar">{getInitials(fullName)}</div>;
};

export default UserAvatar;
