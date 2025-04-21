import { useRef, useState } from "react";
import { Button, Image } from "react-bootstrap";
import { FaCamera, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import UserService from "../../../../services/user.service";
import UserAvatar from "../../shared/UserAvatar";
import "./ProfilePicture.css";

const ProfilePicture = ({ picture, fullName, onPictureUpdate }) => {
	const fileInputRef = useRef(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [isUploading, setIsUploading] = useState(false);

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		if (!file.type.match("image.*")) {
			toast.error("Please select an image file");
			return;
		}

		if (file.size > 12 * 1024 * 1024) {
			toast.error("Image size should be less than 5MB");
			return;
		}

		setSelectedFile(file);

		// Create preview
		const reader = new FileReader();
		reader.onload = () => {
			setPreviewUrl(reader.result);
		};
		reader.readAsDataURL(file);
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		try {
			setIsUploading(true);
			const formData = new FormData();
			formData.append("profilePicture", selectedFile);

			const response = await UserService.updateProfilePicture(formData);

			if (response && response.data && response.data.user) {
				toast.success("Profile picture updated successfully");
				onPictureUpdate(response.data.user.profilePicture);
				resetUpload();
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(
				error.response?.data?.message || "Failed to upload profile picture"
			);
		} finally {
			setIsUploading(false);
		}
	};

	const resetUpload = () => {
		setSelectedFile(null);
		setPreviewUrl(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="profile-picture-container">
			<div className="profile-image-wrapper">
				{previewUrl ? (
					<Image
						src={previewUrl}
						roundedCircle
						alt="Preview"
						className="profile-image"
					/>
				) : picture ? (
					<Image
						src={picture}
						roundedCircle
						alt={fullName || "Avatar"}
						className="profile-image"
					/>
				) : (
					<UserAvatar name={fullName} size="lg" />
				)}

				{!selectedFile && (
					<div className="upload-overlay">
						<Button
							variant="light"
							className="camera-button"
							onClick={() => fileInputRef.current.click()}
							disabled={isUploading}
						>
							<FaCamera />
						</Button>
					</div>
				)}
			</div>

			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept="image/*"
				style={{ display: "none" }}
			/>

			{selectedFile && (
				<div className="action-buttons">
					<Button
						variant="success"
						size="sm"
						onClick={handleUpload}
						disabled={isUploading}
					>
						{isUploading ? "Uploading..." : <FaCheck />}
					</Button>
					<Button
						variant="danger"
						size="sm"
						onClick={resetUpload}
						disabled={isUploading}
					>
						<FaTimes />
					</Button>
				</div>
			)}
		</div>
	);
};

export default ProfilePicture;
