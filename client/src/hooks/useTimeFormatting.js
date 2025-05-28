import { useMemo } from "react";

export const useTimeFormatting = () => {
	const formatters = useMemo(() => ({
		timeUntilReset: (nextResetAt) => {
			if (!nextResetAt) return "";

			const now = new Date();
			const resetTime = new Date(nextResetAt);
			const diff = resetTime - now;

			if (diff <= 0) return "Resetting now";

			const hours = Math.floor(diff / (1000 * 60 * 60));
			const days = Math.floor(hours / 24);

			if (days > 0) {
				return `${days}d ${hours % 24}h`;
			}
			return `${hours}h`;
		},

		timeUntilExpiry: (expiresAt) => {
			if (!expiresAt) return null;

			const now = new Date();
			const expiryTime = new Date(expiresAt);
			const diff = expiryTime - now;

			if (diff <= 0) return "Expired";

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			return `${days} days left`;
		},

		formatMessageTime: (timestamp) => {
			if (!timestamp) return "";

			const now = new Date();
			const diff = now - timestamp;
			const minutes = Math.floor(diff / (1000 * 60));
			const hours = Math.floor(minutes / 60);

			if (hours > 0) return `${hours}h ago`;
			if (minutes > 0) return `${minutes}m ago`;
			return "Just now";
		},

		formatTime: (date) => {
			if (!date) return "";

			const now = new Date();
			const diff = now - date;
			const minutes = Math.floor(diff / (1000 * 60));
			const hours = Math.floor(minutes / 60);
			const days = Math.floor(hours / 24);

			if (days > 0) return `${days}d ago`;
			if (hours > 0) return `${hours}h ago`;
			if (minutes > 0) return `${minutes}m ago`;
			return "Just now";
		},
	}), []);

	return formatters;
}; 