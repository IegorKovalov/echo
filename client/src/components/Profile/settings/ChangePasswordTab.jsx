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

		const result = await onSubmit(formData);

		if (result.success) {
			setFormData({
				passwordCurrent: "",
				password: "",
				passwordConfirm: "",
			});
			toast.success("Password updated successfully!");
		} else {
			toast.error("Failed to update password");
		}
	};

	return (
		<div className="settings-form-container">
			{error && (
				<div className="alert alert-danger settings-alert">{error}</div>
			)}
			{success && (
				<div className="alert alert-success settings-alert">{success}</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label htmlFor="currentPassword" className="form-label">
						Current Password
					</label>
					<input
						type="password"
						className="form-control"
						id="currentPassword"
						name="passwordCurrent"
						value={formData.passwordCurrent}
						onChange={handleChange}
						required
						placeholder="Enter your current password"
					/>
				</div>

				<div className="mb-3">
					<label htmlFor="newPassword" className="form-label">
						New Password
					</label>
					<input
						type="password"
						className="form-control"
						id="newPassword"
						name="password"
						value={formData.password}
						onChange={handleChange}
						required
						placeholder="Enter your new password"
					/>
				</div>

				<div className="mb-4">
					<label htmlFor="confirmPassword" className="form-label">
						Confirm New Password
					</label>
					<input
						type="password"
						className="form-control"
						id="confirmPassword"
						name="passwordConfirm"
						value={formData.passwordConfirm}
						onChange={handleChange}
						required
						placeholder="Confirm your new password"
					/>
				</div>

				<button type="submit" className="btn btn-primary" disabled={loading}>
					{loading ? (
						<>
							<span
								className="spinner-border spinner-border-sm me-2"
								role="status"
								aria-hidden="true"
							></span>
							Updating...
						</>
					) : (
						"Change Password"
					)}
				</button>
			</form>
		</div>
	);
};

export default ChangePasswordTab;
