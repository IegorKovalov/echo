import { useState } from "react";
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
			{error && <div>{error}</div>}
			{success && <div>{success}</div>}

			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="currentPassword">Current Password</label>
					<input
						type="password"
						id="currentPassword"
						name="currentPassword"
						value={formData.currentPassword}
						onChange={handleChange}
						required
						placeholder="Enter your current password"
					/>
				</div>

				<div>
					<label htmlFor="newPassword">New Password</label>
					<input
						type="password"
						id="newPassword"
						name="newPassword"
						value={formData.newPassword}
						onChange={handleChange}
						required
						placeholder="Enter your new password"
					/>
				</div>

				<div>
					<label htmlFor="confirmPassword">Confirm New Password</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleChange}
						required
						placeholder="Confirm your new password"
					/>
				</div>

				<button type="submit" disabled={loading}>
					{loading ? "Updating..." : "Change Password"}
				</button>
			</form>
		</>
	);
};

export default ChangePasswordTab;
