import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import UserAvatar from "../../components/common/UserAvatar";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import UserService from "../../services/user.service";

const UserProfilePage = () => {
	const { currentUser } = useAuth();
	const { profileImage } = useProfile();
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				setLoading(true);
				const response = await UserService.getProfile();
				setUserData(response.data.data.user);
			} catch (error) {
				console.error("Error fetching user data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, []);

	if (loading) {
		return (
			<Container className="py-5 text-center text-white">
				<div className="spinner-border text-light" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</Container>
		);
	}

	return (
		<Container className="py-5">
			<div className="text-white">
				<div className="row">
					<div className="col-md-4 mb-4">
						<div className="settings-section text-center">
							<div className="d-flex justify-content-center mb-3">
								<div style={{ width: "150px", height: "150px" }}>
									<UserAvatar
										fullName={currentUser?.fullName}
										src={profileImage}
										variant="settings"
									/>
								</div>
							</div>

							<h2 className="mt-3 mb-1">{currentUser?.fullName}</h2>
							<p className="text-secondary mb-2">@{currentUser?.username}</p>

							{userData?.bio && (
								<p className="text-white-50 mb-3">{userData.bio}</p>
							)}

							<div className="d-flex justify-content-center gap-3 mb-2">
								{userData?.location && (
									<span className="text-secondary">
										<i className="bi bi-geo-alt me-1"></i> {userData.location}
									</span>
								)}

								{userData?.website && (
									<a
										href={
											userData.website.startsWith("http")
												? userData.website
												: `https://${userData.website}`
										}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary"
									>
										<i className="bi bi-link-45deg me-1"></i> Website
									</a>
								)}
							</div>
						</div>
					</div>

					<div className="col-md-8">
						<div className="settings-section">
							<h3 className="mb-4">My Posts</h3>

							<div className="text-center py-4 text-secondary">
								<p>You haven't created any posts yet.</p>
								<button className="btn gradient-button mt-2">
									Create Your First Post
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Container>
	);
};

export default UserProfilePage;
