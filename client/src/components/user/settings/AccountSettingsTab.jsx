import { useEffect, useState } from "react";
import { FaEnvelope, FaIdCard, FaUser } from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";

const AccountSettingsTab = ({
	accountData,
	setAccountData,
	onSubmit,
	loading,
}) => {
	const [formData, setFormData] = useState({ ...accountData });
	const [validationErrors, setValidationErrors] = useState({});
	const [hasChanges, setHasChanges] = useState(false);
	const { showToast } = useToast();

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
			showToast("Please fix the validation errors before submitting", "error");
			return;
		}

		const result = await onSubmit(formData);

		if (result.success) {
			setAccountData(formData);
			showToast("Account settings updated!", "success");
		} else {
			showToast("Failed to update account settings.", "error");
		}
	};

	const handleReset = () => {
		setFormData({ ...accountData });
		setValidationErrors({});
		showToast("Changes reset to saved values", "success");
	};

	return (
		<div className="settings-section p-4 bg-white rounded-3 shadow-sm mb-4">
			<div className="settings-section-header d-flex align-items-center mb-4">
				<div className="settings-icon bg-primary bg-opacity-10 p-3 rounded-circle me-3">
					<FaUser className="text-primary" />
				</div>
				<h3 className="settings-section-title m-0 fw-bold">
					Basic Information
				</h3>
			</div>

			<form onSubmit={handleSubmit}>
				{/* Username field */}
				<div className="mb-4">
					<label htmlFor="username" className="form-label fw-medium">
						<FaUser className="me-2 text-primary" />
						Username
					</label>
					<div className="form-text mb-2">
						Your unique identifier for logging in and mentions
					</div>
					<div className="input-group">
						<span className="input-group-text bg-light border-end-0">@</span>
						<input
							type="text"
							className={`form-control border-start-0 ${
								validationErrors.username ? "is-invalid" : ""
							}`}
							id="username"
							name="username"
							value={formData.username}
							onChange={handleChange}
							required
							placeholder="username"
							autoComplete="username"
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
					<label htmlFor="fullname" className="form-label fw-medium">
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
						<div className="invalid-feedback">{validationErrors.fullname}</div>
					)}
				</div>

				{/* Email field */}
				<div className="mb-4">
					<label htmlFor="email" className="form-label fw-medium">
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
						autoComplete="email"
					/>
					{validationErrors.email && (
						<div className="invalid-feedback">{validationErrors.email}</div>
					)}
				</div>

				{/* Action buttons */}
				<div className="d-flex justify-content-end gap-3 mt-4">
					<button
						type="button"
						className="btn btn-outline-secondary px-4"
						onClick={handleReset}
						disabled={loading || !hasChanges}
					>
						Reset
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
	);
};

export default AccountSettingsTab;
