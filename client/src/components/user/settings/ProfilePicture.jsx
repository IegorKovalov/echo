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
			<div
				className="profile-picture-container position-relative"
				onClick={handleModalOpen}
			>
				{picture ? (
					<img
						src={picture}
						alt={`${fullName}'s profile`}
						className="profile-picture rounded-circle"
					/>
				) : (
					<UserAvatar fullName={fullName} variant="settings" />
				)}
				<div className="profile-picture-overlay d-flex flex-column align-items-center justify-content-center position-absolute top-0 start-0 w-100 h-100 rounded-circle">
					<FaCamera className="profile-picture-icon text-white mb-1" />
					<div className="profile-picture-text small text-white">
						Change Photo
					</div>
				</div>
			</div>

			<Modal
				show={showModal}
				onHide={handleModalClose}
				centered
				size="md"
				className="profile-picture-modal"
			>
				<Modal.Header closeButton>
					<Modal.Title>Update Profile Picture</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{showDeleteConfirm ? (
						<div className="text-center py-4">
							<div className="mb-4">
								<FaTrash className="text-danger mb-3" size={48} />
								<h5>Remove Profile Picture?</h5>
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
									className="px-4"
								>
									Cancel
								</Button>
								<Button
									variant="danger"
									onClick={handleDeleteProfilePicture}
									disabled={loading}
									className="px-4"
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
							<div className="picture-preview-container d-flex justify-content-center mb-4">
								<div className="position-relative">
									{previewImage ? (
										<>
											<img
												src={previewImage}
												alt="Preview"
												className="profile-picture rounded-circle shadow-sm"
												style={{
													width: "150px",
													height: "150px",
													objectFit: "cover",
												}}
											/>
											<button
												className="profile-picture-remove btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 shadow-sm"
												onClick={handleRemove}
											>
												<FaTimes />
											</button>
										</>
									) : (
										<UserAvatar
											fullName={fullName}
											variant="settings"
											style={{ width: "150px", height: "150px" }}
										/>
									)}
								</div>
							</div>

							<div className="upload-instructions text-center mb-4">
								<p className="text-secondary">
									Upload a new profile picture. The image should be at least
									400x400 pixels.
								</p>
							</div>

							<Button
								className="upload-button w-100 mb-3 py-2"
								onClick={handleClickUpload}
								variant="primary"
							>
								<FaUpload className="me-2" /> Select an Image
							</Button>

							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileSelect}
								accept="image/*"
								className="d-none"
							/>

							{picture && (
								<Button
									variant="outline-danger"
									className="w-100 py-2"
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
						<Button
							variant="outline-secondary"
							onClick={handleModalClose}
							className="px-4"
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={handleSave}
							disabled={loading || (!selectedFile && previewImage === picture)}
							className="px-4"
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
