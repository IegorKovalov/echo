import { useEffect, useState } from "react";
import { Card, Col, Container, Nav, Row, Tab } from "react-bootstrap";
import {
	FaChevronRight,
	FaLock,
	FaUserCircle,
	FaUserCog,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import UserService from "../../services/user.service";

import { useLocation } from "react-router-dom";
import AccountSettingsTab from "../../components/user/settings/AccountSettingsTab";
import ChangePasswordTab from "../../components/user/settings/ChangePasswordTab";
import ProfileInformationTab from "../../components/user/settings/ProfileInformationTab";
import ProfilePicture from "../../components/user/settings/ProfilePicture";

const UserSettingsPage = () => {
	const { currentUser, setCurrentUser } = useAuth();
	const { updateProfileImage } = useProfile();
	const location = useLocation();
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

	useEffect(() => {
		const hash = location.hash.replace("#", "");
		if (hash) {
			setActiveTab(hash);
		}
	}, [location.hash]);

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
		updateProfileImage(pictureData);
	};

	return (
		<Container className="py-4">
			<h2 className="fw-bold text-primary mb-4">Settings</h2>

			<Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
				<Row>
					<Col lg={3} md={4} className="mb-4">
						<Card className="shadow-sm border-0 rounded-4 overflow-hidden">
							<Card.Body className="p-0">
								<div className="p-4 text-center border-bottom">
									<div className="mb-3">
										<ProfilePicture
											picture={accountData.picture}
											fullName={accountData.fullname}
											onPictureUpdate={updatePicture}
										/>
									</div>
									<h5 className="fw-bold mb-1">{accountData.fullname}</h5>
									<p className="text-secondary mb-0">@{accountData.username}</p>
								</div>

								<Nav variant="pills" className="flex-column settings-nav p-2">
									<Nav.Item>
										<Nav.Link
											eventKey="account"
											href="#account"
											className="d-flex justify-content-between align-items-center rounded-3 mb-1 p-3"
										>
											<div className="d-flex align-items-center">
												<FaUserCog className="me-3 text-primary" />
												<span>Account</span>
											</div>
											<FaChevronRight
												className="nav-chevron text-secondary"
												style={{ fontSize: "12px" }}
											/>
										</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link
											eventKey="profile"
											href="#profile"
											className="d-flex justify-content-between align-items-center rounded-3 mb-1 p-3"
										>
											<div className="d-flex align-items-center">
												<FaUserCircle className="me-3 text-primary" />
												<span>Profile</span>
											</div>
											<FaChevronRight
												className="nav-chevron text-secondary"
												style={{ fontSize: "12px" }}
											/>
										</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link
											eventKey="security"
											href="#security"
											className="d-flex justify-content-between align-items-center rounded-3 p-3"
										>
											<div className="d-flex align-items-center">
												<FaLock className="me-3 text-primary" />
												<span>Security</span>
											</div>
											<FaChevronRight
												className="nav-chevron text-secondary"
												style={{ fontSize: "12px" }}
											/>
										</Nav.Link>
									</Nav.Item>
								</Nav>
							</Card.Body>
						</Card>
					</Col>

					<Col lg={9} md={8}>
						<Card className="shadow-sm border-0 rounded-4 overflow-hidden">
							<Card.Body className="p-4">
								<Tab.Content>
									<Tab.Pane eventKey="account">
										<h3 className="fw-bold mb-4">Account Settings</h3>
										<AccountSettingsTab
											accountData={accountData}
											setAccountData={setAccountData}
											onSubmit={handleAccountSubmit}
											loading={loading}
											error={error}
											success={success}
										/>
									</Tab.Pane>

									<Tab.Pane eventKey="profile">
										<h3 className="fw-bold mb-4">Profile Information</h3>
										<ProfileInformationTab />
									</Tab.Pane>

									<Tab.Pane eventKey="security">
										<h3 className="fw-bold mb-4">Security Settings</h3>
										<ChangePasswordTab
											passwordData={passwordData}
											onSubmit={handlePasswordSubmit}
											loading={loading}
											error={error}
											success={success}
										/>
									</Tab.Pane>
								</Tab.Content>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Tab.Container>
		</Container>
	);
};

export default UserSettingsPage;
