import { useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import { useProfile } from "../../../contexts/ProfileContext";
import UserService from "../../../services/user.service";
import UserAvatar from "../shared/UserAvatar";

const ProfilePicture = ({ picture, fullName, onPictureUpdate }) => {
	const fileInputRef = useRef(null);
	const [uploading, setUploading] = useState(false);
	const [previewImage, setPreviewImage] = useState(picture || null);
	const { updateProfileImage } = useProfile();

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

		if (file.size > 12 * 1024 * 1024) {
			toast.error("File size should not exceed 12MB");
			return;
		}

		setUploading(true);

		try {
			// Create preview
			const reader = new FileReader();
			reader.onload = (event) => {
				setPreviewImage(event.target.result);
			};
			reader.readAsDataURL(file);

			// Upload to server
			const formData = new FormData();
			formData.append("profilePicture", file);
			const response = await UserService.updateProfilePicture(formData);
			const serverProfilePicUrl = response.data.user.profilePicture;

			// Update contexts and parent components
			onPictureUpdate(serverProfilePicUrl);
			updateProfileImage(serverProfilePicUrl);

			toast.success("Profile picture updated successfully!");
		} catch (error) {
			toast.error("Failed to upload profile picture");
			console.error("Upload error:", error);
			setPreviewImage(picture); // Revert to original
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="text-center mb-3 mt-2">
			<div
				className="profile-picture-container"
				onClick={handleProfilePictureClick}
				style={{ cursor: uploading ? "wait" : "pointer" }}
				aria-label="Change profile picture"
				role="button"
				tabIndex="0"
			>
				{previewImage ? (
					<img
						src={previewImage}
						alt={`${fullName || "User"}'s profile`}
						className="shadow"
					/>
				) : (
					<UserAvatar fullName={fullName || "User"} size="lg" />
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
			<p className="text-muted small mt-1">
				Click to update your profile picture
			</p>
			<input
				type="file"
				accept="image/*"
				id="profilePictureInput"
				ref={fileInputRef}
				style={{ display: "none" }}
				onChange={handleFileChange}
				disabled={uploading}
				aria-label="Upload profile picture"
			/>
		</div>
	);
};

export default ProfilePicture;
