import { useState } from "react";
import { FaInfoCircle, FaLock, FaUser, FaUserCog } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import UserService from "../../../services/user.service";
import AccountSettingsTab from "./AccountSettingsTab";
import ChangePasswordTab from "./ChangePasswordTab";
import ProfileInformationTab from "./ProfileInformationTab";
import ProfilePicture from "./profilePicture/ProfilePicture";
import "./usersettings.css";

const UserSettings = () => {
	const { currentUser, setCurrentUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// We no longer need activeTab state since all sections will be visible

	const [accountData, setAccountData] = useState({
		username: currentUser?.username || "",
		fullname: currentUser?.fullName || "",
		picture: currentUser?.profilePicture || "",
		email: currentUser?.email || "",
	});

	const [passwordData, setPasswordData] = useState({
		passwordCurrent: "",
		password: "",
		passwordConfirm: "",
	});

	const handleAccountSubmit = async (formData) => {
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const userData = {
				username: formData.username,
				fullName: formData.fullname,
				email: formData.email,
			};

			if (formData.picture && formData.picture.startsWith("data:")) {
				const pictureFormData = new FormData();
				pictureFormData.append("profilePicture", formData.picture);
				await UserService.updateProfilePicture(pictureFormData);
			} else if (formData.picture) {
				userData.profilePicture = formData.picture;
			}

			const response = await UserService.updateProfile(userData);
			setCurrentUser(response.data.user);
			setAccountData({
				username: response.data.user.username || "",
				fullname: response.data.user.fullName || "",
				picture: response.data.user.profilePicture || "",
				email: response.data.user.email || "",
			});

			return { success: true };
		} catch (err) {
			setError(
				err.response?.data?.message || "Failed to update account settings."
			);
			return { success: false, error: err };
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordSubmit = async (passwordFormData) => {
		if (passwordFormData.password !== passwordFormData.passwordConfirm) {
			setError("New passwords don't match");
			return { success: false };
		}

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			await UserService.changePassword(
				passwordFormData.passwordCurrent,
				passwordFormData.password,
				passwordFormData.passwordConfirm
			);

			setPasswordData({
				passwordCurrent: "",
				password: "",
				passwordConfirm: "",
			});

			return { success: true };
		} catch (err) {
			setError(err.response?.data?.message || "Failed to update password");
			return { success: false, error: err };
		} finally {
			setLoading(false);
		}
	};

	const updatePicture = (pictureData) => {
		setAccountData({ ...accountData, picture: pictureData });
	};

	// Function to scroll to a specific section
	const scrollToSection = (sectionId) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<div className="container py-4 settings-container">
			<div className="settings-card card shadow">
				<div className="card-header bg-black py-3">
					<div className="d-flex align-items-center justify-content-center mb-2">
						<h2 className="mb-0 fw-bold">Account Settings</h2>
					</div>
					<p className="text-center text-muted mb-0">
						Manage your account information, profile details, and security
					</p>

					<ProfilePicture
						picture={accountData.picture}
						fullName={accountData.fullname}
						onPictureUpdate={updatePicture}
					/>

					{/* Quick-jump navigation instead of tabs */}
					<div className="settings-quick-nav">
						<button
							className="nav-pill"
							onClick={() => scrollToSection("account-section")}
						>
							<FaUserCog className="me-1" />
							<span>Account</span>
						</button>
						<button
							className="nav-pill"
							onClick={() => scrollToSection("profile-section")}
						>
							<FaUser className="me-1" />
							<span>Profile</span>
						</button>
						<button
							className="nav-pill"
							onClick={() => scrollToSection("security-section")}
						>
							<FaLock className="me-1" />
							<span>Security</span>
						</button>
					</div>
				</div>

				<div className="card-body p-3">
					{/* Scrollable sections content */}
					<div className="settings-scrollable-content">
						{/* Account Section */}
						<div id="account-section" className="settings-section-container">
							<AccountSettingsTab
								accountData={accountData}
								setAccountData={setAccountData}
								onSubmit={handleAccountSubmit}
								loading={loading}
								error={error}
								success={success}
							/>
						</div>

						{/* Profile Section */}
						<div id="profile-section" className="settings-section-container">
							<ProfileInformationTab />
						</div>

						{/* Security Section */}
						<div id="security-section" className="settings-section-container">
							<ChangePasswordTab
								passwordData={passwordData}
								onSubmit={handlePasswordSubmit}
								loading={loading}
								error={error}
								success={success}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserSettings;
