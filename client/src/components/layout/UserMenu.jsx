import React from "react";
import { Dropdown } from "react-bootstrap";
import { FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import UserAvatar from "../common/UserAvatar";

const UserMenu = ({ fullName, onLogout }) => (
	<Dropdown align="end">
		<Dropdown.Toggle as="div" className="navbar-user-toggle">
			<div className="d-flex align-items-center py-1 px-2 rounded-pill user-dropdown-button">
				<div className="navbar-avatar me-2">
					<UserAvatar fullName={fullName} variant="navbar" />
				</div>
				<span className="navbar-username fw-medium">{fullName}</span>
			</div>
		</Dropdown.Toggle>

		<Dropdown.Menu className="user-dropdown-menu shadow-sm border-0 py-0 overflow-hidden">
			<div className="user-dropdown-header bg-light p-3">
				<div className="d-flex align-items-center">
					<UserAvatar fullName={fullName} variant="navbar" />
					<div className="ms-2">
						<div className="fw-bold">{fullName}</div>
						<small className="text-secondary">View your profile</small>
					</div>
				</div>
			</div>
			<div className="user-dropdown-body">
				<Dropdown.Item
					as={Link}
					to="/profile"
					className="dropdown-menu-item py-3"
				>
					<FaUser className="me-3 text-primary" />
					My Profile
				</Dropdown.Item>
				<Dropdown.Item
					as={Link}
					to="/settings"
					className="dropdown-menu-item py-3"
				>
					<FaCog className="me-3 text-primary" />
					Settings
				</Dropdown.Item>
				<Dropdown.Divider className="my-0" />
				<Dropdown.Item
					onClick={onLogout}
					className="dropdown-menu-item py-3 text-danger"
				>
					<FaSignOutAlt className="me-3" />
					Log Out
				</Dropdown.Item>
			</div>
		</Dropdown.Menu>
	</Dropdown>
);

export default UserMenu;
