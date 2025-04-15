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
		<>
			{error && <div>{error}</div>}
			{success && <div>{success}</div>}

			<form onSubmit={handleSubmit}>
				{/* Username field */}
				<div>
					<label htmlFor="username">Username</label>
					<input
						type="text"
						id="username"
						name="username"
						value={formData.username}
						onChange={handleChange}
						required
						placeholder="Enter your username"
					/>
				</div>

				{/* Fullname field */}
				<div>
					<label htmlFor="fullname">Full Name</label>
					<input
						type="text"
						id="fullname"
						name="fullname"
						value={formData.fullname}
						onChange={handleChange}
						required
						placeholder="Enter your full name"
					/>
				</div>

				{/* Email field */}
				<div>
					<label htmlFor="email">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
						placeholder="Enter your email address"
					/>
				</div>

				{/* Submit button */}
				<button type="submit" disabled={loading}>
					{loading ? "Saving..." : "Save Changes"}
				</button>
			</form>
		</>
	);
};

export default AccountSettingsTab;
