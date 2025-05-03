import React from "react";
import {
	FaBirthdayCake,
	FaBriefcase,
	FaLink,
	FaMapMarkerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import UserAvatar from "../../common/UserAvatar";

const ProfileHeader = ({ user, isCurrentUser }) => {
	const formatDate = (dateString) => {
		if (!dateString) return null;
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="profile-header mb-4">
			<div className="profile-header-content p-4">
				<div className="profile-top d-flex flex-wrap gap-4 align-items-center mb-4">
					<div className="profile-avatar-container">
						{isCurrentUser ? (
							<Link to="/settings" className="profile-avatar-link">
								<UserAvatar
									fullName={user?.fullName}
									src={user?.profilePicture}
									variant="settings"
								/>
								<div className="profile-avatar-edit-overlay">
									<small>Edit</small>
								</div>
							</Link>
						) : (
							<UserAvatar
								fullName={user?.fullName}
								src={user?.profilePicture}
								variant="settings"
							/>
						)}
					</div>
					<div className="profile-main-info">
						<h2 className="profile-name mb-1 fw-bold">{user?.fullName}</h2>
						<h6 className="profile-username text-secondary mb-3">
							@{user?.username}
						</h6>

						{isCurrentUser && (
							<Link
								to="/settings#profile"
								className="btn btn-outline-primary btn-sm px-4 rounded-pill"
							>
								Edit Profile
							</Link>
						)}
					</div>
				</div>

				{user?.bio && (
					<div className="profile-bio mb-4">
						<p className="mb-0">{user?.bio}</p>
					</div>
				)}

				<div className="profile-details d-flex flex-wrap gap-3">
					{user?.location && (
						<div className="profile-detail-item d-flex align-items-center">
							<FaMapMarkerAlt className="text-primary me-2" />
							<span>{user.location}</span>
						</div>
					)}
					{user?.website && (
						<div className="profile-detail-item d-flex align-items-center">
							<FaLink className="text-primary me-2" />
							<a
								href={
									user.website.startsWith("http")
										? user.website
										: `https://${user.website}`
								}
								target="_blank"
								rel="noopener noreferrer"
								className="profile-website-link"
							>
								{user.website.replace(/^https?:\/\//, "")}
							</a>
						</div>
					)}
					{user?.occupation && (
						<div className="profile-detail-item d-flex align-items-center">
							<FaBriefcase className="text-primary me-2" />
							<span>{user.occupation}</span>
						</div>
					)}
					{user?.birthday && (
						<div className="profile-detail-item d-flex align-items-center">
							<FaBirthdayCake className="text-primary me-2" />
							<span>Born {formatDate(user.birthday)}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProfileHeader;
