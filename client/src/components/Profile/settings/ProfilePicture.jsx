import { useRef } from "react";
import { FaCamera } from "react-icons/fa";
import "../settings/usersettings.css";
import UserAvatar from "../shared/UserAvatar";

const ProfilePicture = ({ picture, fullName, onPictureUpdate }) => {
	const fileInputRef = useRef(null);

	const handleProfilePictureClick = () => {
		fileInputRef.current.click();
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				onPictureUpdate(event.target.result);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="text-center mb-4">
			<div
				className="profile-picture-container"
				onClick={handleProfilePictureClick}
			>
				{picture ? (
					<img src={picture} alt="Profile" className="shadow" />
				) : (
					<UserAvatar fullName={fullName || "User"} />
				)}
				<div className="camera-icon-overlay">
					<FaCamera />
				</div>
			</div>
			<p className="text-muted small">
				Click on the image to update your profile picture
			</p>
			<input
				type="file"
				accept="image/*"
				id="profilePictureInput"
				ref={fileInputRef}
				style={{ display: "none" }}
				onChange={handleFileChange}
			/>
		</div>
	);
};

export default ProfilePicture;
