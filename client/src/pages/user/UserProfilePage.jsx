import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import UserAvatar from "../../components/common/UserAvatar";
import PostList from "../../components/posts/PostList";
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
				setUserData(response.data.user);
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
			<PostList />
		</Container>
	);
};

export default UserProfilePage;
