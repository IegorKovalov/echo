import React from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import UserAvatar from "../Profile/UserAvatar";

const UserMenu = ({ fullName, onLogout }) => (
	<Dropdown align="end" className="me-2">
		<Dropdown.Toggle as="div" className="navbar-user-toggle">
			<div className="d-flex align-items-center">
				<UserAvatar fullName={fullName} className="me-2" />
				<span className="navbar-username">{fullName}</span>
			</div>
		</Dropdown.Toggle>

		<Dropdown.Menu>
			<Dropdown.Item as={Link} to="/profile">
				My Profile
			</Dropdown.Item>
			<Dropdown.Item as={Link} to="/settings">
				Settings
			</Dropdown.Item>
			<Dropdown.Divider />
			<Dropdown.Item onClick={onLogout}>Log Out</Dropdown.Item>
		</Dropdown.Menu>
	</Dropdown>
);

export default UserMenu;
