import { useState } from "react";
import { toast } from "react-toastify";

const ProfileInformationTab = () => {
	const [formData, setFormData] = useState({
		bio: "",
		location: "",
		website: "",
		birthday: "",
		occupation: "",
	});

	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			toast.success("Profile information updated!");
		}, 1000);
	};

	return (
		<div className="settings-form-container">
			<div className="alert alert-info mb-4">
				Add more information to your profile to help others connect with you.
			</div>

			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label htmlFor="bio" className="form-label">
						Bio
					</label>
					<textarea
						className="form-control"
						id="bio"
						name="bio"
						value={formData.bio}
						onChange={handleChange}
						placeholder="Tell others about yourself"
						rows={3}
					></textarea>
				</div>

				<div className="mb-3">
					<label htmlFor="location" className="form-label">
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
						Website
					</label>
					<input
						type="url"
						className="form-control"
						id="website"
						name="website"
						value={formData.website}
						onChange={handleChange}
						placeholder="Your website or portfolio"
					/>
				</div>

				<div className="mb-3">
					<label htmlFor="birthday" className="form-label">
						Birthday
					</label>
					<input
						type="date"
						className="form-control"
						id="birthday"
						name="birthday"
						value={formData.birthday}
						onChange={handleChange}
					/>
				</div>

				<div className="mb-4">
					<label htmlFor="occupation" className="form-label">
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
			</form>
		</div>
	);
};

export default ProfileInformationTab;
