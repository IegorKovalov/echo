import { useEffect, useState } from "react";
import {
	FaBirthdayCake,
	FaBriefcase,
	FaGlobe,
	FaMapMarkerAlt,
	FaUserEdit,
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
	const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});

	const MAX_BIO_LENGTH = 160;

	useEffect(() => {
		const fetchProfileInfo = async () => {
			try {
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
			}
		};

		fetchProfileInfo();
	}, []);

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
		validateForm();
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

	return (
		<div className="settings-form-container">
			<div className="alert alert-info mb-4">
				<FaUserEdit className="me-2" />
				Add more information to your profile to help others connect with you.
			</div>

			<form onSubmit={handleSubmit}>
				<div className="row">
					{/* Basic Information */}
					<div className="col-md-6">
						<div className="card mb-4">
							<div className="card-header">
								<h5 className="mb-0">Basic Information</h5>
							</div>
							<div className="card-body">
								<div className="mb-3">
									<label htmlFor="bio" className="form-label">
										Bio
									</label>
									<textarea
										className={`form-control ${
											validationErrors.bio ? "is-invalid" : ""
										}`}
										id="bio"
										name="bio"
										value={formData.bio}
										onChange={handleChange}
										placeholder="Tell others about yourself"
										rows={3}
										maxLength={MAX_BIO_LENGTH}
									></textarea>
									<div className="d-flex justify-content-between mt-1">
										<small className="text-muted">
											{formData.bio.length}/{MAX_BIO_LENGTH} characters
										</small>
										{validationErrors.bio && (
											<small className="text-danger">
												{validationErrors.bio}
											</small>
										)}
									</div>
								</div>

								<div className="mb-3">
									<label htmlFor="occupation" className="form-label">
										<FaBriefcase className="me-2" />
										Occupation
									</label>
									<input
										type="text"
										className="form-control"
										id="occupation"
										name="occupation"
										value={formData.occupation}
										onChange={handleChange}
										placeholder="What do you do?"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Additional Information */}
					<div className="col-md-6">
						<div className="card mb-4">
							<div className="card-header d-flex justify-content-between align-items-center">
								<h5 className="mb-0">Additional Information</h5>
								<button
									type="button"
									className="btn btn-sm btn-outline-primary"
									onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
								>
									{showAdditionalInfo ? "Hide" : "Show"}
								</button>
							</div>
							<div
								className={`card-body ${!showAdditionalInfo ? "d-none" : ""}`}
							>
								<div className="mb-3">
									<label htmlFor="location" className="form-label">
										<FaMapMarkerAlt className="me-2" />
										Location
									</label>
									<input
										type="text"
										className="form-control"
										id="location"
										name="location"
										value={formData.location}
										onChange={handleChange}
										placeholder="Where are you located?"
									/>
								</div>

								<div className="mb-3">
									<label htmlFor="website" className="form-label">
										<FaGlobe className="me-2" />
										Website
									</label>
									<input
										type="url"
										className={`form-control ${
											validationErrors.website ? "is-invalid" : ""
										}`}
										id="website"
										name="website"
										value={formData.website}
										onChange={handleChange}
										placeholder="Your website or portfolio"
									/>
									{validationErrors.website && (
										<div className="invalid-feedback">
											{validationErrors.website}
										</div>
									)}
								</div>

								<div className="mb-3">
									<label htmlFor="birthday" className="form-label">
										<FaBirthdayCake className="me-2" />
										Birthday
									</label>
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
				</div>

				<div className="d-flex justify-content-end">
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
							"Save Profile Information"
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default ProfileInformationTab;
