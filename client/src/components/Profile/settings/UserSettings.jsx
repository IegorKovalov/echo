import { useState } from "react";
import { FaLock, FaUser, FaUserCog } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import AuthService from "../../../services/auth.service";
import UserService from "../../../services/user.service";
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
		<div>
			<h2>User Settings</h2>

			<ProfilePicture
				picture={accountData.picture}
				fullName={accountData.fullname}
				onPictureUpdate={updatePicture}
			/>

			<div>
				<button onClick={() => setActiveTab("account")}>
					<FaUserCog /> Account Settings
				</button>
				<button onClick={() => setActiveTab("profile")}>
					<FaUser /> Profile Information
				</button>
				<button onClick={() => setActiveTab("password")}>
					<FaLock /> Change Password
				</button>
			</div>

			<div>
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
	);
};

export default UserSettings;
