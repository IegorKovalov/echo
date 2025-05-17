import { ArrowLeft, Clock, Info, Tag, X } from "lucide-react";
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
		duration: 4,
		maxUsers: 50,
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
			<div className="mb-6 flex items-center gap-3">
				<Link to="/rooms" className="text-purple-400 hover:text-purple-300 transition-colors">
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<div>
					<h1 className="text-2xl font-bold text-white">Create Anonymous Room</h1>
					<p className="text-sm text-gray-400 mt-1">Create a temporary anonymous chat room that will disappear after the set duration</p>
				</div>
			</div>

			<Card className="border border-gray-800">
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-5">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-300 mb-1.5"
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
								className="w-full rounded-lg border border-gray-700 bg-gray-800/80 p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
								maxLength={100}
							/>
						</div>

						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-300 mb-1.5"
							>
								Description
							</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="What's this room about? (optional)"
								className="w-full rounded-lg border border-gray-700 bg-gray-800/80 p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
								rows={3}
								maxLength={500}
							/>
						</div>

						<div>
							<label
								htmlFor="duration"
								className="block text-sm font-medium text-gray-300 mb-1.5"
							>
								Room Duration
							</label>
							<div className="flex items-center">
								<div className="relative flex-1">
									<Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
									<select
										id="duration"
										name="duration"
										value={formData.duration}
										onChange={handleChange}
										className="w-full rounded-lg border border-gray-700 bg-gray-800/80 pl-10 p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none transition-colors"
									>
										<option value={1}>1 hour</option>
										<option value={2}>2 hours</option>
										<option value={4}>4 hours</option>
										<option value={8}>8 hours</option>
										<option value={12}>12 hours</option>
										<option value={24}>24 hours</option>
										<option value={48}>48 hours</option>
									</select>
								</div>
							</div>
							<p className="mt-2 text-sm text-gray-400 flex items-start gap-1.5">
								<Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
								Room and all messages will be permanently deleted after this time.
							</p>
						</div>

						<div>
							<label
								htmlFor="maxUsers"
								className="block text-sm font-medium text-gray-300 mb-1.5"
							>
								Maximum Users
							</label>
							<div className="flex">
								<div className="relative flex-1">
									<select
										id="maxUsers"
										name="maxUsers"
										value={formData.maxUsers}
										onChange={handleChange}
										className="w-full rounded-lg border border-gray-700 bg-gray-800/80 pl-10 p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none transition-colors"
									>
										<option value={10}>10 users</option>
										<option value={25}>25 users</option>
										<option value={50}>50 users</option>
										<option value={100}>100 users</option>
										<option value={200}>200 users</option>
									</select>
								</div>
							</div>
						</div>

						<div>
							<label
								htmlFor="tags"
								className="block text-sm font-medium text-gray-300 mb-1.5"
							>
								Tags (optional)
							</label>
							<div className="flex">
								<div className="relative flex-1">
									<Tag className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
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
										className="w-full rounded-lg border border-gray-700 bg-gray-800/80 pl-10 p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
										maxLength={20}
									/>
								</div>
								<button
									type="button"
									onClick={handleAddTag}
									className="ml-2 rounded-lg bg-gray-700 px-4 py-3 text-white hover:bg-gray-600 transition-colors"
								>
									Add
								</button>
							</div>

							{formData.tags.length > 0 && (
								<div className="mt-3 flex flex-wrap gap-2">
									{formData.tags.map((tag) => (
										<span
											key={tag}
											className="flex items-center rounded-full bg-purple-500/10 px-3 py-1.5 text-sm text-purple-400 border border-purple-500/20"
										>
											{tag}
											<button
												type="button"
												onClick={() => handleRemoveTag(tag)}
												className="ml-1.5 rounded-full hover:bg-gray-700 p-0.5"
											>
												<X className="h-3.5 w-3.5" />
											</button>
										</span>
									))}
								</div>
							)}
							<p className="mt-2 text-xs text-gray-500">You can add up to 5 tags</p>
						</div>
					</div>

					<div className="flex justify-end pt-4 border-t border-gray-800">
						<button
							type="submit"
							disabled={isSubmitting}
							className="rounded-lg bg-purple-600 px-5 py-2.5 text-white font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-900/20"
						>
							{isSubmitting ? "Creating..." : "Create Room"}
						</button>
					</div>
				</form>
			</Card>
		</div>
	);
}
