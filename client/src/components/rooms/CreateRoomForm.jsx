import { ArrowLeft, Clock, Lock, Tag } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRoom } from "../../context/RoomContext";
import { useToast } from "../../context/ToastContext";
import Card from "../UI/Card";

export default function CreateRoomForm() {
	const { createRoom } = useRoom();
	const { showError } = useToast();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		duration: 24,
		isPrivate: false,
		tags: [],
	});

	const [tagInput, setTagInput] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const handleAddTag = () => {
		if (!tagInput.trim()) return;
		if (formData.tags.includes(tagInput.trim())) {
			showError("This tag has already been added");
			return;
		}
		if (formData.tags.length >= 5) {
			showError("Maximum 5 tags allowed");
			return;
		}

		setFormData({
			...formData,
			tags: [...formData.tags, tagInput.trim()],
		});
		setTagInput("");
	};

	const handleRemoveTag = (tagToRemove) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			showError("Room name is required");
			return;
		}

		try {
			setIsSubmitting(true);
			const newRoom = await createRoom(formData);

			if (newRoom) {
				navigate(`/rooms/${newRoom._id}`);
			}
		} catch (error) {
			console.error("Error creating room:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			<div className="mb-6 flex items-center gap-2">
				<Link to="/rooms" className="text-purple-400 hover:text-purple-300">
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<h1 className="text-2xl font-bold text-white">Create Anonymous Room</h1>
			</div>

			<Card>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Room Name <span className="text-red-400">*</span>
							</label>
							<input
								id="name"
								name="name"
								type="text"
								value={formData.name}
								onChange={handleChange}
								placeholder="Enter a name for your room"
								className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
								maxLength={100}
							/>
						</div>

						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Description
							</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="What's this room about? (optional)"
								className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
								rows={3}
								maxLength={500}
							/>
						</div>

						<div>
							<label
								htmlFor="duration"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Room Duration
							</label>
							<div className="flex items-center">
								<Clock className="h-5 w-5 text-gray-400 mr-2" />
								<select
									id="duration"
									name="duration"
									value={formData.duration}
									onChange={handleChange}
									className="rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
								>
									<option value={1}>1 hour</option>
									<option value={3}>3 hours</option>
									<option value={6}>6 hours</option>
									<option value={12}>12 hours</option>
									<option value={24}>24 hours</option>
									<option value={48}>48 hours</option>
									<option value={72}>3 days</option>
									<option value={168}>7 days</option>
								</select>
								<p className="ml-3 text-sm text-gray-400">
									Room and all messages will be deleted after this time.
								</p>
							</div>
						</div>

						<div className="flex items-center">
							<input
								id="isPrivate"
								name="isPrivate"
								type="checkbox"
								checked={formData.isPrivate}
								onChange={handleChange}
								className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
							/>
							<label
								htmlFor="isPrivate"
								className="ml-2 flex items-center text-sm text-gray-300"
							>
								<Lock className="h-4 w-4 mr-1 text-yellow-500" />
								Private Room (requires access code)
							</label>
						</div>

						<div>
							<label
								htmlFor="tags"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Tags (optional)
							</label>
							<div className="flex">
								<div className="relative flex-1">
									<Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
									<input
										id="tags"
										type="text"
										value={tagInput}
										onChange={(e) => setTagInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleAddTag();
											}
										}}
										placeholder="Add tags (press Enter)"
										className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-10 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
										maxLength={20}
									/>
								</div>
								<button
									type="button"
									onClick={handleAddTag}
									className="ml-2 rounded-lg bg-gray-700 px-4 py-2.5 text-white hover:bg-gray-600"
								>
									Add
								</button>
							</div>

							{formData.tags.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-2">
									{formData.tags.map((tag) => (
										<span
											key={tag}
											className="flex items-center rounded-full bg-gray-700 px-3 py-1 text-sm text-white"
										>
											{tag}
											<button
												type="button"
												onClick={() => handleRemoveTag(tag)}
												className="ml-2 text-gray-400 hover:text-white"
											>
												&times;
											</button>
										</span>
									))}
								</div>
							)}
							<p className="mt-1 text-xs text-gray-500">
								Tags help others discover your room. Maximum 5 tags allowed.
							</p>
						</div>
					</div>

					<div className="border-t border-gray-800 pt-4 flex justify-end">
						<Link
							to="/rooms"
							className="mr-2 rounded-lg border border-gray-700 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
						>
							Cancel
						</Link>
						<button
							type="submit"
							disabled={isSubmitting || !formData.name.trim()}
							className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
						>
							{isSubmitting ? "Creating..." : "Create Room"}
						</button>
					</div>
				</form>
			</Card>
		</div>
	);
}
