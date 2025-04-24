import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaCamera, FaTimes, FaTrash, FaUpload } from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";
import UserService from "../../../services/user.service";
import UserAvatar from "../../common/UserAvatar";

const ProfilePicture = ({ picture, fullName, onPictureUpdate }) => {
	const [showModal, setShowModal] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const { showToast } = useToast();
	const fileInputRef = useRef(null);

	useEffect(() => {
		setPreviewImage(picture);
	}, [picture]);

	const handleModalOpen = () => {
		setShowModal(true);
		setPreviewImage(picture);
		setSelectedFile(null);
	};

	const handleModalClose = () => {
		setShowModal(false);
		setPreviewImage(picture);
		setSelectedFile(null);
		setShowDeleteConfirm(false);
	};

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			handleImageUpload(file);
		}
	};

	const handleImageUpload = (file) => {
		if (!file) return;

		if (!file.type.match("image.*")) {
			showToast("Please select an image file", "error");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			showToast("File size should be less than 5MB", "error");
			return;
		}

		setSelectedFile(file);

		const reader = new FileReader();
		reader.onload = (e) => {
			setPreviewImage(e.target.result);
		};
		reader.readAsDataURL(file);
	};

	const handleClickUpload = () => {
		fileInputRef.current.click();
	};

	const handleSave = async () => {
		if (!selectedFile && !previewImage) {
			setShowModal(false);
			return;
		}

		if (!selectedFile && previewImage === picture) {
			setShowModal(false);
			return;
		}

		setLoading(true);

		try {
			const formData = new FormData();
			formData.append("profilePicture", selectedFile);

			const response = await UserService.updateProfilePicture(formData);

			if (
				response.data &&
				response.data.user &&
				response.data.user.profilePicture
			) {
				onPictureUpdate(response.data.user.profilePicture);
				showToast("Profile picture updated successfully!", "success");
			} else {
				throw new Error("No image URL returned from server");
			}
		} catch (error) {
			console.error("Error updating profile picture:", error);
			showToast(
				error.response?.data?.message || "Failed to update profile picture",
				"error"
			);
		} finally {
			setLoading(false);
			setShowModal(false);
		}
	};

	const handleRemove = () => {
		setPreviewImage(null);
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleDeleteProfilePicture = async () => {
		setLoading(true);

		try {
			const response = await UserService.deleteProfilePicture();

			if (response.status === "success") {
				onPictureUpdate(null);
				showToast("Profile picture removed successfully", "success");
				handleModalClose();
			}
		} catch (error) {
			console.error("Error deleting profile picture:", error);
			showToast(
				error.response?.data?.message || "Failed to remove profile picture",
				"error"
			);
		} finally {
			setLoading(false);
			setShowDeleteConfirm(false);
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
					{showDeleteConfirm ? (
						<div className="text-center py-4">
							<div className="mb-4">
								<FaTrash className="text-danger mb-3" size={48} />
								<h5 className="text-white">Remove Profile Picture?</h5>
								<p className="text-secondary">
									This will permanently remove your profile picture. You will be
									represented by your initials until you upload a new image.
								</p>
							</div>
							<div className="d-flex justify-content-center gap-3">
								<Button
									variant="outline-secondary"
									onClick={() => setShowDeleteConfirm(false)}
									disabled={loading}
								>
									Cancel
								</Button>
								<Button
									variant="danger"
									onClick={handleDeleteProfilePicture}
									disabled={loading}
								>
									{loading ? (
										<>
											<span
												className="spinner-border spinner-border-sm me-2"
												role="status"
												aria-hidden="true"
											></span>
											Removing...
										</>
									) : (
										"Remove Photo"
									)}
								</Button>
							</div>
						</div>
					) : (
						<>
							<div className="picture-preview-container">
								{previewImage ? (
									<>
										<img
											src={previewImage}
											alt="Preview"
											className="profile-picture"
										/>
										<div
											className="profile-picture-remove"
											onClick={handleRemove}
										>
											<FaTimes />
										</div>
									</>
								) : (
									<UserAvatar fullName={fullName} variant="settings" />
								)}
							</div>

							<div className="upload-instructions">
								Upload a new profile picture. The image should be at least
								400x400 pixels.
							</div>

							<Button
								className="upload-button w-100"
								onClick={handleClickUpload}
							>
								<FaUpload className="me-2" /> Select an Image
							</Button>

							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileSelect}
								accept="image/*"
								className="file-input"
							/>

							{picture && (
								<Button
									variant="outline-danger"
									className="w-100 mt-3"
									onClick={() => setShowDeleteConfirm(true)}
								>
									<FaTrash className="me-2" /> Remove Profile Picture
								</Button>
							)}
						</>
					)}
				</Modal.Body>
				{!showDeleteConfirm && (
					<Modal.Footer>
						<Button variant="outline-secondary" onClick={handleModalClose}>
							Cancel
						</Button>
						<Button
							className="gradient-button"
							onClick={handleSave}
							disabled={loading || (!selectedFile && previewImage === picture)}
						>
							{loading ? (
								<>
									<span
										className="spinner-border spinner-border-sm me-2"
										role="status"
										aria-hidden="true"
									></span>
									Uploading...
								</>
							) : (
								"Save Photo"
							)}
						</Button>
					</Modal.Footer>
				)}
			</Modal>
		</>
	);
};

export default ProfilePicture;
