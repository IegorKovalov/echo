import { useEffect, useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { getInitials } from "../../utils/avatarUtils";

const UserAvatar = ({ fullName, src = null, variant = "default" }) => {
	const { profileImage } = useProfile();
	const [avatarImage, setAvatarImage] = useState(null);
	const [imageLoaded, setImageLoaded] = useState(false);

	const imageSrc = src || profileImage || null;

	const avatarVariant =
		variant === "navbar"
			? "avatar-navbar"
			: variant === "settings"
			? "avatar-settings"
			: "avatar-default";

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
			<div className={`user-avatar-container ${avatarVariant}`}>
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

	let fontSize;
	if (variant === "navbar") {
		fontSize = "0.875rem";
	} else if (variant === "settings") {
		fontSize = "2.5rem";
	} else {
		fontSize = "1.25rem";
	}

	return (
		<div className={`user-avatar ${avatarVariant}`}>
			<span
				style={{
					fontSize: fontSize,
					lineHeight: 1,
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
				}}
			>
				{getInitials(fullName)}
			</span>
		</div>
	);
};

export default UserAvatar;
