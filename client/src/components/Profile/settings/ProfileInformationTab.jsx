import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
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
		<div className="py-4">
			<Alert variant="info" className="settings-alert mb-4">
				Add more information to your profile to help others connect with you.
			</Alert>

			<Form onSubmit={handleSubmit}>
				<Form.Group className="mb-3 form-group">
					<Form.Label>Bio</Form.Label>
					<Form.Control
						as="textarea"
						name="bio"
						value={formData.bio}
						onChange={handleChange}
						placeholder="Tell others about yourself"
						rows={3}
					/>
				</Form.Group>

				<Form.Group className="mb-3 form-group">
					<Form.Label>Location</Form.Label>
					<Form.Control
						type="text"
						name="location"
						value={formData.location}
						onChange={handleChange}
						placeholder="Where are you located?"
					/>
				</Form.Group>

				<Form.Group className="mb-3 form-group">
					<Form.Label>Website</Form.Label>
					<Form.Control
						type="url"
						name="website"
						value={formData.website}
						onChange={handleChange}
						placeholder="Your website or portfolio"
					/>
				</Form.Group>

				<Form.Group className="mb-3 form-group">
					<Form.Label>Birthday</Form.Label>
					<Form.Control
						type="date"
						name="birthday"
						value={formData.birthday}
						onChange={handleChange}
					/>
				</Form.Group>

				<Form.Group className="mb-3 form-group">
					<Form.Label>Occupation</Form.Label>
					<Form.Control
						type="text"
						name="occupation"
						value={formData.occupation}
						onChange={handleChange}
						placeholder="What do you do?"
					/>
				</Form.Group>

				<Button type="submit" className="btn-primary" disabled={loading}>
					{loading ? "Saving..." : "Save Profile Information"}
				</Button>
			</Form>
		</div>
	);
};

export default ProfileInformationTab;
