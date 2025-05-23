import {
	ArrowLeft,
	Eye,
	Lock,
	Mail,
	Save,
	Sparkles,
	Upload,
	User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import UserService from "../services/user.service";
import { useForm } from "../hooks/useForm";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";

export default function SettingsPage() {
	const { user, updateUser, loading: authLoading } = useAuth();
	const fileInputRef = useRef(null);
	const { showSuccess, showError } = useToast();

	const [activeTab, setActiveTab] = useState("profile");
	const [profileData, setProfileData] = useState(null);
	const [profileError, setProfileError] = useState(null);
	const [initialLoading, setInitialLoading] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [profilePreview, setProfilePreview] = useState(null);
	const [profileFile, setProfileFile] = useState(null);

	// --- Profile Form with useForm ---
	const profileForm = useForm({
		initialValues: {
			fullName: "",
			username: "",
			email: "",
			bio: "",
			location: "",
			website: "",
		},
		validate: (values) => {
			const errors = {};
			if (!values.fullName) errors.fullName = "Full name is required";
			if (!values.bio) errors.bio = "Bio is required";
			if (!values.location) errors.location = "Location is required";
			if (!values.website) errors.website = "Website is required";
			return errors;
		},
		onSubmit: async (values) => {
			try {
				const response = await UserService.updateMe({
					fullName: values.fullName,
					username: values.username,
					email: values.email,
					bio: values.bio,
					location: values.location,
					website: values.website,
				});
				if (response.status === "success" && response.data && response.data.user) {
					updateUser(response.data.user);
					showSuccess("Profile successfully updated");
				} else {
					throw new Error(response.message || "Failed to update profile: Unexpected response");
				}
			} catch (err) {
				console.error("Profile update error:", err);
				throw err;
			}
		},
	});

	// --- Password Form with useForm ---
	const passwordForm = useForm({
		initialValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validate: (values) => {
			const errors = {};
			if (!values.currentPassword) errors.currentPassword = "Current password is required";
			if (!values.newPassword) {
				errors.newPassword = "New password is required";
			} else if (values.newPassword.length < 8) {
				errors.newPassword = "New password must be at least 8 characters long";
			}
			if (!values.confirmPassword) {
				errors.confirmPassword = "Confirm new password is required";
			} else if (values.newPassword !== values.confirmPassword) {
				errors.confirmPassword = "New passwords do not match";
			}
			return errors;
		},
		onSubmit: async (values) => {
			try {
				await UserService.changePassword(
					values.currentPassword,
					values.newPassword,
					values.confirmPassword
				);
				showSuccess("Password successfully updated");
				passwordForm.resetForm();
			} catch (err) {
				console.error("Password update error:", err);
				throw err;
			}
		},
	});

	useEffect(() => {
		if (user) {
			const fetchProfileData = async () => {
				try {
					setInitialLoading(true);
					setProfileError(null);
					const data = await UserService.getProfile();
					const userData = data.data.user;
					setProfileData(userData);
					profileForm.setValues({
						fullName: userData.fullName || "",
						username: userData.username || "",
						email: userData.email || "",
						bio: userData.bio || "",
						location: userData.location || "",
						website: userData.website || "",
					});
					if (userData.profilePicture) {
						setProfilePreview(userData.profilePicture);
					}
				} catch (error) {
					console.error("Error fetching profile:", error);
					const errMsg = error.message || "Failed to load profile data";
					setProfileError(errMsg);
					showError(errMsg);
				} finally {
					setInitialLoading(false);
				}
			};
			fetchProfileData();
		} else if (!authLoading) {
			setInitialLoading(false);
		}
	}, [user, authLoading, showError, profileForm.setValues]);

	// For Profile Picture section - not using useForm as it's simpler file upload
	const [isUploadingPicture, setIsUploadingPicture] = useState(false);
	const [uploadError, setUploadError] = useState(null);

	const handleProfilePictureChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		setUploadError(null);
		const reader = new FileReader();
		reader.onloadend = () => {
			setProfilePreview(reader.result);
		};
		reader.readAsDataURL(file);
		setProfileFile(file);
	};

	const uploadProfilePicture = async () => {
		if (!profileFile) return;
		setIsUploadingPicture(true);
		setUploadError(null);
		try {
			const formData = new FormData();
			formData.append("profilePicture", profileFile);
			const response = await UserService.updateProfilePicture(formData);
			if (response.status === "success" && response.data && response.data.user) {
				updateUser({ profilePicture: response.data.user.profilePicture });
				showSuccess("Profile picture updated successfully");
				setProfileFile(null);
			} else {
				const message = response.message || "Failed to update profile picture: Unexpected response";
				setUploadError(message);
				showError(message);
			}
		} catch (err) {
			console.error("Profile picture update error:", err);
			const message = err.response?.data?.message || err.message || "Failed to upload profile picture";
			setUploadError(message);
			showError(message);
		} finally {
			setIsUploadingPicture(false);
		}
	};

	const deleteProfilePicture = async () => {
		if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
		setIsUploadingPicture(true);
		setUploadError(null);
		try {
			const response = await UserService.deleteProfilePicture();
			if (response.status === "success") {
				updateUser({ profilePicture: null });
				setProfilePreview(null);
				setProfileFile(null);
				showSuccess("Profile picture removed successfully");
			} else {
				const message = response.message || "Failed to remove profile picture: Unexpected response";
				setUploadError(message);
				showError(message);
			}
		} catch (err) {
			console.error("Profile picture deletion error:", err);
			const message = err.response?.data?.message || err.message || "Failed to remove profile picture";
			setUploadError(message);
			showError(message);
		} finally {
			setIsUploadingPicture(false);
		}
	};

	// Loading state for the entire page (auth and initial profile fetch)
	if (authLoading || initialLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<LoadingSpinner />
			</div>
		);
	}

	// If profile data failed to load after auth is done
	if (!profileData && profileError) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
				<ErrorMessage message={profileError} />
			</div>
		);
	}

	// If no user (and not caught by authLoading), implies not logged in
	// This might be redundant if App.jsx routes handle unauthenticated access better,
	// but serves as a fallback.
	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
				<ErrorMessage message="You must be logged in to view settings." />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-950">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b bg-gray-950/80 backdrop-blur-md">
				<div className="container flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-3">
						<Link to="/profile" className="rounded-full p-2 hover:bg-gray-800">
							<ArrowLeft className="h-5 w-5 text-white" />
							<span className="sr-only">Back</span>
						</Link>
						<h1 className="text-lg font-semibold text-white">Settings</h1>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => {
								if (activeTab === "profile") {
									profileForm.handleSubmit({ preventDefault: () => {} });
								} else if (activeTab === "password") {
									passwordForm.handleSubmit({ preventDefault: () => {} });
								} else if (activeTab === "account") {
									uploadProfilePicture();
								}
							}}
							disabled={profileForm.isSubmitting || passwordForm.isSubmitting || isUploadingPicture}
							className="flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
						>
							{profileForm.isSubmitting || passwordForm.isSubmitting || isUploadingPicture ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</div>
			</header>

			<main className="container flex-1 px-4 py-8">
				<div className="mx-auto max-w-4xl">
					{/* Settings Nav */}
					<div className="mb-8 flex flex-wrap gap-4 border-b border-gray-800 pb-4">
						<button
							onClick={() => setActiveTab("profile")}
							className={`rounded-full px-4 py-2 text-sm font-medium ${
								activeTab === "profile"
									? "bg-purple-600 text-white"
									: "bg-gray-800 text-gray-300 hover:bg-gray-700"
							}`}
						>
							Profile Details
						</button>
						<button
							onClick={() => setActiveTab("account")}
							className={`rounded-full px-4 py-2 text-sm font-medium ${
								activeTab === "account"
									? "bg-purple-600 text-white"
									: "bg-gray-800 text-gray-300 hover:bg-gray-700"
							}`}
						>
							Profile Picture
						</button>
						<button
							onClick={() => setActiveTab("password")}
							className={`rounded-full px-4 py-2 text-sm font-medium ${
								activeTab === "password"
									? "bg-purple-600 text-white"
									: "bg-gray-800 text-gray-300 hover:bg-gray-700"
							}`}
						>
							Password
						</button>
					</div>

					{/* Profile Settings Section */}
					{activeTab === "profile" && (
						<form onSubmit={profileForm.handleSubmit} className="space-y-6">
							{profileForm.submitError && (
								<div className="rounded-md bg-red-900/30 p-3 border border-red-900 text-sm text-red-400">
									{profileForm.submitError}
								</div>
							)}
							<div className="space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
								<h2 className="text-xl font-semibold text-white">
									Basic Information
								</h2>
								<div className="grid gap-4 grid-cols-2">
									<div className="space-y-2">
										<label htmlFor="fullName" className="text-sm font-medium text-gray-300">Full Name</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><User className="h-5 w-5" /></span>
											<input type="text" id="fullName" name="fullName" value={profileForm.values.fullName} onChange={profileForm.handleChange}
												className={`w-full rounded-lg border ${profileForm.errors.fullName ? 'border-red-500' : 'border-gray-700'} bg-gray-800 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`} placeholder="Your full name" />
										</div>
										{profileForm.errors.fullName && <p className="text-xs text-red-400 mt-1">{profileForm.errors.fullName}</p>}
									</div>
									<div className="space-y-2">
										<label htmlFor="username" className="text-sm font-medium text-gray-300">Username</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><span className="text-gray-500">@</span></span>
											<input type="text" id="username" name="username" value={profileForm.values.username} disabled className="w-full cursor-not-allowed rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-gray-400 focus:outline-none" placeholder="username" />
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
									<div className="relative">
										<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><Mail className="h-5 w-5" /></span>
										<input type="email" id="email" name="email" value={profileForm.values.email} disabled className="w-full cursor-not-allowed rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-gray-400 focus:outline-none" />
									</div>
									<p className="text-xs text-gray-500">Email address cannot be changed</p>
								</div>
							</div>

							<div className="space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
								<h2 className="text-xl font-semibold text-white">Profile Details</h2>
								<div className="space-y-2">
									<label htmlFor="bio" className="text-sm font-medium text-gray-300">Bio</label>
									<textarea id="bio" name="bio" value={profileForm.values.bio} onChange={profileForm.handleChange} rows="3" className={`w-full rounded-lg border ${profileForm.errors.bio ? 'border-red-500' : 'border-gray-700'} bg-gray-800 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`} placeholder="Write a short bio about yourself..."></textarea>
									{profileForm.errors.bio && <p className="text-xs text-red-400 mt-1">{profileForm.errors.bio}</p>}
								</div>
								<div className="grid gap-4 grid-cols-2">
									<div className="space-y-2">
										<label htmlFor="location" className="text-sm font-medium text-gray-300">Location</label>
										<input type="text" id="location" name="location" value={profileForm.values.location} onChange={profileForm.handleChange} className={`w-full rounded-lg border ${profileForm.errors.location ? 'border-red-500' : 'border-gray-700'} bg-gray-800 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`} placeholder="City, Country" />
										{profileForm.errors.location && <p className="text-xs text-red-400 mt-1">{profileForm.errors.location}</p>}
									</div>
									<div className="space-y-2">
										<label htmlFor="website" className="text-sm font-medium text-gray-300">Website</label>
										<input type="text" id="website" name="website" value={profileForm.values.website} onChange={profileForm.handleChange} className={`w-full rounded-lg border ${profileForm.errors.website ? 'border-red-500' : 'border-gray-700'} bg-gray-800 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`} placeholder="https://yourwebsite.com" />
										{profileForm.errors.website && <p className="text-xs text-red-400 mt-1">{profileForm.errors.website}</p>}
									</div>
								</div>
							</div>

							<button type="submit" disabled={profileForm.isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-center font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-60">
								{profileForm.isSubmitting ? ("Saving...") : (<><Save className="h-5 w-5" /> Save Profile Changes</>)}
							</button>
						</form>
					)}

					{/* Profile Picture Section */}
					{activeTab === "account" && (
						<div className="space-y-6">
							{uploadError && (
								<div className="rounded-md bg-red-900/30 p-3 border border-red-900 text-sm text-red-400">
									{uploadError}
								</div>
							)}
							<div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
								<h2 className="mb-4 text-xl font-semibold text-white">
									Profile Picture
								</h2>

								<div className="flex flex-col items-center space-y-4">
									<div className="relative">
										<div className="h-32 w-32 overflow-hidden rounded-full border-4 border-purple-600">
											{profilePreview ? (
												<img
													src={profilePreview}
													alt="Profile"
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center bg-gray-800">
													<User className="h-16 w-16 text-gray-400" />
												</div>
											)}
										</div>
									</div>

									<div className="flex flex-wrap gap-2">
										<input
											type="file"
											ref={fileInputRef}
											accept="image/*"
											onChange={handleProfilePictureChange}
											className="hidden"
										/>
										<button
											type="button"
											onClick={() => fileInputRef.current.click()}
											className="flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
										>
											<Upload className="h-4 w-4" />
											Upload New Picture
										</button>
										{profilePreview && (
											<button
												type="button"
												onClick={deleteProfilePicture}
												className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
											>
												Remove Picture
											</button>
										)}
									</div>
									{profileFile && (
										<div className="mt-2 text-sm text-gray-300">
											Selected: {profileFile.name}
										</div>
									)}
								</div>

								<div className="mt-4 rounded-lg bg-gray-800 p-3 text-sm text-gray-300">
									<p>
										Recommended: Square image, at least 400x400 pixels. Maximum
										size: 2MB.
									</p>
								</div>
							</div>

							{profileFile && (
								<button
									onClick={uploadProfilePicture}
									disabled={isUploadingPicture}
									className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-center font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-60"
								>
									{isUploadingPicture ? ("Uploading...") : (<><Save className="h-5 w-5" /> Save New Profile Picture</>)}
								</button>
							)}
						</div>
					)}

					{/* Password Section */}
					{activeTab === "password" && (
						<form onSubmit={passwordForm.handleSubmit} className="space-y-6">
							{passwordForm.submitError && (
								<div className="rounded-md bg-red-900/30 p-3 border border-red-900 text-sm text-red-400">
									{passwordForm.submitError}
								</div>
							)}
							<div className="space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
								<h2 className="text-xl font-semibold text-white">Change Password</h2>
								<div className="space-y-4">
									<div className="space-y-2">
										<label htmlFor="currentPassword" className="text-sm font-medium text-gray-300">Current Password</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><Lock className="h-5 w-5" /></span>
											<input type={showPassword ? "text" : "password"} id="currentPassword" name="currentPassword" value={passwordForm.values.currentPassword} onChange={passwordForm.handleChange}
												className={`w-full rounded-lg border ${passwordForm.errors.currentPassword ? 'border-red-500' : 'border-gray-700'} bg-gray-800 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`} placeholder="Enter your current password" />
											<button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400" onClick={() => setShowPassword(!showPassword)}><Eye className="h-5 w-5" /></button>
										</div>
										{passwordForm.errors.currentPassword && <p className="text-xs text-red-400 mt-1">{passwordForm.errors.currentPassword}</p>}
									</div>
									<div className="space-y-2">
										<label htmlFor="newPassword" className="text-sm font-medium text-gray-300">New Password</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><Lock className="h-5 w-5" /></span>
											<input type={showPassword ? "text" : "password"} id="newPassword" name="newPassword" value={passwordForm.values.newPassword} onChange={passwordForm.handleChange}
												className={`w-full rounded-lg border ${passwordForm.errors.newPassword ? 'border-red-500' : 'border-gray-700'} bg-gray-800 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`} placeholder="Enter new password" />
										</div>
										{passwordForm.errors.newPassword ? <p className="text-xs text-red-400 mt-1">{passwordForm.errors.newPassword}</p> : <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>}
									</div>
									<div className="space-y-2">
										<label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">Confirm New Password</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><Lock className="h-5 w-5" /></span>
											<input type={showPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={passwordForm.values.confirmPassword} onChange={passwordForm.handleChange}
												className={`w-full rounded-lg border ${passwordForm.errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} bg-gray-800 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`} placeholder="Confirm new password" />
										</div>
										{passwordForm.errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{passwordForm.errors.confirmPassword}</p>}
									</div>
								</div>
							</div>
							<button type="submit" disabled={passwordForm.isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-center font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-60">
								{passwordForm.isSubmitting ? ("Updating...") : (<><Save className="h-5 w-5" /> Update Password</>)}
							</button>
						</form>
					)}
				</div>
			</main>
		</div>
	);
}
