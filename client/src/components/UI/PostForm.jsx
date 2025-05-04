import { Clock, Image, Mic } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import Card from "./Card";
import ProfileAvatar from "./ProfileAvatar";

/**
 * Reusable form component for creating and editing posts
 */
export default function PostForm({
	user,
	initialContent = "",
	initialDuration = 24,
	isEditing = false,
	onSubmit,
	isSubmitting = false,
}) {
	const [content, setContent] = useState(initialContent);
	const [duration, setDuration] = useState(initialDuration);
	const [image, setImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const { showSuccess, showError, showLoading, showInfo } = useToast();

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Check file size (limit to 5MB)
		if (file.size > 5 * 1024 * 1024) {
			showError("Image is too large. Maximum size is 5MB.");
			return;
		}

		// Preview image
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result);
		};
		reader.readAsDataURL(file);
		setImage(file);
		showSuccess("Image added successfully");
	};

	const removeImage = () => {
		setImage(null);
		setImagePreview(null);
		showInfo("Image removed");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!content.trim()) return;

		const formData = new FormData();
		formData.append("content", content);
		formData.append("duration", duration);
		if (image) {
			formData.append("image", image);
		}

		try {
			// Use promise-based toast for the submission
			await showLoading(onSubmit(formData), {
				loading: isEditing ? "Updating post..." : "Creating post...",
				success: isEditing
					? "Post updated successfully!"
					: "Post created successfully!",
				error: (err) => `Error: ${err.message || "Something went wrong"}`,
			});

			// Reset form if not editing
			if (!isEditing) {
				setContent("");
				setImage(null);
				setImagePreview(null);
			}
		} catch (error) {
			// Error is handled by the showLoading toast
			console.error("Post submission error:", error);
		}
	};

	return (
		<Card className="mb-6">
			<form onSubmit={handleSubmit}>
				<div className="flex gap-3">
					<ProfileAvatar user={user} size="sm" />

					<div className="flex-1">
						<textarea
							className="min-h-[80px] w-full resize-none rounded-lg border border-gray-800 bg-transparent p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
							placeholder={`What's on your mind? It'll disappear in ${
								duration || 24
							} hours..`}
							value={content}
							onChange={(e) => setContent(e.target.value)}
						/>

						{imagePreview && (
							<div className="mt-2 relative">
								<img
									src={imagePreview}
									alt="Preview"
									className="h-48 w-full rounded-lg object-cover"
								/>
								<button
									type="button"
									onClick={removeImage}
									className="absolute top-2 right-2 rounded-full bg-gray-900/80 p-1 text-white hover:bg-gray-900"
								>
									<span className="sr-only">Remove</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</div>
						)}

						<div className="mt-2 flex items-center justify-between">
							<div className="flex gap-2">
								<label className="cursor-pointer rounded-full p-2 hover:bg-gray-800">
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handleImageChange}
									/>
									<Image className="h-4 w-4 text-gray-500" />
									<span className="sr-only">Add image</span>
								</label>

								<button
									type="button"
									className="rounded-full p-2 hover:bg-gray-800"
								>
									<Mic className="h-4 w-4 text-gray-500" />
									<span className="sr-only">Voice note</span>
								</button>

								<div className="flex items-center gap-1 rounded-lg border border-gray-800 px-2 py-1">
									<Clock className="h-3 w-3 text-gray-500" />
									<select
										className="bg-transparent text-xs text-gray-500"
										value={duration}
										onChange={(e) => setDuration(Number(e.target.value))}
									>
										<option value={24}>24 hours</option>
										<option value={48}>48 hours</option>
										<option value={72}>3 days</option>
										<option value={168}>7 days</option>
									</select>
								</div>
							</div>

							<button
								type="submit"
								disabled={!content.trim() || isSubmitting}
								className="rounded-full bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-1 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-60"
							>
								{isSubmitting ? "Posting..." : isEditing ? "Update" : "Echo"}
							</button>
						</div>
					</div>
				</div>
			</form>
		</Card>
	);
}
