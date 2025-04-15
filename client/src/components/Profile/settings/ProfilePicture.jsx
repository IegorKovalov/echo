import { useRef } from "react";
import { FaCamera } from "react-icons/fa";
import UserAvatar from "../shared/UserAvatar"; // Updated import path

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
		<div className="profile-picture-container">
			<div className="profile-picture-wrapper">
				{picture ? (
					<img src={picture} alt="Profile" className="profile-picture" />
				) : (
					<UserAvatar fullName={fullName || "User"} className="large" />
				)}
				<div
					className="profile-picture-overlay"
					onClick={handleProfilePictureClick}
				>
					<FaCamera className="profile-picture-icon" />
				</div>
			</div>
			<p className="profile-picture-instruction">
				Click on the image to update your profile picture
			</p>
			<input
				type="file"
				accept="image/*"
				id="profilePictureInput"
				ref={fileInputRef}
				className="d-none"
				onChange={handleFileChange}
			/>
		</div>
	);
};

export default ProfilePicture;
