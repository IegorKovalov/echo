import { useRef } from "react";
import { FaCamera } from "react-icons/fa";
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
		<div>
			<div onClick={handleProfilePictureClick}>
				{picture ? (
					<img src={picture} alt="Profile" />
				) : (
					<UserAvatar fullName={fullName || "User"} />
				)}
				<div onClick={handleProfilePictureClick}>
					<FaCamera />
				</div>
			</div>
			<p>Click on the image to update your profile picture</p>
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
