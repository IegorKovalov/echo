import React from "react";
import { Card, Col, Row } from "react-bootstrap";
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
		<Card className="profile-header-card mb-4">
			<Card.Body>
				<div className="profile-header-content">
					<div className="profile-left-section">
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
							<h2 className="profile-name mb-1">{user?.fullName}</h2>
							<h6 className="profile-username text-secondary mb-0">@{user?.username}</h6>
						</div>
					</div>
					<div className="profile-right-section">
						{user?.bio && <p className="profile-bio mb-0">{user?.bio}</p>}
					</div>
				</div>
				<div className="profile-header-bottom">
					<div className="profile-details">
						{user?.location && (
							<div className="profile-detail-item">
								<FaMapMarkerAlt className="profile-detail-icon" />
								<span>{user.location}</span>
							</div>
						)}
						{user?.website && (
							<div className="profile-detail-item">
								<FaLink className="profile-detail-icon" />
								<a
									href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
									target="_blank"
									rel="noopener noreferrer"
									className="profile-website-link"
								>
									{user.website.replace(/^https?:\/\//, "")}
								</a>
							</div>
						)}
						{user?.occupation && (
							<div className="profile-detail-item">
								<FaBriefcase className="profile-detail-icon" />
								<span>{user.occupation}</span>
							</div>
						)}
						{user?.birthday && (
							<div className="profile-detail-item">
								<FaBirthdayCake className="profile-detail-icon" />
								<span>Born {formatDate(user.birthday)}</span>
							</div>
						)}
					</div>
					{isCurrentUser && (
						<Link
							to="/settings#profile"
							className="btn btn-outline-primary profile-edit-button"
						>
							Edit Profile
						</Link>
					)}
				</div>
			</Card.Body>
		</Card>
	);
};

export default ProfileHeader;
