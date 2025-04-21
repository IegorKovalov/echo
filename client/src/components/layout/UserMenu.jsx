import React from "react";
import { Dropdown } from "react-bootstrap";
import { FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import UserAvatar from "../Profile/shared/UserAvatar";

const UserMenu = ({ fullName, onLogout }) => (
	<Dropdown align="end">
		<Dropdown.Toggle as="div" className="navbar-user-toggle">
			<div className="d-flex align-items-center">
				<div className="navbar-avatar">
					<UserAvatar fullName={fullName} variant="navbar" />
				</div>
				<span className="navbar-username">{fullName}</span>
			</div>
		</Dropdown.Toggle>

		<Dropdown.Menu>
			<Dropdown.Item
				as={Link}
				to="/profile"
				className="d-flex align-items-center"
			>
				<FaUser className="me-2" style={{ color: "#8b5cf6" }} />
				My Profile
			</Dropdown.Item>
			<Dropdown.Item
				as={Link}
				to="/settings"
				className="d-flex align-items-center"
			>
				<FaCog className="me-2" style={{ color: "#ec4899" }} />
				Settings
			</Dropdown.Item>
			<Dropdown.Divider />
			<Dropdown.Item
				onClick={onLogout}
				className="d-flex align-items-center"
				style={{ color: "#f97316" }}
			>
				<FaSignOutAlt className="me-2" />
				Log Out
			</Dropdown.Item>
		</Dropdown.Menu>
	</Dropdown>
);

export default UserMenu;
