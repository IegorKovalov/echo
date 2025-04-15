import { useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import UserService from "../../../services/user.service";
import "../settings/usersettings.css";
import UserAvatar from "../shared/UserAvatar";

const ProfilePicture = ({ picture, fullName, onPictureUpdate }) => {
	const fileInputRef = useRef(null);
	const [uploading, setUploading] = useState(false);

	const handleProfilePictureClick = () => {
		fileInputRef.current.click();
	};

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;
		if (!file.type.match("image.*")) {
			toast.error("Please select an image file");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size should not exceed 5MB");
			return;
		}
		setUploading(true);
		try {
			const reader = new FileReader();
			reader.onload = (event) => {
				onPictureUpdate(event.target.result);
			};
			reader.readAsDataURL(file);
			const formData = new FormData();
			formData.append("profilePicture", file);
			const response = await UserService.updateProfilePicture(formData);
			onPictureUpdate(response.data.data.user.profilePicture);
			toast.success("Profile picture updated successfully!");
		} catch (error) {
			toast.error("Failed to upload profile picture");
			console.error("Upload error:", error);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="text-center mb-4">
			<div
				className="profile-picture-container"
				onClick={handleProfilePictureClick}
				style={{ cursor: uploading ? "wait" : "pointer" }}
			>
				{picture ? (
					<img src={picture} alt="Profile" className="shadow" />
				) : (
					<UserAvatar fullName={fullName || "User"} />
				)}
				<div className="camera-icon-overlay">
					{uploading ? (
						<span
							className="spinner-border spinner-border-sm"
							role="status"
							aria-hidden="true"
						></span>
					) : (
						<FaCamera />
					)}
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
				disabled={uploading}
			/>
		</div>
	);
};

export default ProfilePicture;
