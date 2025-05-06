export default function ProfileAvatar({
	user = {},
	size = "md",
	className = "",
}) {
	// Define size classes
	const sizeClasses = {
		xs: "h-8 w-8",
		sm: "h-10 w-10",
		md: "h-12 w-12",
		lg: "h-16 w-16",
		xl: "h-24 w-24",
		"2xl": "h-32 w-32",
		"3xl": "h-40 w-40",
	};

	// Define text size classes for fallback initials
	const textSizeClasses = {
		xs: "text-xs",
		sm: "text-sm",
		md: "text-md",
		lg: "text-xl",
		xl: "text-3xl",
		"2xl": "text-4xl",
		"3xl": "text-5xl",
	};

	// Get user's initials for fallback
	const getInitials = () => {
		if (user.fullName) {
			return user.fullName.charAt(0).toUpperCase();
		}
		if (user.username) {
			return user.username.charAt(0).toUpperCase();
		}
		return "U";
	};

	return (
		<div
			className={`overflow-hidden rounded-full ${sizeClasses[size]} ${className}`}
		>
			{user.profilePicture ? (
				<img
					src={user.profilePicture}
					alt={user.fullName || "User"}
					className="h-full w-full object-cover"
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-700 to-blue-700">
					<span className={`font-bold text-white ${textSizeClasses[size]}`}>
						{getInitials()}
					</span>
				</div>
			)}
		</div>
	);
}
