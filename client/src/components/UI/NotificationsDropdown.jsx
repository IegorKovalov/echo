import {
	Bell,
	Clock,
	Heart,
	MessageCircle,
	Star,
	User,
	Users,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Card from "./Card";

export default function NotificationsDropdown({ isOpen, onClose, anchorRect }) {
	const dropdownRef = useRef(null);

	// Close the dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				onClose();
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	// Position the notifications dropdown relative to the navbar button
	const style = anchorRect
		? {
				position: "fixed",
				top: `${anchorRect.bottom + 12}px`,
				left: anchorRect.left - 280 + anchorRect.width / 2,
				zIndex: 100,
				width: "320px",
		  }
		: {};

	const mockNotifications = [
		{
			id: 1,
			type: "like",
			user: "Alex Johnson",
			content: 'liked your post: "Just released a new...',
			time: "2 minutes ago",
			read: false,
			icon: <Heart className="h-4 w-4 text-red-400" />,
		},
		{
			id: 2,
			type: "comment",
			user: "Morgan Smith",
			content: "commented on your post",
			time: "1 hour ago",
			read: false,
			icon: <MessageCircle className="h-4 w-4 text-blue-400" />,
		},
		{
			id: 3,
			type: "follow",
			user: "Taylor Swift",
			content: "started following you",
			time: "3 hours ago",
			read: true,
			icon: <User className="h-4 w-4 text-purple-400" />,
		},
		{
			id: 4,
			type: "mention",
			user: "Jordan Lee",
			content: "mentioned you in a comment",
			time: "Yesterday",
			read: true,
			icon: <Star className="h-4 w-4 text-yellow-400" />,
		},
	];

	return (
		<>
			<div
				className="fixed inset-0 z-40 bg-transparent"
				onClick={onClose}
			></div>
			<div
				ref={dropdownRef}
				className="rounded-xl border border-gray-800/50 bg-gray-900/90 backdrop-blur-sm shadow-xl transform transition-all duration-200 ease-out z-50 overflow-hidden"
				style={{
					...style,
					boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
				}}
			>
				{/* Small decorative arrow pointing up to navbar */}
				<div
					className="absolute w-4 h-4 bg-gray-900/90 backdrop-blur-sm border-t border-l border-gray-800/50 transform rotate-45 -translate-y-2"
					style={{
						top: "0",
						right: "24px",
					}}
				></div>

				<div className="max-h-96 overflow-y-auto">
					{/* Header */}
					<div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 p-3.5 flex justify-between items-center">
						<h3 className="font-medium text-white flex items-center gap-2">
							<Bell className="h-4 w-4 text-purple-400" />
							Notifications
						</h3>
						<button className="text-xs text-purple-400 hover:text-purple-300 transition-colors duration-200">
							Mark all as read
						</button>
					</div>

					{/* Notifications List */}
					{mockNotifications.length > 0 ? (
						<div>
							{mockNotifications.map((notification) => (
								<div
									key={notification.id}
									className={`p-3.5 border-b border-gray-800/30 hover:bg-gray-800/50 transition-colors duration-200 flex gap-3 items-start ${
										!notification.read ? "bg-gray-800/20" : ""
									}`}
								>
									<div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-700/30 to-blue-700/30 flex items-center justify-center flex-shrink-0 shadow-sm">
										{notification.icon}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm text-gray-300">
											<span className="font-medium text-white">
												{notification.user}
											</span>{" "}
											{notification.content}
										</p>
										<p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
											<Clock className="h-3 w-3" />
											{notification.time}
										</p>
									</div>
									{!notification.read && (
										<div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1 shadow-sm shadow-purple-500/50"></div>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="py-12 text-center">
							<div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-4 flex items-center justify-center">
								<Bell className="h-6 w-6 text-gray-500" />
							</div>
							<h3 className="text-base font-medium text-white">
								No notifications
							</h3>
							<p className="mt-2 text-sm text-gray-400">
								You're all caught up!
							</p>
						</div>
					)}

					{/* Footer */}
					<div className="p-3.5 text-center border-t border-gray-800/50 bg-gray-900/70">
						<Link
							to="#"
							className="text-xs text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium"
						>
							View all notifications
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}
