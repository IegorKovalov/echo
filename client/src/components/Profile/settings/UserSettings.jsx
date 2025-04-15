import { useState } from "react";
import { FaLock, FaUser, FaUserCog } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import AuthService from "../../../services/auth.service";
import UserService from "../../../services/user.service";
import "../settings/usersettings.css";
import AccountSettingsTab from "./AccountSettingsTab";
import ChangePasswordTab from "./ChangePasswordTab";
import ProfileInformationTab from "./ProfileInformationTab";
import ProfilePicture from "./ProfilePicture";

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
			setSuccess("Account settings updated successfully!");
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
			setSuccess("Password updated successfully!");
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
		<div className="container py-4">
			<div className="row justify-content-center">
				<div className="col-lg-8">
					<div className="card shadow-sm">
						<div className="card-header bg-white py-3">
							<h2 className="card-title text-center mb-0">User Settings</h2>
						</div>
						<div className="card-body">
							<ProfilePicture
								picture={accountData.picture}
								fullName={accountData.fullname}
								onPictureUpdate={updatePicture}
							/>

							<ul className="nav nav-tabs settings-tabs mb-4">
								<li className="nav-item">
									<button
										className={`nav-link ${
											activeTab === "account" ? "active" : ""
										}`}
										onClick={() => setActiveTab("account")}
									>
										<FaUserCog /> Account Settings
									</button>
								</li>
								<li className="nav-item">
									<button
										className={`nav-link ${
											activeTab === "profile" ? "active" : ""
										}`}
										onClick={() => setActiveTab("profile")}
									>
										<FaUser /> Profile Information
									</button>
								</li>
								<li className="nav-item">
									<button
										className={`nav-link ${
											activeTab === "password" ? "active" : ""
										}`}
										onClick={() => setActiveTab("password")}
									>
										<FaLock /> Change Password
									</button>
								</li>
							</ul>

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
										setPasswordData={setPasswordData}
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
			</div>
		</div>
	);
};

export default UserSettings;
