import { useEffect, useState } from "react";
import {
	FaCheck,
	FaEnvelope,
	FaIdCard,
	FaInfoCircle,
	FaShieldAlt,
	FaTimes,
	FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./usersettings.css";
const AccountSettingsTab = ({
	accountData,
	setAccountData,
	onSubmit,
	loading,
	error,
	success,
}) => {
	const [formData, setFormData] = useState({ ...accountData });
	const [validationErrors, setValidationErrors] = useState({});
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		const isDifferent =
			formData.username !== accountData.username ||
			formData.fullname !== accountData.fullname ||
			formData.email !== accountData.email;

		setHasChanges(isDifferent);
	}, [formData, accountData]);

	const validateForm = () => {
		const errors = {};

		// Username validation
		if (formData.username.length < 3) {
			errors.username = "Username must be at least 3 characters";
		} else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
			errors.username =
				"Username can only contain letters, numbers, and underscores";
		}

		// Email validation
		if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
			errors.email = "Please enter a valid email address";
		}

		// Fullname validation
		if (formData.fullname.length < 2) {
			errors.fullname = "Full name must be at least 2 characters";
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });

		// Clear validation error for this field when user types
		if (validationErrors[name]) {
			setValidationErrors({
				...validationErrors,
				[name]: null,
			});
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error("Please fix the validation errors before submitting");
			return;
		}

		const result = await onSubmit(formData);

		if (result.success) {
			setAccountData(formData);
			toast.success("Account settings updated!");
		} else {
			toast.error("Failed to update account settings.");
		}
	};

	const handleReset = () => {
		setFormData({ ...accountData });
		setValidationErrors({});
		toast.info("Changes reset to saved values");
	};

	return (
		<div className="container-fluid p-0">
			{/* Header */}
			<div className="bg-white shadow-sm rounded-3 mb-4 p-4">
				<div className="d-flex align-items-center mb-2">
					<FaShieldAlt className="text-primary me-3 fs-3" />
					<h4 className="m-0 fw-bold">Account Settings</h4>
				</div>
				<p className="text-muted mb-0">Manage your basic account information</p>
			</div>

			{error && (
				<div
					className="alert alert-danger d-flex align-items-center mb-4"
					role="alert"
				>
					<FaTimes className="me-2" />
					<div>{error}</div>
				</div>
			)}

			{/* Main form */}
			<div className="bg-white shadow-sm rounded-3 p-4">
				<form onSubmit={handleSubmit}>
					{/* Username field */}
					<div className="mb-4">
						<label htmlFor="username" className="form-label fw-semibold">
							<FaUser className="me-2 text-primary" />
							Username
						</label>
						<div className="form-text mb-2">
							Your unique username for logging in and mentions
						</div>
						<div className="input-group">
							<span className="input-group-text bg-light">@</span>
							<input
								type="text"
								className={`form-control ${
									validationErrors.username ? "is-invalid" : ""
								}`}
								id="username"
								name="username"
								value={formData.username}
								onChange={handleChange}
								required
								placeholder="username"
							/>
							{validationErrors.username && (
								<div className="invalid-feedback">
									{validationErrors.username}
								</div>
							)}
						</div>
					</div>

					{/* Fullname field */}
					<div className="mb-4">
						<label htmlFor="fullname" className="form-label fw-semibold">
							<FaIdCard className="me-2 text-primary" />
							Full Name
						</label>
						<div className="form-text mb-2">
							Your name as it will appear to other users
						</div>
						<input
							type="text"
							className={`form-control ${
								validationErrors.fullname ? "is-invalid" : ""
							}`}
							id="fullname"
							name="fullname"
							value={formData.fullname}
							onChange={handleChange}
							required
							placeholder="John Doe"
						/>
						{validationErrors.fullname && (
							<div className="invalid-feedback">
								{validationErrors.fullname}
							</div>
						)}
					</div>

					{/* Email field */}
					<div className="mb-4">
						<label htmlFor="email" className="form-label fw-semibold">
							<FaEnvelope className="me-2 text-primary" />
							Email Address
						</label>
						<div className="form-text mb-2">
							Your email for notifications and account recovery
						</div>
						<input
							type="email"
							className={`form-control ${
								validationErrors.email ? "is-invalid" : ""
							}`}
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							placeholder="your.email@example.com"
						/>
						{validationErrors.email && (
							<div className="invalid-feedback">{validationErrors.email}</div>
						)}
					</div>

					{/* Action buttons */}
					<div className="d-flex justify-content-between mt-4 pt-3 border-top">
						<button
							type="button"
							className="btn btn-primary px-4"
							onClick={handleReset}
							disabled={loading || !hasChanges}
						>
							Reset Changes
						</button>
						<button
							type="submit"
							className="btn btn-primary px-4"
							disabled={loading || !hasChanges}
						>
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
					</div>
				</form>
			</div>
		</div>
	);
};

export default AccountSettingsTab;
