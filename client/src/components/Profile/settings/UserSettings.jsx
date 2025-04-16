import { useState } from "react";
import {
	FaInfoCircle,
	FaLock,
	FaShieldAlt,
	FaUser,
	FaUserCog,
} from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import UserService from "../../../services/user.service";
import AccountSettingsTab from "./AccountSettingsTab";
import ChangePasswordTab from "./ChangePasswordTab";
import ProfileInformationTab from "./ProfileInformationTab";
import ProfilePicture from "./ProfilePicture";
import "./usersettings.css";

const UserSettings = () => {
	const { currentUser, setCurrentUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [activeTab, setActiveTab] = useState("account");

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

	return (
		<div className="container py-5 settings-container">
			<div className="settings-card card shadow">
				<div className="card-header bg-black py-4">
					<div className="d-flex align-items-center justify-content-center mb-3">
						<h2 className="mb-0 fw-bold">Account Settings</h2>
					</div>
					<p className="text-center text-muted mb-0">
						Manage your account information, profile details, and security
						settings
					</p>

					<ProfilePicture
						picture={accountData.picture}
						fullName={accountData.fullname}
						onPictureUpdate={updatePicture}
					/>

					<ul className="nav settings-tabs">
						<li className="nav-item">
							<button
								className={`nav-link ${
									activeTab === "account" ? "active" : ""
								}`}
								onClick={() => setActiveTab("account")}
							>
								<FaUserCog />
								<span>Account</span>
							</button>
						</li>
						<li className="nav-item">
							<button
								className={`nav-link ${
									activeTab === "profile" ? "active" : ""
								}`}
								onClick={() => setActiveTab("profile")}
							>
								<FaUser />
								<span>Profile</span>
							</button>
						</li>
						<li className="nav-item">
							<button
								className={`nav-link ${
									activeTab === "password" ? "active" : ""
								}`}
								onClick={() => setActiveTab("password")}
							>
								<FaLock />
								<span>Security</span>
							</button>
						</li>
					</ul>
				</div>

				<div className="card-body p-4">
					{error && (
						<div
							className="alert alert-danger d-flex align-items-center mb-4"
							role="alert"
						>
							<FaInfoCircle className="me-2" />
							<div>{error}</div>
						</div>
					)}

					{success && (
						<div
							className="alert alert-success d-flex align-items-center mb-4"
							role="alert"
						>
							<FaInfoCircle className="me-2" />
							<div>{success}</div>
						</div>
					)}

					<div className="tab-content">
						{activeTab === "account" && (
							<AccountSettingsTab
								accountData={accountData}
								setAccountData={setAccountData}
								onSubmit={handleAccountSubmit}
								loading={loading}
								error={error}
								success={success}
							/>
						)}

						{activeTab === "profile" && <ProfileInformationTab />}

						{activeTab === "password" && (
							<ChangePasswordTab
								passwordData={passwordData}
								onSubmit={handlePasswordSubmit}
								loading={loading}
								error={error}
								success={success}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserSettings;
