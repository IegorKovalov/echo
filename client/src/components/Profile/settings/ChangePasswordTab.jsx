"use client";

import { useEffect, useState } from "react";
import {
	FaCheck,
	FaExclamationTriangle,
	FaEye,
	FaEyeSlash,
	FaLock,
	FaShieldAlt,
	FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";

const ChangePasswordTab = ({
	passwordData,
	onSubmit,
	loading,
	error,
	success,
}) => {
	const [formData, setFormData] = useState({ ...passwordData });
	const [validationErrors, setValidationErrors] = useState({});
	const [passwordStrength, setPasswordStrength] = useState(0);
	const [showPassword, setShowPassword] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	// Password requirements
	const requirements = [
		{ id: "length", label: "At least 8 characters", regex: /.{8,}/ },
		{ id: "uppercase", label: "At least one uppercase letter", regex: /[A-Z]/ },
		{ id: "lowercase", label: "At least one lowercase letter", regex: /[a-z]/ },
		{ id: "number", label: "At least one number", regex: /[0-9]/ },
		{
			id: "special",
			label: "At least one special character",
			regex: /[^A-Za-z0-9]/,
		},
	];

	// Check which requirements are met
	const [meetsRequirements, setMeetsRequirements] = useState({
		length: false,
		uppercase: false,
		lowercase: false,
		number: false,
		special: false,
	});

	// Update password strength and requirements whenever password changes
	useEffect(() => {
		if (formData.password) {
			const newMeetsRequirements = {
				length: requirements[0].regex.test(formData.password),
				uppercase: requirements[1].regex.test(formData.password),
				lowercase: requirements[2].regex.test(formData.password),
				number: requirements[3].regex.test(formData.password),
				special: requirements[4].regex.test(formData.password),
			};

			setMeetsRequirements(newMeetsRequirements);

			// Calculate password strength (0-100)
			const metCount =
				Object.values(newMeetsRequirements).filter(Boolean).length;
			setPasswordStrength(metCount * 20);
		} else {
			setPasswordStrength(0);
			setMeetsRequirements({
				length: false,
				uppercase: false,
				lowercase: false,
				number: false,
				special: false,
			});
		}
	}, [formData.password]);

	const validateForm = () => {
		const errors = {};

		// Check if current password is provided
		if (!formData.passwordCurrent) {
			errors.passwordCurrent = "Current password is required";
		}

		// Check if new password meets all requirements
		if (passwordStrength < 60) {
			errors.password = "Password doesn't meet minimum requirements";
		}

		// Check if passwords match
		if (formData.password !== formData.passwordConfirm) {
			errors.passwordConfirm = "Passwords don't match";
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
			setFormData({
				passwordCurrent: "",
				password: "",
				passwordConfirm: "",
			});
			setPasswordStrength(0);
			setMeetsRequirements({
				length: false,
				uppercase: false,
				lowercase: false,
				number: false,
				special: false,
			});
			toast.success("Password updated successfully!");
		} else {
			toast.error("Failed to update password");
		}
	};

	const togglePasswordVisibility = (field) => {
		setShowPassword({
			...showPassword,
			[field]: !showPassword[field],
		});
	};

	// Get color for password strength bar
	const getStrengthColor = () => {
		if (passwordStrength < 40) return "bg-danger";
		if (passwordStrength < 60) return "bg-warning";
		if (passwordStrength < 100) return "bg-info";
		return "bg-success";
	};

	// Get text for password strength
	const getStrengthText = () => {
		if (passwordStrength < 40) return "Weak";
		if (passwordStrength < 60) return "Fair";
		if (passwordStrength < 100) return "Good";
		return "Strong";
	};

	return (
		<div className="container-fluid p-0">
			{/* Header */}
			<div className="bg-white shadow-sm rounded-3 mb-4 p-4">
				<div className="d-flex align-items-center mb-2">
					<FaShieldAlt className="text-primary me-3 fs-3" />
					<h4 className="m-0 fw-bold">Change Password</h4>
				</div>
				<p className="text-muted mb-0">
					Update your password to keep your account secure
				</p>
			</div>
			{/* Main form */}
			<div className="bg-white shadow-sm rounded-3 p-4">
				<form onSubmit={handleSubmit}>
					{/* Current Password field */}
					<div className="mb-4">
						<label htmlFor="currentPassword" className="form-label fw-semibold">
							<FaLock className="me-2 text-primary" />
							Current Password
						</label>
						<div className="form-text mb-2">
							Enter your current password to verify your identity
						</div>
						<div className="input-group">
							<input
								type={showPassword.current ? "text" : "password"}
								className={`form-control ${
									validationErrors.passwordCurrent ? "is-invalid" : ""
								}`}
								id="currentPassword"
								name="passwordCurrent"
								value={formData.passwordCurrent}
								onChange={handleChange}
								required
								placeholder="Enter your current password"
							/>
							<button
								className="btn btn-outline-secondary"
								type="button"
								onClick={() => togglePasswordVisibility("current")}
							>
								{showPassword.current ? <FaEyeSlash /> : <FaEye />}
							</button>
							{validationErrors.passwordCurrent && (
								<div className="invalid-feedback">
									{validationErrors.passwordCurrent}
								</div>
							)}
						</div>
					</div>

					{/* New Password field */}
					<div className="mb-4">
						<label htmlFor="newPassword" className="form-label fw-semibold">
							<FaLock className="me-2 text-primary" />
							New Password
						</label>
						<div className="form-text mb-2">
							Create a strong, unique password
						</div>
						<div className="input-group">
							<input
								type={showPassword.new ? "text" : "password"}
								className={`form-control ${
									validationErrors.password ? "is-invalid" : ""
								}`}
								id="newPassword"
								name="password"
								value={formData.password}
								onChange={handleChange}
								required
								placeholder="Enter your new password"
							/>
							<button
								className="btn btn-outline-secondary"
								type="button"
								onClick={() => togglePasswordVisibility("new")}
							>
								{showPassword.new ? <FaEyeSlash /> : <FaEye />}
							</button>
							{validationErrors.password && (
								<div className="invalid-feedback">
									{validationErrors.password}
								</div>
							)}
						</div>

						{/* Password strength indicator */}
						{formData.password && (
							<div className="mt-3">
								<div className="d-flex justify-content-between align-items-center mb-1">
									<small>Password Strength:</small>
									<small
										className={`fw-bold ${getStrengthColor().replace(
											"bg-",
											"text-"
										)}`}
									>
										{getStrengthText()}
									</small>
								</div>
								<div className="progress" style={{ height: "8px" }}>
									<div
										className={`progress-bar ${getStrengthColor()}`}
										role="progressbar"
										style={{ width: `${passwordStrength}%` }}
										aria-valuenow={passwordStrength}
										aria-valuemin="0"
										aria-valuemax="100"
									></div>
								</div>

								{/* Password requirements */}
								<div className="mt-3">
									<small className="text-muted d-block mb-2">
										Password requirements:
									</small>
									<div className="row">
										{requirements.map((req) => (
											<div key={req.id} className="col-md-6 mb-1">
												<small
													className={
														meetsRequirements[req.id]
															? "text-success"
															: "text-muted"
													}
												>
													{meetsRequirements[req.id] ? (
														<FaCheck className="me-1" />
													) : (
														<FaTimes className="me-1" />
													)}
													{req.label}
												</small>
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Confirm New Password field */}
					<div className="mb-4">
						<label htmlFor="confirmPassword" className="form-label fw-semibold">
							<FaLock className="me-2 text-primary" />
							Confirm New Password
						</label>
						<div className="form-text mb-2">
							Re-enter your new password to confirm
						</div>
						<div className="input-group">
							<input
								type={showPassword.confirm ? "text" : "password"}
								className={`form-control ${
									validationErrors.passwordConfirm ? "is-invalid" : ""
								}`}
								id="confirmPassword"
								name="passwordConfirm"
								value={formData.passwordConfirm}
								onChange={handleChange}
								required
								placeholder="Confirm your new password"
							/>
							<button
								className="btn btn-outline-secondary"
								type="button"
								onClick={() => togglePasswordVisibility("confirm")}
							>
								{showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
							</button>
							{validationErrors.passwordConfirm && (
								<div className="invalid-feedback">
									{validationErrors.passwordConfirm}
								</div>
							)}
						</div>

						{/* Password match indicator */}
						{formData.password && formData.passwordConfirm && (
							<div className="mt-2">
								{formData.password === formData.passwordConfirm ? (
									<small className="text-success">
										<FaCheck className="me-1" /> Passwords match
									</small>
								) : (
									<small className="text-danger">
										<FaTimes className="me-1" /> Passwords don't match
									</small>
								)}
							</div>
						)}
					</div>

					{/* Action buttons */}
					<div className="d-flex justify-content-between mt-4 pt-3 border-top">
						<button
							type="button"
							className="btn btn-outline-secondary"
							onClick={() => {
								setFormData({
									passwordCurrent: "",
									password: "",
									passwordConfirm: "",
								});
								setValidationErrors({});
							}}
							disabled={loading}
						>
							Clear Form
						</button>
						<button
							type="submit"
							className="btn btn-primary px-4"
							disabled={
								loading ||
								passwordStrength < 60 ||
								formData.password !== formData.passwordConfirm
							}
						>
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
					</div>
				</form>
			</div>
		</div>
	);
};

export default ChangePasswordTab;
