import { useState } from "react";
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
		<div className="settings-form-container">
			{error && (
				<div className="alert alert-danger settings-alert">{error}</div>
			)}
			{success && (
				<div className="alert alert-success settings-alert">{success}</div>
			)}

			<form onSubmit={handleSubmit}>
				{/* Username field */}
				<div className="mb-3">
					<label htmlFor="username" className="form-label">
						Username
					</label>
					<input
						type="text"
						className="form-control"
						id="username"
						name="username"
						value={formData.username}
						onChange={handleChange}
						required
						placeholder="Enter your username"
					/>
				</div>

				{/* Fullname field */}
				<div className="mb-3">
					<label htmlFor="fullname" className="form-label">
						Full Name
					</label>
					<input
						type="text"
						className="form-control"
						id="fullname"
						name="fullname"
						value={formData.fullname}
						onChange={handleChange}
						required
						placeholder="Enter your full name"
					/>
				</div>

				{/* Email field */}
				<div className="mb-4">
					<label htmlFor="email" className="form-label">
						Email
					</label>
					<input
						type="email"
						className="form-control"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
						placeholder="Enter your email address"
					/>
				</div>

				{/* Submit button */}
				<button type="submit" className="btn btn-primary" disabled={loading}>
					{loading ? (
						<>
							<span
								className="spinner-border spinner-border-sm me-2"
								role="status"
								aria-hidden="true"
							></span>
							Saving...
						</>
					) : (
						"Save Changes"
					)}
				</button>
			</form>
		</div>
	);
};

export default AccountSettingsTab;
