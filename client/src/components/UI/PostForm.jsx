import { Clock, Image, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePost } from "../../context/PostContext";
import { useToast } from "../../context/ToastContext";
import Card from "./Card";
import ProfileAvatar from "./ProfileAvatar";

export default function PostForm({
	user,
	initialContent = "",
	initialDuration = 24,
	initialMedia = [],
	isEditing = false,
	onSubmit,
	isSubmitting = false,
}) {
	const { createPost } = usePost();
	const { showLoading, showError, showInfo } = useToast();
	const [content, setContent] = useState(initialContent);
	const [duration, setDuration] = useState(initialDuration);
	const [mediaItems, setMediaItems] = useState([]);

	useEffect(() => {
		setContent(initialContent);
		setDuration(initialDuration);
		const initialExistingMedia = initialMedia.map((item) => ({
			id: item.id,
			url: item.url,
			isExisting: true,
		}));
		setMediaItems(initialExistingMedia);
	}, [initialContent, initialDuration, initialMedia]);

	useEffect(() => {
		const urlsToRevoke = mediaItems
			.filter((item) => !item.isExisting && item.previewUrl)
			.map((item) => item.previewUrl);

		return () => {
			urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [mediaItems]);

	const handleFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);

		for (const file of selectedFiles) {
			if (!(file.type.startsWith("image/") || file.type.startsWith("video/"))) {
				showError("Only images and videos are allowed.");
				e.target.value = null;
				return;
			}
			if (file.size > 50 * 1024 * 1024) {
				showError("Each file must be less than 50MB.");
				e.target.value = null;
				return;
			}
		}

		const newMedia = selectedFiles.map((file) => ({
			file: file,
			previewUrl: URL.createObjectURL(file),
			isExisting: false,
			tempId: Date.now() + Math.random(),
		}));

		setMediaItems((prevMedia) => [...prevMedia, ...newMedia]);
		e.target.value = null;
	};

	const removeMedia = useCallback((itemToRemove) => {
		setMediaItems((prevMediaItems) => {
			const newMediaItems = prevMediaItems.filter(
				(item) => item !== itemToRemove
			);
			return newMediaItems;
		});
		showInfo("Media removed");
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!content.trim()) {
			showInfo("Content cannot be empty.");
			return;
		}

		const formData = new FormData();
		formData.append("content", content);
		formData.append("duration", duration);

		const existingMediaIdsToKeep = [];
		console.log("Media items to submit:", mediaItems);
		mediaItems.forEach((item) => {
			if (!item.isExisting) {
				formData.append("media", item.file);
			} else {
				existingMediaIdsToKeep.push(item.id);
			}
		});
		existingMediaIdsToKeep.forEach((id) =>
			formData.append("existingMediaIds", id)
		);

		try {
			const response = await createPost(formData);
			console.log("Post created:", response);
		} catch (error) {
			showError(error.message || "Failed to create post. Please try again.");
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

						{/* === MODERN MEDIA PREVIEWS START === */}
						{mediaItems.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-2">
								{mediaItems.map((item, idx) => {
									// Determine the URL and media type based on item structure
									const url = item.isExisting ? item.url : item.previewUrl;
									const type = item.isExisting
										? item.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
											? "image"
											: item.url.match(/\.(mp4|webm|ogg)$/i)
											? "video"
											: "unknown" // Basic type guess for existing URLs
										: item.file.type; // Use file type for new items

									if (!url) return null; // Should not happen with correctly structured state

									return (
										// Use a unique key: item.id for existing, tempId for new, fallback to index if needed
										<div
											key={item.id || item.tempId || idx}
											className="relative group h-24 w-24"
										>
											{" "}
											{/* Added h-24 w-24 for consistent container size */}
											{type.startsWith("image/") ? (
												<img
													src={url}
													alt={
														item.isExisting
															? "Existing media preview"
															: `Preview of ${item.file.name}`
													} // More descriptive alt text
													className="h-full w-full rounded object-cover" // Image fills container
												/>
											) : type.startsWith("video/") ? (
												<video
													src={url}
													controls // Add controls for video playback
													className="h-full w-full rounded object-cover" // Video fills container
												/>
											) : (
												// Placeholder for unsupported types
												<div className="h-full w-full rounded bg-gray-700 text-white flex items-center justify-center text-center text-xs p-1">
													Cannot preview{" "}
													{item.isExisting
														? `Media (${item.id})`
														: item.file.name}
												</div>
											)}
											{/* Remove button */}
											<button
												type="button"
												onClick={() => removeMedia(item)} // Pass the specific item object
												// Position and style the remove button (visible on hover)
												className="absolute top-1 right-1 rounded-full bg-gray-900/80 text-white hover:bg-gray-900 p-1 transition-opacity opacity-0 group-hover:opacity-100"
												aria-label="Remove media" // Accessibility label for screen readers
											>
												<XCircle className="h-4 w-4" aria-hidden="true" />{" "}
												{/* Icon */}
											</button>
										</div>
									);
								})}
							</div>
						)}
						{/* === MODERN MEDIA PREVIEWS END === */}

						<div className="mt-2 flex items-center justify-between">
							<div className="flex gap-2">
								<label className="cursor-pointer rounded-full p-2 hover:bg-gray-800">
									<input
										type="file"
										className="hidden"
										name="media"
										multiple
										accept="image/*,video/*"
										onChange={handleFileChange}
										// The onClick={(e) => e.target.value = null} for file input is handled inside handleFileChange now
									/>
									<Image className="h-4 w-4 text-gray-500" aria-hidden="true" />
									<span className="sr-only">Add media</span>
								</label>

								<div className="flex items-center gap-1 rounded-lg border border-gray-800 px-2 py-1">
									<Clock className="h-3 w-3 text-gray-500" aria-hidden="true" />
									<label htmlFor="duration-select" className="sr-only">
										Post duration
									</label>
									<select
										id="duration-select"
										className="bg-transparent text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded"
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
								className="rounded-full bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-1 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-60 transition-opacity"
							>
								{isSubmitting
									? isEditing
										? "Updating..."
										: "Posting..."
									: isEditing
									? "Update"
									: "Echo"}
							</button>
						</div>
					</div>
				</div>
			</form>
		</Card>
	);
}

// await showLoading(
//     new Promise((resolve, reject) => {
//         const result = onSubmit(formData);
//         if (result instanceof Promise) {
//             result.then(resolve).catch(reject);
//         } else {
//             resolve(result);
//         }
//     }),
//     {
//         loading: isEditing ? "Updating post..." : "Creating post...",
//         success: isEditing
//             ? "Post updated successfully!"
//             : "Post created successfully!",
//         error: (err) => {
//             console.error("Post submission failed:", err);
//             return `Error: ${err.message || "Something went wrong"}`;
//         },
//     }
// );

// if (!isEditing) {
//     setContent("");
//     setMediaItems([]);
// }
