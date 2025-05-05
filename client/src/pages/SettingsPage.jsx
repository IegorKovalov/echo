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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import UserService from "../services/user.service";

export default function SettingsPage() {
	const { user, loading, updateUser } = useAuth();
	const navigate = useNavigate();
	const fileInputRef = useRef(null);
	const { showSuccess, showError } = useToast();

	const [activeTab, setActiveTab] = useState("profile");
	const [profileData, setProfileData] = useState(null);
	const [formData, setFormData] = useState({
		fullName: "",
		username: "",
		email: "",
		bio: "",
		location: "",
		website: "",
	});
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [profilePreview, setProfilePreview] = useState(null);
	const [profileFile, setProfileFile] = useState(null);

	// Redirect if not logged in
	useEffect(() => {
		if (!loading && !user) {
			navigate("/login");
		}
	}, [user, loading, navigate]);

	// Load profile data from API
	useEffect(() => {
		if (user) {
			const fetchProfileData = async () => {
				try {
					const data = await UserService.getProfile();
					const userData = data.data.user;
					setProfileData(userData);

					// Set form data from user profile
					setFormData({
						fullName: userData.fullName || "",
						username: userData.username || "",
						email: userData.email || "",
						bio: userData.bio || "",
						location: userData.location || "",
						website: userData.website || "",
					});

					// Set profile picture preview if exists
					if (userData.profilePicture) {
						setProfilePreview(userData.profilePicture);
					}
				} catch (error) {
					console.error("Error fetching profile:", error);
					showError("Failed to load profile data");
				}
			};

			fetchProfileData();
		}
	}, [user, showError]);

	const handleProfileChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handlePasswordChange = (e) => {
		const { name, value } = e.target;
		setPasswordData({
			...passwordData,
			[name]: value,
		});
	};

	const handleProfileSubmit = async (e) => {
		e.preventDefault();
		setIsSaving(true);

		try {
			// Update profile information
			const response = await UserService.updateMe({
				fullName: formData.fullName,
				username: formData.username,
			});

			// Check if the server response has user data and update accordingly
			if (response.data && response.data.user) {
				// Update user in AuthContext so it's reflected throughout the app
				updateUser({
					fullName: response.data.user.fullName,
					username: response.data.user.username,
				});
			}

			showSuccess("Profile successfully updated");
		} catch (err) {
			console.error("Profile update error:", err);
			showError(err.response?.data?.message || "Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		setIsSaving(true);

		// Validation
		if (
			!passwordData.currentPassword ||
			!passwordData.newPassword ||
			!passwordData.confirmPassword
		) {
			showError("Please fill in all password fields");
			setIsSaving(false);
			return;
		}

		if (passwordData.newPassword.length < 8) {
			showError("New password must be at least 8 characters long");
			setIsSaving(false);
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			showError("New passwords do not match");
			setIsSaving(false);
			return;
		}

		try {
			await UserService.changePassword(
				passwordData.currentPassword,
				passwordData.newPassword,
				passwordData.confirmPassword
			);

			showSuccess("Password successfully updated");

			// Clear password fields
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (err) {
			console.error("Password update error:", err);
			showError(err.message || "Failed to update password");
		} finally {
			setIsSaving(false);
		}
	};

	const handleProfilePictureChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Preview image
		const reader = new FileReader();
		reader.onloadend = () => {
			setProfilePreview(reader.result);
		};
		reader.readAsDataURL(file);
		setProfileFile(file);
	};

	const uploadProfilePicture = async () => {
		if (!profileFile) return;

		setIsSaving(true);

		try {
			const formData = new FormData();
			formData.append("profilePicture", profileFile);

			const response = await UserService.updateProfilePicture(formData);

			// Update profile picture in AuthContext
			if (response.data && response.data.user) {
				updateUser({ profilePicture: response.data.user.profilePicture });
			}

			showSuccess("Profile picture updated successfully");
		} catch (err) {
			console.error("Profile picture update error:", err);
			showError("Failed to upload profile picture");
		} finally {
			setIsSaving(false);
		}
	};

	const deleteProfilePicture = async () => {
		if (
			!window.confirm("Are you sure you want to remove your profile picture?")
		) {
			return;
		}

		setIsSaving(true);

		try {
			const response = await UserService.deleteProfilePicture();

			// Update profile picture in AuthContext to null
			if (response.data && response.data.user) {
				updateUser({ profilePicture: null });
			}

			setProfilePreview(null);
			setProfileFile(null);
			showSuccess("Profile picture removed successfully");
		} catch (err) {
			console.error("Profile picture deletion error:", err);
			showError("Failed to remove profile picture");
		} finally {
			setIsSaving(false);
		}
	};

	// Loading state
	if (loading || !user || !profileData) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<div className="text-center">
					<Sparkles className="mx-auto h-12 w-12 animate-pulse text-purple-500" />
					<p className="mt-4 text-gray-400">Loading settings...</p>
				</div>
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
									handleProfileSubmit({ preventDefault: () => {} });
								} else if (activeTab === "password") {
									handlePasswordSubmit({ preventDefault: () => {} });
								} else if (activeTab === "account") {
									uploadProfilePicture();
								}
							}}
							disabled={isSaving}
							className="flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
						>
							{isSaving ? "Saving..." : "Save Changes"}
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
						<form onSubmit={handleProfileSubmit} className="space-y-6">
							<div className="space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
								<h2 className="text-xl font-semibold text-white">
									Basic Information
								</h2>
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<label
											htmlFor="fullName"
											className="text-sm font-medium text-gray-300"
										>
											Full Name
										</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
												<User className="h-5 w-5" />
											</span>
											<input
												type="text"
												id="fullName"
												name="fullName"
												value={formData.fullName}
												onChange={handleProfileChange}
												className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
												placeholder="Your full name"
											/>
										</div>
									</div>
									<div className="space-y-2">
										<label
											htmlFor="username"
											className="text-sm font-medium text-gray-300"
										>
											Username
										</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
												<span className="text-gray-500">@</span>
											</span>
											<input
												type="text"
												id="username"
												name="username"
												value={formData.username}
												onChange={handleProfileChange}
												className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
												placeholder="username"
											/>
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="email"
										className="text-sm font-medium text-gray-300"
									>
										Email Address
									</label>
									<div className="relative">
										<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
											<Mail className="h-5 w-5" />
										</span>
										<input
											type="email"
											id="email"
											name="email"
											value={formData.email}
											onChange={handleProfileChange}
											disabled
											className="w-full cursor-not-allowed rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-gray-400 focus:outline-none"
										/>
									</div>
									<p className="text-xs text-gray-500">
										Email address cannot be changed
									</p>
								</div>
							</div>

							<div className="space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
								<h2 className="text-xl font-semibold text-white">
									Profile Details
								</h2>
								<div className="space-y-2">
									<label
										htmlFor="bio"
										className="text-sm font-medium text-gray-300"
									>
										Bio
									</label>
									<textarea
										id="bio"
										name="bio"
										value={formData.bio}
										onChange={handleProfileChange}
										rows="3"
										className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
										placeholder="Write a short bio about yourself..."
									/>
								</div>
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<label
											htmlFor="location"
											className="text-sm font-medium text-gray-300"
										>
											Location
										</label>
										<input
											type="text"
											id="location"
											name="location"
											value={formData.location}
											onChange={handleProfileChange}
											className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
											placeholder="City, Country"
										/>
									</div>
									<div className="space-y-2">
										<label
											htmlFor="website"
											className="text-sm font-medium text-gray-300"
										>
											Website
										</label>
										<input
											type="text"
											id="website"
											name="website"
											value={formData.website}
											onChange={handleProfileChange}
											className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
											placeholder="https://yourwebsite.com"
										/>
									</div>
								</div>
							</div>

							<button
								type="submit"
								disabled={isSaving}
								className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-center font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-60"
							>
								{isSaving ? (
									"Saving..."
								) : (
									<>
										<Save className="h-5 w-5" />
										Save Profile Changes
									</>
								)}
							</button>
						</form>
					)}

					{/* Profile Picture Section */}
					{activeTab === "account" && (
						<div className="space-y-6">
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
									disabled={isSaving}
									className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-center font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-60"
								>
									{isSaving ? (
										"Uploading..."
									) : (
										<>
											<Save className="h-5 w-5" />
											Save New Profile Picture
										</>
									)}
								</button>
							)}
						</div>
					)}

					{/* Password Section */}
					{activeTab === "password" && (
						<form onSubmit={handlePasswordSubmit} className="space-y-6">
							<div className="space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
								<h2 className="text-xl font-semibold text-white">
									Change Password
								</h2>

								<div className="space-y-4">
									<div className="space-y-2">
										<label
											htmlFor="currentPassword"
											className="text-sm font-medium text-gray-300"
										>
											Current Password
										</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
												<Lock className="h-5 w-5" />
											</span>
											<input
												type={showPassword ? "text" : "password"}
												id="currentPassword"
												name="currentPassword"
												value={passwordData.currentPassword}
												onChange={handlePasswordChange}
												className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
												placeholder="Enter your current password"
											/>
											<button
												type="button"
												className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
												onClick={() => setShowPassword(!showPassword)}
											>
												<Eye className="h-5 w-5" />
											</button>
										</div>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="newPassword"
											className="text-sm font-medium text-gray-300"
										>
											New Password
										</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
												<Lock className="h-5 w-5" />
											</span>
											<input
												type={showPassword ? "text" : "password"}
												id="newPassword"
												name="newPassword"
												value={passwordData.newPassword}
												onChange={handlePasswordChange}
												className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
												placeholder="Enter new password"
											/>
										</div>
										<p className="text-xs text-gray-500">
											Password must be at least 8 characters long
										</p>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="confirmPassword"
											className="text-sm font-medium text-gray-300"
										>
											Confirm New Password
										</label>
										<div className="relative">
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
												<Lock className="h-5 w-5" />
											</span>
											<input
												type={showPassword ? "text" : "password"}
												id="confirmPassword"
												name="confirmPassword"
												value={passwordData.confirmPassword}
												onChange={handlePasswordChange}
												className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
												placeholder="Confirm new password"
											/>
										</div>
									</div>
								</div>
							</div>

							<button
								type="submit"
								disabled={isSaving}
								className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-center font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-60"
							>
								{isSaving ? (
									"Updating..."
								) : (
									<>
										<Save className="h-5 w-5" />
										Update Password
									</>
								)}
							</button>
						</form>
					)}
				</div>
			</main>
		</div>
	);
}
