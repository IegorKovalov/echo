import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useProfile } from "../../../contexts/ProfileContext";
import "../settings/usersettings.css";

const getInitials = (name) => {
	if (!name) return "?";
	const parts = name.split(" ");
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const UserAvatar = ({ fullName, src = null, size = "md" }) => {
	const { profileImage } = useProfile();
	const [avatarImage, setAvatarImage] = useState(null);
	const [imageLoaded, setImageLoaded] = useState(false);

	const imageSrc = src || profileImage || null;

	const sizeClasses = {
		xs: "w-6 h-6 text-xs",
		sm: "w-8 h-8 text-sm",
		md: "w-10 h-10 text-base",
		lg: "w-24 h-24 text-2xl",
		xl: "w-32 h-32 text-3xl",
		navbar: "w-full h-full text-base",
	};

	const avatarSize = sizeClasses[size] || sizeClasses.md;

	useEffect(() => {
		if (!imageSrc) {
			setImageLoaded(false);
			setAvatarImage(null);
			return;
		}

		setImageLoaded(false);

		const img = new Image();

		img.onload = () => {
			setAvatarImage(imageSrc);
			setImageLoaded(true);
		};

		img.onerror = () => {
			setImageLoaded(false);
			setAvatarImage(null);
		};

		img.src = imageSrc;

		return () => {
			img.onload = null;
			img.onerror = null;
		};
	}, [imageSrc]);

	if (avatarImage && imageLoaded) {
		return (
			<div className={`user-avatar-container ${avatarSize}`}>
				<img
					src={avatarImage}
					alt={`${fullName || "User"}'s avatar`}
					className="img-fluid rounded-circle"
					style={{
						width: "100%",
						height: "100%",
						objectFit: "cover",
						border: "2px solid rgba(255, 255, 255, 0.1)",
					}}
				/>
			</div>
		);
	}

	return (
		<div className={`user-avatar ${avatarSize}`}>{getInitials(fullName)}</div>
	);
};

UserAvatar.propTypes = {
	fullName: PropTypes.string,
	src: PropTypes.string,
	size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", "navbar"]),
};

export default UserAvatar;
