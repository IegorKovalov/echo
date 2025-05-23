import { Clock, Crown, Info, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const categories = [
	"Support",
	"Professional",
	"Creative",
	"Relationships",
	"Technology",
	"Discussion",
];

const resetIntervals = [
	{ value: 24, label: "24 hours (1 day)", description: "Room resets daily" },
	{
		value: 72,
		label: "72 hours (3 days)",
		description: "Room resets every 3 days",
	},
	{
		value: 168,
		label: "168 hours (1 week)",
		description: "Room resets weekly",
	},
];

const maxParticipantsOptions = [
	{
		value: 50,
		label: "50 participants",
		description: "Intimate conversations",
	},
	{
		value: 100,
		label: "100 participants",
		description: "Medium-sized community",
	},
	{ value: 200, label: "200 participants", description: "Large community" },
];

export default function CreateRoomModal({ isOpen, onClose }) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		category: "Discussion",
		resetInterval: 24,
		maxParticipants: 100,
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const modalRef = useRef(null);

	useEffect(() => {
		if (isOpen) {
			// Reset form when modal opens
			setFormData({
				name: "",
				description: "",
				category: "Discussion",
				resetInterval: 24,
				maxParticipants: 100,
			});
			setErrors({});
		}
	}, [isOpen]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onClose();
			}
		};

		const handleEscape = (event) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Room name is required";
		} else if (formData.name.length < 3) {
			newErrors.name = "Room name must be at least 3 characters";
		} else if (formData.name.length > 100) {
			newErrors.name = "Room name cannot exceed 100 characters";
		}

		if (!formData.description.trim()) {
			newErrors.description = "Description is required";
		} else if (formData.description.length > 500) {
			newErrors.description = "Description cannot exceed 500 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			console.log("Creating room with data:", formData);

			// Close modal and show success
			onClose();

			// In real implementation, this would create the room via API
			// and refresh the rooms list
		} catch (error) {
			console.error("Error creating room:", error);
			setErrors({ submit: "Failed to create room. Please try again." });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear field error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: null }));
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
			<div
				ref={modalRef}
				className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-800">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-purple-600/20 p-2">
							<Crown className="h-5 w-5 text-purple-400" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-white">
								Create New Room
							</h2>
							<p className="text-sm text-gray-400">
								Start your own anonymous conversation space
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200"
						disabled={isSubmitting}
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Form */}
				<div className="p-6 space-y-6">
					{/* General Error */}
					{errors.submit && (
						<div className="p-3 rounded-lg bg-red-900/30 border border-red-900 text-red-400 text-sm">
							{errors.submit}
						</div>
					)}

					{/* Room Name */}
					<div className="space-y-2">
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-300"
						>
							Room Name <span className="text-red-400">*</span>
						</label>
						<input
							id="name"
							type="text"
							value={formData.name}
							onChange={(e) => handleInputChange("name", e.target.value)}
							className={`w-full rounded-lg border ${
								errors.name ? "border-red-500" : "border-gray-700"
							} bg-gray-800 px-3 py-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors duration-200`}
							placeholder="Enter a compelling room name..."
							disabled={isSubmitting}
						/>
						{errors.name && (
							<p className="text-xs text-red-400">{errors.name}</p>
						)}
						<p className="text-xs text-gray-500">
							{formData.name.length}/100 characters
						</p>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-300"
						>
							Description <span className="text-red-400">*</span>
						</label>
						<textarea
							id="description"
							value={formData.description}
							onChange={(e) => handleInputChange("description", e.target.value)}
							rows={3}
							className={`w-full rounded-lg border ${
								errors.description ? "border-red-500" : "border-gray-700"
							} bg-gray-800 px-3 py-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors duration-200 resize-none`}
							placeholder="Describe what this room is about and what kind of conversations you want to encourage..."
							disabled={isSubmitting}
						/>
						{errors.description && (
							<p className="text-xs text-red-400">{errors.description}</p>
						)}
						<p className="text-xs text-gray-500">
							{formData.description.length}/500 characters
						</p>
					</div>

					{/* Category */}
					<div className="space-y-2">
						<label
							htmlFor="category"
							className="block text-sm font-medium text-gray-300"
						>
							Category
						</label>
						<select
							id="category"
							value={formData.category}
							onChange={(e) => handleInputChange("category", e.target.value)}
							className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
							disabled={isSubmitting}
						>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</div>

					{/* Reset Interval */}
					<div className="space-y-3">
						<label className="block text-sm font-medium text-gray-300">
							<Clock className="h-4 w-4 inline mr-1" />
							Reset Schedule
						</label>
						<div className="space-y-2">
							{resetIntervals.map((interval) => (
								<div key={interval.value} className="flex items-start gap-3">
									<input
										type="radio"
										id={`reset-${interval.value}`}
										name="resetInterval"
										value={interval.value}
										checked={formData.resetInterval === interval.value}
										onChange={(e) =>
											handleInputChange(
												"resetInterval",
												parseInt(e.target.value)
											)
										}
										className="mt-1 h-4 w-4 text-purple-600 border-gray-600 bg-gray-800 focus:ring-purple-500"
										disabled={isSubmitting}
									/>
									<label
										htmlFor={`reset-${interval.value}`}
										className="flex-1 cursor-pointer"
									>
										<span className="text-white font-medium">
											{interval.label}
										</span>
										<p className="text-xs text-gray-400 mt-0.5">
											{interval.description}
										</p>
									</label>
								</div>
							))}
						</div>
						<div className="p-3 rounded-lg bg-blue-900/20 border border-blue-900/30 text-blue-300 text-sm flex gap-2">
							<Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
							<span>
								All messages in the room will be cleared when the reset time
								arrives. This helps maintain anonymity and fresh conversations.
							</span>
						</div>
					</div>

					{/* Max Participants */}
					<div className="space-y-3">
						<label className="block text-sm font-medium text-gray-300">
							<Users className="h-4 w-4 inline mr-1" />
							Maximum Participants
						</label>
						<div className="space-y-2">
							{maxParticipantsOptions.map((option) => (
								<div key={option.value} className="flex items-start gap-3">
									<input
										type="radio"
										id={`max-${option.value}`}
										name="maxParticipants"
										value={option.value}
										checked={formData.maxParticipants === option.value}
										onChange={(e) =>
											handleInputChange(
												"maxParticipants",
												parseInt(e.target.value)
											)
										}
										className="mt-1 h-4 w-4 text-purple-600 border-gray-600 bg-gray-800 focus:ring-purple-500"
										disabled={isSubmitting}
									/>
									<label
										htmlFor={`max-${option.value}`}
										className="flex-1 cursor-pointer"
									>
										<span className="text-white font-medium">
											{option.label}
										</span>
										<p className="text-xs text-gray-400 mt-0.5">
											{option.description}
										</p>
									</label>
								</div>
							))}
						</div>
					</div>

					{/* Room Expiry Info */}
					<div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
						<h4 className="text-white font-medium mb-2">Room Lifecycle</h4>
						<ul className="text-sm text-gray-300 space-y-1">
							<li>• Your room will automatically expire after 30 days</li>
							<li>• You can extend the expiration as the room creator</li>
							<li>• You'll have admin privileges to moderate the room</li>
							<li>• You can delete the room at any time</li>
						</ul>
					</div>

					{/* Actions */}
					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-white hover:bg-gray-700 transition-colors duration-200"
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={isSubmitting}
							className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70 transition-all duration-200 shadow-md shadow-purple-900/20"
						>
							{isSubmitting ? (
								<span className="flex items-center justify-center gap-2">
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
									Creating...
								</span>
							) : (
								"Create Room"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
