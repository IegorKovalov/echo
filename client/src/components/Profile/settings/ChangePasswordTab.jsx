import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

const ChangePasswordTab = ({
	passwordData,
	setPasswordData,
	onSubmit,
	loading,
	error,
	success,
}) => {
	const [formData, setFormData] = useState({ ...passwordData });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.newPassword !== formData.confirmPassword) {
			toast.error("New passwords don't match");
			return;
		}

		const result = await onSubmit(formData);

		if (result.success) {
			setFormData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			toast.success("Password updated successfully!");
		} else {
			toast.error("Failed to update password");
		}
	};

	return (
		<>
			{error && (
				<Alert variant="danger" className="settings-alert">
					{error}
				</Alert>
			)}
			{success && (
				<Alert variant="success" className="settings-alert">
					{success}
				</Alert>
			)}

			<Form onSubmit={handleSubmit}>
				<Form.Group className="mb-3 form-group">
					<Form.Label>Current Password</Form.Label>
					<Form.Control
						type="password"
						name="currentPassword"
						value={formData.currentPassword}
						onChange={handleChange}
						required
						placeholder="Enter your current password"
					/>
				</Form.Group>

				<Form.Group className="mb-3 form-group">
					<Form.Label>New Password</Form.Label>
					<Form.Control
						type="password"
						name="newPassword"
						value={formData.newPassword}
						onChange={handleChange}
						required
						placeholder="Enter your new password"
					/>
				</Form.Group>

				<Form.Group className="mb-3 form-group">
					<Form.Label>Confirm New Password</Form.Label>
					<Form.Control
						type="password"
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleChange}
						required
						placeholder="Confirm your new password"
					/>
				</Form.Group>

				<Button type="submit" className="btn-primary" disabled={loading}>
					{loading ? "Updating..." : "Change Password"}
				</Button>
			</Form>
		</>
	);
};

export default ChangePasswordTab;
