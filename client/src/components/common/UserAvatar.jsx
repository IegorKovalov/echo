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

	return (
		<div className={`user-avatar ${avatarVariant}`}>
			{getInitials(fullName)}
		</div>
	);
};

export default UserAvatar;
