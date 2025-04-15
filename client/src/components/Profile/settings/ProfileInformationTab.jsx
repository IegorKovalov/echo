"use client";

import { useEffect, useState } from "react";
import {
	FaBirthdayCake,
	FaBriefcase,
	FaCheck,
	FaChevronRight,
	FaGlobe,
	FaInfoCircle,
	FaMapMarkerAlt,
	FaTimes,
	FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";
import UserService from "../../../services/user.service";

const ProfileInformationTab = () => {
	const [formData, setFormData] = useState({
		bio: "",
		location: "",
		website: "",
		birthday: "",
		occupation: "",
	});

	const [loading, setLoading] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	const [activeSection, setActiveSection] = useState("bio");

	const MAX_BIO_LENGTH = 160;

	useEffect(() => {
		fetchProfileInfo();
	}, []);

	const fetchProfileInfo = async () => {
		try {
			setLoading(true);
			const response = await UserService.getProfile();

			if (!response || !response.data) {
				throw new Error("Invalid response from server");
			}

			const userData = response.data.data || response.data;
			if (!userData) {
				throw new Error("No user data received");
			}

			const user = userData.user || userData;
			if (!user) {
				throw new Error("User information not found");
			}

			setFormData({
				bio: user.bio || "",
				location: user.location || "",
				website: user.website || "",
				birthday: user.birthday
					? new Date(user.birthday).toISOString().split("T")[0]
					: "",
				occupation: user.occupation || "",
			});
		} catch (err) {
			console.error("Error fetching profile data:", err);
			toast.error(
				"Failed to load profile information. Please try again later."
			);
		} finally {
			setLoading(false);
		}
	};

	const validateForm = () => {
		const errors = {};

		if (
			formData.website &&
			!formData.website.match(
				/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
			)
		) {
			errors.website = "Please enter a valid website URL";
		}

		if (formData.birthday) {
			const birthday = new Date(formData.birthday);
			const today = new Date();
			const age = today.getFullYear() - birthday.getFullYear();
			if (age < 13) {
				errors.birthday = "You must be at least 13 years old";
			}
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });

		// Clear validation errors for this field when user starts typing
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

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			await UserService.updateProfileInfo(formData);
			setSuccess("Profile information updated successfully!");
			toast.success("Profile information updated!");
		} catch (err) {
			setError(
				err.response?.data?.message || "Failed to update profile information."
			);
			toast.error("Failed to update profile information.");
		} finally {
			setLoading(false);
		}
	};

	const getCompletionPercentage = () => {
		let completed = 0;
		let total = 5; // Total number of fields

		if (formData.bio) completed++;
		if (formData.location) completed++;
		if (formData.website) completed++;
		if (formData.birthday) completed++;
		if (formData.occupation) completed++;

		return Math.round((completed / total) * 100);
	};

	const completionPercentage = getCompletionPercentage();

	return (
		<div className="container-fluid p-0">
			{/* Header with progress */}
			<div className="bg-white shadow-sm rounded-3 mb-4 p-4">
				<div className="d-flex justify-content-between align-items-center mb-3">
					<h4 className="m-0 fw-bold">Profile Information</h4>
					<span className="badge bg-primary rounded-pill px-3 py-2">
						{completionPercentage}% Complete
					</span>
				</div>

				<div className="progress" style={{ height: "8px" }}>
					<div
						className="progress-bar bg-primary"
						role="progressbar"
						style={{ width: `${completionPercentage}%` }}
						aria-valuenow={completionPercentage}
						aria-valuemin="0"
						aria-valuemax="100"
					></div>
				</div>

				{completionPercentage < 100 && (
					<p className="text-muted mt-2 mb-0">
						<FaInfoCircle className="me-2" />
						Complete your profile to help others connect with you
					</p>
				)}
			</div>

			{/* Success/Error messages */}
			{success && (
				<div
					className="alert alert-success d-flex align-items-center mb-4"
					role="alert"
				>
					<FaCheck className="me-2" />
					<div>{success}</div>
				</div>
			)}

			{error && (
				<div
					className="alert alert-danger d-flex align-items-center mb-4"
					role="alert"
				>
					<FaTimes className="me-2" />
					<div>{error}</div>
				</div>
			)}

			<div className="row g-4">
				{/* Left sidebar navigation */}
				<div className="col-md-3">
					<div className="list-group shadow-sm rounded-3">
						<button
							type="button"
							className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
								activeSection === "bio" ? "active" : ""
							}`}
							onClick={() => setActiveSection("bio")}
						>
							<div>
								<FaUser className="me-3" />
								About You
							</div>
							<FaChevronRight
								className={
									activeSection === "bio" ? "text-white" : "text-muted"
								}
							/>
						</button>

						<button
							type="button"
							className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
								activeSection === "work" ? "active" : ""
							}`}
							onClick={() => setActiveSection("work")}
						>
							<div>
								<FaBriefcase className="me-3" />
								Work
							</div>
							<FaChevronRight
								className={
									activeSection === "work" ? "text-white" : "text-muted"
								}
							/>
						</button>

						<button
							type="button"
							className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
								activeSection === "location" ? "active" : ""
							}`}
							onClick={() => setActiveSection("location")}
						>
							<div>
								<FaMapMarkerAlt className="me-3" />
								Location
							</div>
							<FaChevronRight
								className={
									activeSection === "location" ? "text-white" : "text-muted"
								}
							/>
						</button>

						<button
							type="button"
							className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
								activeSection === "web" ? "active" : ""
							}`}
							onClick={() => setActiveSection("web")}
						>
							<div>
								<FaGlobe className="me-3" />
								Web Presence
							</div>
							<FaChevronRight
								className={
									activeSection === "web" ? "text-white" : "text-muted"
								}
							/>
						</button>

						<button
							type="button"
							className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
								activeSection === "personal" ? "active" : ""
							}`}
							onClick={() => setActiveSection("personal")}
						>
							<div>
								<FaBirthdayCake className="me-3" />
								Personal
							</div>
							<FaChevronRight
								className={
									activeSection === "personal" ? "text-white" : "text-muted"
								}
							/>
						</button>
					</div>
				</div>

				{/* Main content area */}
				<div className="col-md-9">
					<div className="bg-white shadow-sm rounded-3 p-4">
						<form onSubmit={handleSubmit}>
							{/* Bio Section */}
							<div className={activeSection === "bio" ? "d-block" : "d-none"}>
								<h5 className="border-bottom pb-3 mb-4">About You</h5>
								<div className="mb-4">
									<label htmlFor="bio" className="form-label fw-semibold">
										Bio
									</label>
									<div className="form-text mb-2">
										Tell others about yourself. What are you passionate about?
									</div>
									<textarea
										className={`form-control ${
											validationErrors.bio ? "is-invalid" : ""
										}`}
										id="bio"
										name="bio"
										value={formData.bio}
										onChange={handleChange}
										placeholder="I'm a creative professional who loves..."
										rows={5}
										maxLength={MAX_BIO_LENGTH}
									></textarea>
									<div className="d-flex justify-content-between mt-2">
										<small
											className={`${
												formData.bio.length >= MAX_BIO_LENGTH * 0.9
													? "text-danger"
													: "text-muted"
											}`}
										>
											{formData.bio.length}/{MAX_BIO_LENGTH} characters
										</small>
										{validationErrors.bio && (
											<small className="text-danger">
												{validationErrors.bio}
											</small>
										)}
									</div>
								</div>
							</div>

							{/* Work Section */}
							<div className={activeSection === "work" ? "d-block" : "d-none"}>
								<h5 className="border-bottom pb-3 mb-4">Work Information</h5>
								<div className="mb-4">
									<label
										htmlFor="occupation"
										className="form-label fw-semibold"
									>
										Occupation
									</label>
									<div className="form-text mb-2">
										What do you do professionally?
									</div>
									<input
										type="text"
										className="form-control"
										id="occupation"
										name="occupation"
										value={formData.occupation}
										onChange={handleChange}
										placeholder="Software Engineer, Designer, Marketing Specialist..."
									/>
								</div>
							</div>

							{/* Location Section */}
							<div
								className={activeSection === "location" ? "d-block" : "d-none"}
							>
								<h5 className="border-bottom pb-3 mb-4">
									Location Information
								</h5>
								<div className="mb-4">
									<label htmlFor="location" className="form-label fw-semibold">
										Location
									</label>
									<div className="form-text mb-2">Where are you based?</div>
									<input
										type="text"
										className="form-control"
										id="location"
										name="location"
										value={formData.location}
										onChange={handleChange}
										placeholder="City, Country"
									/>
								</div>
							</div>

							{/* Web Presence Section */}
							<div className={activeSection === "web" ? "d-block" : "d-none"}>
								<h5 className="border-bottom pb-3 mb-4">Web Presence</h5>
								<div className="mb-4">
									<label htmlFor="website" className="form-label fw-semibold">
										Website
									</label>
									<div className="form-text mb-2">
										Your personal website or portfolio
									</div>
									<input
										type="url"
										className={`form-control ${
											validationErrors.website ? "is-invalid" : ""
										}`}
										id="website"
										name="website"
										value={formData.website}
										onChange={handleChange}
										placeholder="https://yourwebsite.com"
									/>
									{validationErrors.website && (
										<div className="invalid-feedback">
											{validationErrors.website}
										</div>
									)}
								</div>
							</div>

							{/* Personal Section */}
							<div
								className={activeSection === "personal" ? "d-block" : "d-none"}
							>
								<h5 className="border-bottom pb-3 mb-4">
									Personal Information
								</h5>
								<div className="mb-4">
									<label htmlFor="birthday" className="form-label fw-semibold">
										Birthday
									</label>
									<div className="form-text mb-2">When were you born?</div>
									<input
										type="date"
										className={`form-control ${
											validationErrors.birthday ? "is-invalid" : ""
										}`}
										id="birthday"
										name="birthday"
										value={formData.birthday}
										onChange={handleChange}
									/>
									{validationErrors.birthday && (
										<div className="invalid-feedback">
											{validationErrors.birthday}
										</div>
									)}
								</div>
							</div>

							{/* Action buttons - visible in all sections */}
							<div className="d-flex justify-content-between mt-4 pt-3 border-top">
								<button
									type="button"
									className="btn btn-primary px-4"
									onClick={fetchProfileInfo}
									disabled={loading}
								>
									Reset Changes
								</button>
								<button
									type="submit"
									className="btn btn-primary px-4"
									disabled={loading}
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
			</div>
		</div>
	);
};

export default ProfileInformationTab;
