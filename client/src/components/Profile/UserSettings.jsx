import { useState } from "react";
import { Alert, Button, Form, Tab, Tabs } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import "./UserSettings.css";

/* Username, fullName, picture, email */
const UserSettings = () => {
	const { currentUser, setCurrentUser } = useAuth();
	console.log(currentUser);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [accountData, setAccountData] = useState({
		username: currentUser?.username || "",
		fullname: currentUser?.fullName || "",
		picture: currentUser?.profilePicture || "",
		email: currentUser?.email || "",
	});

	// const [profileData, setProfileData] = useState({
	//     fullName: currentUser?.fullName || "",
	//     bio: currentUser?.bio || ""
	//   });

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleAccountSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const response = await UserService.updateProfile(accountData);
			setCurrentUser(response.data.data.user);
			setSuccess("Account settings updated successfully!");
			toast.success("Account settings updated!");
		} catch (err) {
			setError(
				err.response?.data?.message || "Failed to update account settings."
			);
			toast.error("Failed to update account settings.");
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setError("New passwords don't match");
			return;
		}

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			await AuthService.changePassword(
				passwordData.currentPassword,
				passwordData.newPassword
			);
			setSuccess("Password updated successfully!");
			toast.success("Password updated!");
			// Reset password fields
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (err) {
			setError(err.response?.data?.message || "Failed to update password");
			toast.error("Failed to update password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container settings-container">
			<h2 className="settings-title">User Settings</h2>

			{/* Profile Picture Section */}
			<div className="text-center mb-4">
				<div className="profile-picture-container">
					<img
						src={accountData.picture || "https://via.placeholder.com/150"}
						alt="Profile"
						className="profile-picture"
					/>
				</div>
				<p className="profile-picture-instruction">
					To update profile picture click on the image
				</p>
				<input
					type="file"
					accept="image/*"
					id="profilePictureInput"
					className="d-none"
					onChange={(e) => {
						// Handle file upload
						const file = e.target.files[0];
						// You might want to preview the image and/or prepare it for upload
					}}
				/>
			</div>

			<Tabs defaultActiveKey="account" className="mb-4">
				<Tab eventKey="profile" title="Profile Information">
					{/* Profile tab content will go here */}
					<p>Profile settings section</p>
				</Tab>

				<Tab eventKey="account" title="Account Settings">
					{error && <Alert variant="danger">{error}</Alert>}
					{success && <Alert variant="success">{success}</Alert>}

					<Form onSubmit={handleAccountSubmit}>
						{/* Username field */}
						<Form.Group className="mb-3">
							<Form.Label>Username</Form.Label>
							<Form.Control
								type="text"
								value={accountData.username}
								onChange={(e) =>
									setAccountData({ ...accountData, username: e.target.value })
								}
								required
							/>
						</Form.Group>

						{/* Fullname field */}
						<Form.Group className="mb-3">
							<Form.Label>Full Name</Form.Label>
							<Form.Control
								type="text"
								value={accountData.fullname}
								onChange={(e) =>
									setAccountData({ ...accountData, fullname: e.target.value })
								}
								required
							/>
						</Form.Group>

						{/* Email field */}
						<Form.Group className="mb-3">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="email"
								value={accountData.email}
								onChange={(e) =>
									setAccountData({ ...accountData, email: e.target.value })
								}
								required
							/>
						</Form.Group>

						{/* Submit button */}
						<Button type="submit" className="btn-primary" disabled={loading}>
							{loading ? "Saving..." : "Save Changes"}
						</Button>
					</Form>
				</Tab>

				<Tab eventKey="password" title="Change Password">
					{/* Username field */}
					<Form onSubmit={handlePasswordSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Current Password</Form.Label>
							<Form.Control
								type="password"
								value={passwordData.currentPassword}
								onChange={(e) =>
									setPasswordData({
										...passwordData,
										currentPassword: e.target.value,
									})
								}
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>New Password</Form.Label>
							<Form.Control
								type="password"
								value={passwordData.newPassword}
								onChange={(e) =>
									setPasswordData({
										...passwordData,
										newPassword: e.target.value,
									})
								}
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Confirm New Password</Form.Label>
							<Form.Control
								type="password"
								value={passwordData.confirmPassword}
								onChange={(e) =>
									setPasswordData({
										...passwordData,
										confirmPassword: e.target.value,
									})
								}
								required
							/>
						</Form.Group>

						<Button type="submit" className="btn-primary" disabled={loading}>
							Change Password
						</Button>
					</Form>
				</Tab>
			</Tabs>
		</div>
	);
};
export default UserSettings;
