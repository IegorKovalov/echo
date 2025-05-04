import { useEffect, useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { getInitials } from "../../utils/avatarUtils";

const UserAvatar = ({
	fullName,
	src = null,
	variant = "default",
	style = {},
}) => {
	const { profileImage } = useProfile();
	const [avatarImage, setAvatarImage] = useState(null);
	const [imageLoaded, setImageLoaded] = useState(false);

	const imageSrc = src || profileImage || null;
	let size, fontSize, bgColorClass;

	switch (variant) {
		case "navbar":
			size = "32px";
			fontSize = "0.875rem";
			bgColorClass = "bg-primary";
			break;
		case "settings":
			size = "100px";
			fontSize = "2.5rem";
			bgColorClass = "bg-primary";
			break;
		case "comment":
			size = "28px";
			fontSize = "0.75rem";
			bgColorClass = "bg-secondary";
			break;
		default:
			size = "40px";
			fontSize = "1rem";
			bgColorClass = "bg-primary";
	}

	// Combine provided style with default styles
	const combinedStyle = {
		width: size,
		height: size,
		...style,
	};

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
			<div
				className="user-avatar-container rounded-circle overflow-hidden"
				style={combinedStyle}
			>
				<img
					src={avatarImage}
					alt={`${fullName || "User"}'s avatar`}
					className="img-fluid w-100 h-100"
					style={{
						objectFit: "cover",
					}}
				/>
			</div>
		);
	}

	// Generate initials avatar
	return (
		<div
			className={`user-avatar-initials rounded-circle d-flex align-items-center justify-content-center ${bgColorClass} bg-opacity-10`}
			style={combinedStyle}
		>
			<span
				className="text-primary fw-semibold"
				style={{
					fontSize: fontSize,
					lineHeight: 1,
				}}
			>
				{getInitials(fullName)}
			</span>
		</div>
	);
};

export default UserAvatar;
