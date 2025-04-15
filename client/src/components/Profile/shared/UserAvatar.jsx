import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import "./UserAvatar.css";

const getInitials = (name) => {
	if (!name) return "?";
	const parts = name.split(" ");
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getInitialsBackgroundColor = (name) => {
	if (!name) return "#757575";
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	const h = Math.abs(hash % 360);
	const s = 65 + (hash % 25);
	const l = 45 + (hash % 10);

	return `hsl(${h}, ${s}%, ${l}%)`;
};

const UserAvatar = ({ fullName, className = "", src = null }) => {
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
