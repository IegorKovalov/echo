import { Clock, Image, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import Card from "./Card";
import ProfileAvatar from "./ProfileAvatar";

export default function PostForm({
	user,
	initialContent = "",
	initialMedia = [],
	isEditing = false,
	onSubmit,
	isSubmitting = false,
}) {
	const { showError, showInfo } = useToast();
	const [content, setContent] = useState(initialContent);
	const [expirationTime, setExpirationTime] = useState("24");
	const [mediaItems, setMediaItems] = useState([]);

	useEffect(() => {
		setContent(initialContent);
		const initialExistingMedia = Array.isArray(initialMedia)
			? initialMedia
					.filter((item) => {
						return item && (item.url || item._id);
					})
					.map((item) => {
						let mediaType = item.type;
						if (!mediaType && item.url) {
							mediaType = determineMediaTypeFromUrl(item.url);
						}

						return {
							id: item._id || item.id,
							url: item.url,
							type: mediaType,
							isExisting: true,
							publicId: item.publicId,
						};
					})
			: [];
		setMediaItems(initialExistingMedia);
	}, [initialContent, initialMedia]);

	const determineMediaTypeFromUrl = (url) => {
		if (!url) return "unknown";
		if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return "image";
		if (url.match(/\.(mp4|webm|ogg)$/i)) return "video";
		return "unknown";
	};

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
			if (file.size > 200 * 1024 * 1024) {
				showError("Each file must be less than 200MB.");
				e.target.value = null;
				return;
			}
		}

		const newMedia = selectedFiles.map((file) => ({
			file: file,
			previewUrl: URL.createObjectURL(file),
			type: file.type,
			isExisting: false,
			tempId: Date.now() + Math.random(),
		}));

		setMediaItems((prevMedia) => [...prevMedia, ...newMedia]);
		e.target.value = null;
	};

	const removeMedia = useCallback(
		(itemToRemove) => {
			setMediaItems((prevMediaItems) => {
				const newMediaItems = prevMediaItems.filter(
					(item) => item !== itemToRemove
				);
				return newMediaItems;
			});
			showInfo("Media removed");
		},
		[showInfo]
	);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!content.trim()) {
			showInfo("Content cannot be empty.");
			return;
		}
		const formData = new FormData();
		formData.append("content", content);
		formData.append("expirationTime", expirationTime);
		const existingMediaIdsToKeep = mediaItems
			.filter((item) => item.isExisting)
			.map((item) => item.id || item._id)
			.filter(Boolean);
		mediaItems.forEach((item) => {
			if (!item.isExisting && item.file) {
				formData.append("media", item.file);
			}
		});
		if (isEditing) {
			if (existingMediaIdsToKeep.length > 0) {
				existingMediaIdsToKeep.forEach((id) => {
					formData.append("existingMediaIds", id);
				});
			} else {
				formData.append("existingMediaIds", "");
			}
		}

		try {
			await onSubmit(formData);
			// Clear form after successful submission (only if not editing)
			if (!isEditing) {
				setContent("");
				setMediaItems([]);
				setExpirationTime("24");
			}
		} catch (error) {
			showError(error.message || "Failed to create post. Please try again.");
		}
	};

	// Helper functions for media type checking
	const isImage = (type) => {
		return (
			type === "image" ||
			type === "image/jpeg" ||
			type === "image/png" ||
			type === "image/gif" ||
			type.startsWith("image/")
		);
	};

	const isVideo = (type) => {
		return (
			type === "video" ||
			type === "video/mp4" ||
			type === "video/webm" ||
			type === "video/ogg" ||
			type.startsWith("video/")
		);
	};

	return (
		<Card className="mb-6">
			<form onSubmit={handleSubmit}>
				<div className="flex gap-3">
					<ProfileAvatar user={user} size="sm" />

					<div className="flex-1">
						<textarea
							className="min-h-[80px] w-full resize-none rounded-lg border border-gray-800/80 bg-gray-900/50 p-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
							placeholder={`What's on your mind? It'll disappear in ${
								expirationTime || 24
							} hours..`}
							value={content}
							onChange={(e) => setContent(e.target.value)}
						/>

						{mediaItems.length > 0 && (
							<div className="mt-3 flex flex-wrap gap-2">
								{mediaItems.map((item, idx) => {
									const url = item.isExisting ? item.url : item.previewUrl;

									if (!url) return null;

									return (
										<div
											key={item.id || item.tempId || idx}
											className="relative group h-24 w-24 rounded-md overflow-hidden shadow-md"
										>
											{isImage(item.type) ? (
												<img
													src={url}
													alt={
														item.isExisting
															? "Existing media"
															: `Preview of ${item.file.name}`
													}
													className="h-full w-full object-cover"
												/>
											) : isVideo(item.type) ? (
												<video
													src={url}
													controls
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="h-full w-full bg-gray-800 text-white flex items-center justify-center text-center text-xs p-1">
													Cannot preview{" "}
													{item.isExisting
														? `Media (${item.id})`
														: item.file.name}
												</div>
											)}
											<button
												type="button"
												onClick={() => removeMedia(item)}
												className="absolute top-1 right-1 rounded-full bg-gray-900/90 text-white hover:bg-gray-900 p-1 transition-all opacity-0 group-hover:opacity-100"
												aria-label="Remove media"
											>
												<XCircle className="h-4 w-4" aria-hidden="true" />
											</button>
										</div>
									);
								})}
							</div>
						)}

						<div className="mt-3 flex items-center justify-between">
							<div className="flex gap-2">
								<label className="cursor-pointer rounded-full p-2 hover:bg-gray-800/70 transition-colors duration-200">
									<input
										type="file"
										accept="image/*,video/*"
										className="hidden"
										onChange={handleFileChange}
										multiple
									/>
									<Image
										className="h-5 w-5 text-purple-400"
										aria-hidden="true"
									/>
									<span className="sr-only">Add media</span>
								</label>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex items-center gap-1.5 text-sm">
									<Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
									<span className="text-gray-400">Duration:</span>
									<select
										value={expirationTime}
										onChange={(e) => setExpirationTime(e.target.value)}
										className="rounded border border-gray-800/80 bg-gray-900/50 px-1.5 py-1 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
									>
										<option value="12">12 hours</option>
										<option value="24">24 hours</option>
										<option value="48">48 hours</option>
										<option value="72">3 days</option>
										<option value="168">7 days</option>
									</select>
								</div>

								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-70"
								>
									{isSubmitting ? "Posting..." : isEditing ? "Update" : "Post"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</form>
		</Card>
	);
}
