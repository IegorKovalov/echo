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
		<div>
			<div>
				Add more information to your profile to help others connect with you.
			</div>

			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="bio">Bio</label>
					<textarea
						id="bio"
						name="bio"
						value={formData.bio}
						onChange={handleChange}
						placeholder="Tell others about yourself"
						rows={3}
					></textarea>
				</div>

				<div>
					<label htmlFor="location">Location</label>
					<input
						type="text"
						id="location"
						name="location"
						value={formData.location}
						onChange={handleChange}
						placeholder="Where are you located?"
					/>
				</div>

				<div>
					<label htmlFor="website">Website</label>
					<input
						type="url"
						id="website"
						name="website"
						value={formData.website}
						onChange={handleChange}
						placeholder="Your website or portfolio"
					/>
				</div>

				<div>
					<label htmlFor="birthday">Birthday</label>
					<input
						type="date"
						id="birthday"
						name="birthday"
						value={formData.birthday}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label htmlFor="occupation">Occupation</label>
					<input
						type="text"
						id="occupation"
						name="occupation"
						value={formData.occupation}
						onChange={handleChange}
						placeholder="What do you do?"
					/>
				</div>

				<button type="submit" disabled={loading}>
					{loading ? "Saving..." : "Save Profile Information"}
				</button>
			</form>
		</div>
	);
};

export default ProfileInformationTab;
