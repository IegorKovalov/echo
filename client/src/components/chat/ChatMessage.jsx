import { useTimeFormatting } from "../../hooks/useTimeFormatting";
import { getAnonymousColor } from "../../utils/anonymousUtils";

export default function ChatMessage({ message }) {
	const { formatMessageTime } = useTimeFormatting();

	return (
		<div
			className={`flex ${
				message.isOwn ? "justify-end" : "justify-start"
			}`}
		>
			<div
				className={`max-w-lg ${
					message.isOwn
						? "bg-purple-600 text-white"
						: "bg-gray-800 text-gray-100"
				} rounded-2xl px-4 py-3 shadow-md`}
			>
				{!message.isOwn && (
					<div className="flex items-center gap-2 mb-2">
						<span
							className={`px-2 py-1 rounded-full text-xs font-medium ${getAnonymousColor(
								message.anonymousId
							)}`}
						>
							{message.anonymousId}
						</span>
					</div>
				)}
				<p className="text-sm leading-relaxed whitespace-pre-wrap">
					{message.content}
				</p>
				<div
					className={`text-xs mt-2 ${
						message.isOwn ? "text-purple-200" : "text-gray-400"
					}`}
				>
					{formatMessageTime(message.timestamp)}
				</div>
			</div>
		</div>
	);
} 