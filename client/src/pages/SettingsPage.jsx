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
import UserService from "../services/user.service";

export default function SettingsPage() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const fileInputRef = useRef(null);

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
	const [formError, setFormError] = useState("");
	const [formSuccess, setFormSuccess] = useState("");
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
					setFormError("Failed to load profile data");
				}
			};

			fetchProfileData();
		}
	}, [user]);

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
		setFormError("");
		setFormSuccess("");
		setIsSaving(true);

		try {
			// Update profile information
			await UserService.updateProfileInfo({
				fullName: formData.fullName,
				username: formData.username,
				bio: formData.bio,
				location: formData.location,
				website: formData.website,
			});

			// Update user in local storage for immediate UI update
			UserService.updateUserInStorage({
				fullName: formData.fullName,
				username: formData.username,
				bio: formData.bio,
				location: formData.location,
				website: formData.website,
			});

			setFormSuccess("Profile successfully updated");
		} catch (err) {
			console.error("Profile update error:", err);
			setFormError(err.message || "Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		setFormError("");
		setFormSuccess("");
		setIsSaving(true);

		// Validation
		if (
			!passwordData.currentPassword ||
			!passwordData.newPassword ||
			!passwordData.confirmPassword
		) {
			setFormError("Please fill in all password fields");
			setIsSaving(false);
			return;
		}

		if (passwordData.newPassword.length < 8) {
			setFormError("New password must be at least 8 characters long");
			setIsSaving(false);
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setFormError("New passwords do not match");
			setIsSaving(false);
			return;
		}

		try {
			await UserService.changePassword(
				passwordData.currentPassword,
				passwordData.newPassword,
				passwordData.confirmPassword
			);

			setFormSuccess("Password successfully updated");

			// Clear password fields
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (err) {
			console.error("Password update error:", err);
			setFormError(err.message || "Failed to update password");
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
		setFormError("");
		setFormSuccess("");

		try {
			const formData = new FormData();
			formData.append("profilePicture", profileFile);

			await UserService.updateProfilePicture(formData);
			setFormSuccess("Profile picture updated successfully");
		} catch (err) {
			console.error("Profile picture update error:", err);
			setFormError("Failed to upload profile picture");
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
		setFormError("");
		setFormSuccess("");

		try {
			await UserService.deleteProfilePicture();
			setProfilePreview(null);
			setProfileFile(null);
			setFormSuccess("Profile picture removed successfully");
		} catch (err) {
			console.error("Profile picture deletion error:", err);
			setFormError("Failed to remove profile picture");
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

					{/* Success/Error Messages */}
					{formError && (
						<div className="mb-6 rounded-lg border border-red-900 bg-red-900/20 p-4">
							<p className="text-red-400">{formError}</p>
						</div>
					)}

					{formSuccess && (
						<div className="mb-6 rounded-lg border border-green-900 bg-green-900/20 p-4">
							<p className="text-green-400">{formSuccess}</p>
						</div>
					)}

					{/* Profile Settings Section */}
					{activeTab === "profile" && (
						<div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
							<h2 className="mb-6 text-xl font-bold text-white">
								Edit Profile
							</h2>
							<form onSubmit={handleProfileSubmit} className="space-y-6">
								<div className="space-y-2">
									<label
										htmlFor="fullName"
										className="block text-sm font-medium text-gray-300"
									>
										Full Name
									</label>
									<div className="relative">
										<input
											id="fullName"
											name="fullName"
											type="text"
											value={formData.fullName}
											onChange={handleProfileChange}
											className="w-full rounded-md border border-gray-800 bg-gray-800 pl-10 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
										/>
										<User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
									</div>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="username"
										className="block text-sm font-medium text-gray-300"
									>
										Username
									</label>
									<div className="relative">
										<span className="absolute left-3 top-2.5 text-gray-500">
											@
										</span>
										<input
											id="username"
											name="username"
											type="text"
											value={formData.username}
											onChange={handleProfileChange}
											className="w-full rounded-md border border-gray-800 bg-gray-800 pl-10 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-300"
									>
										Email
									</label>
									<div className="relative">
										<input
											id="email"
											name="email"
											type="email"
											value={formData.email}
											disabled
											className="w-full rounded-md border border-gray-800 bg-gray-900 pl-10 py-2 text-white opacity-60 cursor-not-allowed"
										/>
										<Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
									</div>
									<p className="text-xs text-gray-500">
										Email cannot be changed directly. Contact support if needed.
									</p>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="bio"
										className="block text-sm font-medium text-gray-300"
									>
										Bio
									</label>
									<textarea
										id="bio"
										name="bio"
										rows={4}
										value={formData.bio}
										onChange={handleProfileChange}
										placeholder="Tell others a bit about yourself"
										className="w-full rounded-md border border-gray-800 bg-gray-800 p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
									/>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="location"
										className="block text-sm font-medium text-gray-300"
									>
										Location
									</label>
									<input
										id="location"
										name="location"
										type="text"
										value={formData.location}
										onChange={handleProfileChange}
										placeholder="New York, USA"
										className="w-full rounded-md border border-gray-800 bg-gray-800 p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
									/>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="website"
										className="block text-sm font-medium text-gray-300"
									>
										Website
									</label>
									<input
										id="website"
										name="website"
										type="url"
										value={formData.website}
										onChange={handleProfileChange}
										placeholder="https://example.com"
										className="w-full rounded-md border border-gray-800 bg-gray-800 p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
									/>
								</div>

								<button
									type="submit"
									disabled={isSaving}
									className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70"
								>
									<Save className="h-4 w-4" />
									{isSaving ? "Saving..." : "Save Profile"}
								</button>
							</form>
						</div>
					)}

					{/* Account/Profile Picture Section */}
					{activeTab === "account" && (
						<div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
							<h2 className="mb-6 text-xl font-bold text-white">
								Profile Picture
							</h2>

							<div className="flex flex-col items-center">
								<div className="mb-8 h-40 w-40 overflow-hidden rounded-full border-4 border-gray-700 bg-gray-800">
									{profilePreview ? (
										<img
											src={profilePreview}
											alt="Profile"
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900 to-gray-800">
											<span className="text-6xl font-bold uppercase text-gray-300">
												{user.fullName ? user.fullName.charAt(0) : "U"}
											</span>
										</div>
									)}
								</div>

								<div className="flex w-full max-w-xs flex-col gap-4">
									<input
										type="file"
										accept="image/*"
										ref={fileInputRef}
										onChange={handleProfilePictureChange}
										className="hidden"
									/>

									<button
										type="button"
										onClick={() => fileInputRef.current.click()}
										className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2 px-4 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700"
									>
										<Upload className="h-4 w-4" />
										Choose New Photo
									</button>

									{profilePreview && (
										<button
											type="button"
											onClick={deleteProfilePicture}
											className="flex items-center justify-center gap-2 rounded-md border border-red-800 bg-red-900/20 py-2 px-4 text-sm font-medium text-red-400 hover:bg-red-900/30"
										>
											Remove Photo
										</button>
									)}
								</div>

								{profileFile && (
									<div className="mt-6 text-center">
										<p className="mb-2 text-sm text-purple-400">
											New photo selected
										</p>
										<button
											onClick={uploadProfilePicture}
											disabled={isSaving}
											className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
										>
											{isSaving ? "Uploading..." : "Upload Photo"}
										</button>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Password Section */}
					{activeTab === "password" && (
						<div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
							<h2 className="mb-6 text-xl font-bold text-white">
								Change Password
							</h2>
							<form onSubmit={handlePasswordSubmit} className="space-y-6">
								<div className="space-y-2">
									<label
										htmlFor="currentPassword"
										className="block text-sm font-medium text-gray-300"
									>
										Current Password
									</label>
									<div className="relative">
										<input
											id="currentPassword"
											name="currentPassword"
											type={showPassword ? "text" : "password"}
											value={passwordData.currentPassword}
											onChange={handlePasswordChange}
											className="w-full rounded-md border border-gray-800 bg-gray-800 pl-10 pr-10 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
										/>
										<Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
									</div>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="newPassword"
										className="block text-sm font-medium text-gray-300"
									>
										New Password
									</label>
									<div className="relative">
										<input
											id="newPassword"
											name="newPassword"
											type={showPassword ? "text" : "password"}
											value={passwordData.newPassword}
											onChange={handlePasswordChange}
											className="w-full rounded-md border border-gray-800 bg-gray-800 pl-10 pr-10 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
										/>
										<Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
									</div>
									<p className="text-xs text-gray-500">
										Password must be at least 8 characters long
									</p>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-medium text-gray-300"
									>
										Confirm New Password
									</label>
									<div className="relative">
										<input
											id="confirmPassword"
											name="confirmPassword"
											type={showPassword ? "text" : "password"}
											value={passwordData.confirmPassword}
											onChange={handlePasswordChange}
											className="w-full rounded-md border border-gray-800 bg-gray-800 pl-10 pr-10 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
										/>
										<Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
										>
											<Eye className="h-5 w-5" />
											<span className="sr-only">
												{showPassword ? "Hide" : "Show"} password
											</span>
										</button>
									</div>
								</div>

								<button
									type="submit"
									disabled={isSaving}
									className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70"
								>
									<Save className="h-4 w-4" />
									{isSaving ? "Updating..." : "Update Password"}
								</button>
							</form>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
