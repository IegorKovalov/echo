import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

const AccountSettingsTab = ({
	accountData,
	setAccountData,
	onSubmit,
	loading,
	error,
	success,
}) => {
	const [formData, setFormData] = useState({ ...accountData });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const result = await onSubmit(formData);

		if (result.success) {
			setAccountData(formData);
			toast.success("Account settings updated!");
		} else {
			toast.error("Failed to update account settings.");
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
				{/* Username field */}
				<Form.Group className="mb-3 form-group">
					<Form.Label>Username</Form.Label>
					<Form.Control
						type="text"
						name="username"
						value={formData.username}
						onChange={handleChange}
						required
						placeholder="Enter your username"
					/>
				</Form.Group>

				{/* Fullname field */}
				<Form.Group className="mb-3 form-group">
					<Form.Label>Full Name</Form.Label>
					<Form.Control
						type="text"
						name="fullname"
						value={formData.fullname}
						onChange={handleChange}
						required
						placeholder="Enter your full name"
					/>
				</Form.Group>

				{/* Email field */}
				<Form.Group className="mb-3 form-group">
					<Form.Label>Email</Form.Label>
					<Form.Control
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
						placeholder="Enter your email address"
					/>
				</Form.Group>

				{/* Submit button */}
				<Button type="submit" className="btn-primary" disabled={loading}>
					{loading ? "Saving..." : "Save Changes"}
				</Button>
			</Form>
		</>
	);
};

export default AccountSettingsTab;
