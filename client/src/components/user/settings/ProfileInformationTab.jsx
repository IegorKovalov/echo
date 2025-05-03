import { useEffect, useState } from "react";
import {
	FaBirthdayCake,
	FaBriefcase,
	FaCheck,
	FaGlobe,
	FaInfoCircle,
	FaMapMarkerAlt,
	FaUser,
} from "react-icons/fa";
import { useToast } from "../../../context/ToastContext";
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
	const { showToast } = useToast();
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
			showToast(
				"Failed to load profile information. Please try again later.",
				"error"
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
			showToast("Please fix the validation errors before submitting", "error");
			return;
		}

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			await UserService.updateProfileInfo(formData);
			setSuccess("Profile information updated successfully!");
			showToast("Profile information updated!", "success");
		} catch (err) {
			setError(
				err.response?.data?.message || "Failed to update profile information."
			);
			showToast(error, "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="profile-information-container">
			{/* Success/Error messages */}
			{success && (
				<div
					className="alert alert-success d-flex align-items-center mb-4 rounded-3"
					role="alert"
				>
					<FaCheck className="me-2" />
					<div>{success}</div>
				</div>
			)}

			{error && (
				<div
					className="alert alert-danger d-flex align-items-center mb-4 rounded-3"
					role="alert"
				>
					<FaInfoCircle className="me-2" />
					<div>{error}</div>
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className="settings-section p-4 bg-white rounded-3 shadow-sm mb-4">
					<div className="settings-section-header d-flex align-items-center mb-4">
						<div className="settings-icon bg-primary bg-opacity-10 p-3 rounded-circle me-3">
							<FaUser className="text-primary" />
						</div>
						<h3 className="settings-section-title m-0 fw-bold">About You</h3>
					</div>

					<div className="mb-4">
						<label htmlFor="bio" className="form-label fw-medium">
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
							rows={4}
							maxLength={MAX_BIO_LENGTH}
						></textarea>
						<div className="d-flex justify-content-end mt-2">
							<small
								className={`${
									formData.bio.length >= MAX_BIO_LENGTH * 0.9
										? "text-danger"
										: "text-muted"
								}`}
							>
								{formData.bio.length}/{MAX_BIO_LENGTH} characters
							</small>
						</div>
					</div>
				</div>

				<div className="row">
					<div className="col-md-6">
						<div className="settings-section p-4 bg-white rounded-3 shadow-sm mb-4">
							<div className="settings-section-header d-flex align-items-center mb-4">
								<div className="settings-icon bg-primary bg-opacity-10 p-3 rounded-circle me-3">
									<FaBriefcase className="text-primary" />
								</div>
								<h3 className="settings-section-title m-0 fw-bold">Work</h3>
							</div>

							<div className="mb-3">
								<label htmlFor="occupation" className="form-label fw-medium">
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
									placeholder="Software Engineer, Designer, etc."
								/>
							</div>
						</div>
					</div>

					<div className="col-md-6">
						<div className="settings-section p-4 bg-white rounded-3 shadow-sm mb-4">
							<div className="settings-section-header d-flex align-items-center mb-4">
								<div className="settings-icon bg-primary bg-opacity-10 p-3 rounded-circle me-3">
									<FaMapMarkerAlt className="text-primary" />
								</div>
								<h3 className="settings-section-title m-0 fw-bold">Location</h3>
							</div>

							<div className="mb-3">
								<label htmlFor="location" className="form-label fw-medium">
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
					</div>
				</div>

				<div className="row">
					<div className="col-md-6">
						<div className="settings-section p-4 bg-white rounded-3 shadow-sm mb-4">
							<div className="settings-section-header d-flex align-items-center mb-4">
								<div className="settings-icon bg-primary bg-opacity-10 p-3 rounded-circle me-3">
									<FaGlobe className="text-primary" />
								</div>
								<h3 className="settings-section-title m-0 fw-bold">
									Web Presence
								</h3>
							</div>

							<div className="mb-3">
								<label htmlFor="website" className="form-label fw-medium">
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
					</div>

					<div className="col-md-6">
						<div className="settings-section p-4 bg-white rounded-3 shadow-sm mb-4">
							<div className="settings-section-header d-flex align-items-center mb-4">
								<div className="settings-icon bg-primary bg-opacity-10 p-3 rounded-circle me-3">
									<FaBirthdayCake className="text-primary" />
								</div>
								<h3 className="settings-section-title m-0 fw-bold">Personal</h3>
							</div>

							<div className="mb-3">
								<label htmlFor="birthday" className="form-label fw-medium">
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
					</div>
				</div>

				{/* Action buttons */}
				<div className="d-flex justify-content-end gap-3 mt-4">
					<button
						type="button"
						className="btn btn-outline-secondary px-4"
						onClick={fetchProfileInfo}
						disabled={loading}
					>
						Reset
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
	);
};

export default ProfileInformationTab;
