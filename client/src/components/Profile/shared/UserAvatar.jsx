import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";

const getInitials = (name) => {
	if (!name) return "?";
	const parts = name.split(" ");
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const UserAvatar = ({ fullName, src = null }) => {
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
			<div>
				<img src={avatarImage} alt={`${fullName}'s avatar`} />
			</div>
		);
	}

	return <div>{getInitials(fullName)}</div>;
};

export default UserAvatar;
