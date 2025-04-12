import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import UserService from "../../services/user.service";
import "./UserProfile.css";

const UserProfile = () => {
	const { currentUser, setCurrentUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState({
		fullName: "",
		profilePicture: "",
	});

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const response = await UserService.getProfile();
				if (response.data && response.data.user) {
					setCurrentUser(response.data.user);
					setFormData({
						fullName: response.data.user.fullName || "",
						profilePicture: response.data.user.profilePicture || "",
					});
				}
			} catch (error) {
				console.error("Error fetching profile:", error);
				toast.error("Failed to load user profile");
			}
		};

		fetchUserProfile();
	}, [setCurrentUser]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setLoading(true);
			const response = await UserService.updateProfile(formData);

			if (response.data && response.data.data.user) {
				setCurrentUser(response.data.data.user);
				toast.success("Profile updated successfully!");
			}

			setEditing(false);
		} catch (error) {
			console.error("Error updating profile:", error);
			toast.error("Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	const toggleEdit = () => {
		setEditing(!editing);

		if (!editing) {
			setFormData({
				fullName: currentUser?.fullName || "",
				profilePicture: currentUser?.profilePicture || "",
			});
		}
	};

	const defaultProfilePicture = "https://via.placeholder.com/150";

	return (
		<div className="profile-container">
			<div className="profile-header">
				<img
					src={currentUser?.profilePicture || defaultProfilePicture}
					alt={currentUser?.fullName || "User"}
					className="profile-picture"
				/>
				<div className="profile-info">
					<h2>{currentUser?.fullName}</h2>
					<p>@{currentUser?.username}</p>
				</div>
			</div>

			{editing ? (
				<form onSubmit={handleSubmit} className="profile-form">
					<div className="form-group">
						<label htmlFor="fullName" className="form-label">
							Full Name
						</label>
						<input
							type="text"
							id="fullName"
							name="fullName"
							className="form-input"
							value={formData.fullName}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="profilePicture" className="form-label">
							Profile Picture URL
						</label>
						<input
							type="url"
							id="profilePicture"
							name="profilePicture"
							className="form-input"
							value={formData.profilePicture}
							onChange={handleChange}
							placeholder="https://example.com/your-image.jpg"
						/>
					</div>

					<div className="profile-buttons">
						<button type="submit" className="btn" disabled={loading}>
							{loading ? "Saving..." : "Save Changes"}
						</button>
						<button
							type="button"
							className="btn btn-secondary"
							onClick={toggleEdit}
						>
							Cancel
						</button>
					</div>
				</form>
			) : (
				<div className="profile-details">
					<div className="profile-detail">
						<span>Email:</span> {currentUser?.email}
					</div>
					<div className="profile-detail">
						<span>Account created:</span>{" "}
						{new Date(currentUser?.createdAt).toLocaleDateString()}
					</div>

					<button type="button" className="btn" onClick={toggleEdit}>
						Edit Profile
					</button>
				</div>
			)}
		</div>
	);
};

export default UserProfile;
