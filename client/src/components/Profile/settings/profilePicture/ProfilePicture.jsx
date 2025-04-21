import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaCamera, FaTimes, FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";
import UserAvatar from "../../shared/UserAvatar";
import "./ProfilePicture.css";

const ProfilePicture = ({ picture, fullName, onPictureUpdate }) => {
	const [showModal, setShowModal] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);
	const fileInputRef = useRef(null);

	useEffect(() => {
		setPreviewImage(picture);
	}, [picture]);

	const handleModalOpen = () => {
		setShowModal(true);
		setPreviewImage(picture);
	};

	const handleModalClose = () => {
		setShowModal(false);
		setPreviewImage(picture);
	};

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		handleImageUpload(file);
	};

	const handleImageUpload = (file) => {
		if (!file) return;
		if (!file.type.match("image.*")) {
			toast.error("Please select an image file");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size should be less than 5MB");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			setPreviewImage(e.target.result);
		};
		reader.readAsDataURL(file);
	};

	const handleClickUpload = () => {
		fileInputRef.current.click();
	};

	const handleSave = () => {
		if (previewImage) {
			onPictureUpdate(previewImage);
			setShowModal(false);
			toast.success("Profile picture updated successfully!");
		}
	};

	const handleRemove = () => {
		setPreviewImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<>
			<div className="profile-picture-container" onClick={handleModalOpen}>
				{picture ? (
					<img
						src={picture}
						alt={`${fullName}'s profile`}
						className="profile-picture"
					/>
				) : (
					<UserAvatar fullName={fullName} variant="settings" />
				)}
				<div className="profile-picture-overlay">
					<FaCamera className="profile-picture-icon" />
					<div className="profile-picture-text">Change Photo</div>
				</div>
			</div>

			<Modal
				show={showModal}
				onHide={handleModalClose}
				centered
				size="md"
				contentClassName="profile-modal"
				backdropClassName="modal-backdrop-dark"
			>
				<Modal.Header closeButton className="text-white">
					<Modal.Title>Update Profile Picture</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="picture-preview-container">
						{previewImage ? (
							<>
								<img
									src={previewImage}
									alt="Preview"
									className="profile-picture"
								/>
								<div className="profile-picture-remove" onClick={handleRemove}>
									<FaTimes />
								</div>
							</>
						) : (
							<UserAvatar fullName={fullName} variant="settings" />
						)}
					</div>

					<div className="upload-instructions">
						Upload a new profile picture. The image should be at least 400x400
						pixels.
					</div>

					<Button className="upload-button w-100" onClick={handleClickUpload}>
						<FaUpload className="me-2" /> Select an Image
					</Button>

					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileSelect}
						accept="image/*"
						className="file-input"
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={handleModalClose}>
						Cancel
					</Button>
					<Button
						className="gradient-button"
						onClick={handleSave}
						disabled={!previewImage}
					>
						Save Photo
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default ProfilePicture;
