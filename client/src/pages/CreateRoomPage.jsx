import { ArrowLeft, Radio, Save, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/UI/Card";
import FormInput from "../components/UI/FormInput";
import { useRoom } from "../context/RoomContext";
import { useToast } from "../context/ToastContext";


const CreateRoomPage = () => {
	const navigate = useNavigate();
	const { createRoom } = useRoom();
	const { showSuccess, showError } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		category: "Discussion",
		roomType: "user-created",
		resetInterval: 24,
		maxParticipants: 100,
	});

	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				type === "checkbox"
					? checked
					: type === "number"
					? parseInt(value)
					: value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.name.trim()) newErrors.name = "Room name is required.";
		if (formData.name.length > 100)
			newErrors.name = "Room name cannot exceed 100 characters.";
		if (formData.description.length > 500)
			newErrors.description = "Description cannot exceed 500 characters.";
		if (!formData.category) newErrors.category = "Category is required.";
		if (![24, 72, 168].includes(formData.resetInterval))
			newErrors.resetInterval = "Invalid reset interval.";
		if (![50, 100, 200].includes(formData.maxParticipants))
			newErrors.maxParticipants = "Invalid max participants.";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) {
			showError("Please correct the errors in the form.");
			return;
		}

		setIsSubmitting(true);
		try {
			const newRoom = await createRoom(formData);
			if (newRoom && newRoom._id) {
				showSuccess("Room created successfully!");
				navigate(`/room/${newRoom._id}`);
			} else {
				// Error handled by context or service, toast might be redundant
				// showError('Failed to create room. Please try again.');
			}
		} catch (err) {
			// Error is already shown by context/service
			// showError(err.message || 'An unexpected error occurred.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const categories = [
		"Support",
		"Professional",
		"Creative",
		"Relationships",
		"Technology",
		"Discussion",
	];
	const resetIntervals = [
		{ label: "24 hours (1 day)", value: 24 },
		{ label: "72 hours (3 days)", value: 72 },
		{ label: "168 hours (7 days)", value: 168 },
	];
	const maxParticipantsOptions = [
		{ label: "50 members", value: 50 },
		{ label: "100 members", value: 100 },
		{ label: "200 members", value: 200 },
	];

	return (
		<div className="container mx-auto px-4 py-8">
			<header className="mb-8">
				<div className="flex items-center justify-between">
					<Link
						to="/rooms"
						className="flex items-center text-purple-400 hover:text-purple-300"
					>
						<ArrowLeft size={20} className="mr-2" />
						Back to Rooms
					</Link>
					<h1 className="text-2xl font-bold text-white flex items-center">
						<Radio size={24} className="mr-2 text-purple-500" /> Create New Room
					</h1>
					<div>{/* Placeholder for alignment */}</div>
				</div>
			</header>

			<Card className="max-w-2xl mx-auto" title="Room Details">
				<form onSubmit={handleSubmit} className="space-y-6 p-2">
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-300 mb-1"
						>
							Room Name
						</label>
						<FormInput
							id="name"
							name="name"
							type="text"
							placeholder="E.g., Late Night Gamers"
							value={formData.name}
							onChange={handleChange}
							error={errors.name}
							className="bg-gray-700 border-gray-600"
						/>
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-300 mb-1"
						>
							Description (Optional)
						</label>
						<textarea
							id="description"
							name="description"
							rows="3"
							placeholder="A brief description of your room's topic or purpose."
							value={formData.description}
							onChange={handleChange}
							className={`w-full rounded-md border ${
								errors.description ? "border-red-500" : "border-gray-600"
							} bg-gray-700 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
						/>
						{errors.description && (
							<p className="text-xs text-red-400 mt-1">{errors.description}</p>
						)}
					</div>

					<div>
						<label
							htmlFor="category"
							className="block text-sm font-medium text-gray-300 mb-1"
						>
							Category
						</label>
						<select
							id="category"
							name="category"
							value={formData.category}
							onChange={handleChange}
							className={`w-full rounded-md border ${
								errors.category ? "border-red-500" : "border-gray-600"
							} bg-gray-700 p-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
						>
							{categories.map((cat) => (
								<option key={cat} value={cat}>
									{cat}
								</option>
							))}
						</select>
						{errors.category && (
							<p className="text-xs text-red-400 mt-1">{errors.category}</p>
						)}
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="resetInterval"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Reset Interval
							</label>
							<select
								id="resetInterval"
								name="resetInterval"
								value={formData.resetInterval}
								onChange={handleChange}
								className={`w-full rounded-md border ${
									errors.resetInterval ? "border-red-500" : "border-gray-600"
								} bg-gray-700 p-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
							>
								{resetIntervals.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
							{errors.resetInterval && (
								<p className="text-xs text-red-400 mt-1">
									{errors.resetInterval}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="maxParticipants"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Max Participants
							</label>
							<select
								id="maxParticipants"
								name="maxParticipants"
								value={formData.maxParticipants}
								onChange={handleChange}
								className={`w-full rounded-md border ${
									errors.maxParticipants ? "border-red-500" : "border-gray-600"
								} bg-gray-700 p-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
							>
								{maxParticipantsOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
							{errors.maxParticipants && (
								<p className="text-xs text-red-400 mt-1">
									{errors.maxParticipants}
								</p>
							)}
						</div>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70"
					>
						{isSubmitting ? (
							"Creating Room..."
						) : (
							<>
								<Save size={18} /> Create Room
							</>
						)}
					</button>
				</form>
			</Card>
		</div>
	);
};

export default CreateRoomPage;
