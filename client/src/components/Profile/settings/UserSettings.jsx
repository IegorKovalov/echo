import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { FaLock, FaUser, FaUserCog } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import AuthService from "../../../services/auth.service";
import UserService from "../../../services/user.service";
import AccountSettingsTab from "./AccountSettingsTab";
import ChangePasswordTab from "./ChangePasswordTab";
import ProfileInformationTab from "./ProfileInformationTab";
import ProfilePicture from "./ProfilePicture";
import "./settings.css"; // We'll create this later

const UserSettings = () => {
	const { currentUser, setCurrentUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [accountData, setAccountData] = useState({
		username: currentUser?.username || "",
		fullname: currentUser?.fullName || "",
		picture: currentUser?.profilePicture || "",
		email: currentUser?.email || "",
	});

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleAccountSubmit = async (formData) => {
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const response = await UserService.updateProfile(formData);
			setCurrentUser(response.data.data.user);
			setAccountData({
				username: response.data.data.user.username || "",
				fullname: response.data.data.user.fullName || "",
				picture: response.data.data.user.profilePicture || "",
				email: response.data.data.user.email || "",
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
		if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
			setError("New passwords don't match");
			return { success: false };
		}

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			await AuthService.changePassword(
				passwordFormData.currentPassword,
				passwordFormData.newPassword
			);
			setSuccess("Password updated successfully!");
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
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
		<div className="container settings-container">
			<h2 className="settings-title">User Settings</h2>

			<ProfilePicture
				picture={accountData.picture}
				fullName={accountData.fullname}
				onPictureUpdate={updatePicture}
			/>

			<Tabs defaultActiveKey="account" className="mb-4 settings-tabs">
				<Tab
					eventKey="account"
					title={
						<span>
							<FaUserCog className="me-2" /> Account Settings
						</span>
					}
				>
					<AccountSettingsTab
						accountData={accountData}
						setAccountData={setAccountData}
						onSubmit={handleAccountSubmit}
						loading={loading}
						error={error}
						success={success}
					/>
				</Tab>

				<Tab
					eventKey="profile"
					title={
						<span>
							<FaUser className="me-2" /> Profile Information
						</span>
					}
				>
					<ProfileInformationTab />
				</Tab>

				<Tab
					eventKey="password"
					title={
						<span>
							<FaLock className="me-2" /> Change Password
						</span>
					}
				>
					<ChangePasswordTab
						passwordData={passwordData}
						setPasswordData={setPasswordData}
						onSubmit={handlePasswordSubmit}
						loading={loading}
						error={error}
						success={success}
					/>
				</Tab>
			</Tabs>
		</div>
	);
};

export default UserSettings;
