import { Send, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";

export default function ChatInput({ onSendMessage, disabled = false }) {
	const [message, setMessage] = useState("");
	const [isSending, setIsSending] = useState(false);
	const textareaRef = useRef(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message.trim() || isSending || disabled) return;

		setIsSending(true);
		try {
			await onSendMessage(message.trim());
			setMessage("");
			// Reset textarea height
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setIsSending(false);
		}
	};

	const handleTextareaChange = (e) => {
		setMessage(e.target.value);
		
		// Auto-resize textarea
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-md">
			<div className="container max-w-4xl mx-auto px-4 py-4">
				<form onSubmit={handleSubmit} className="flex gap-3">
					<div className="flex-1">
						<textarea
							ref={textareaRef}
							value={message}
							onChange={handleTextareaChange}
							onKeyDown={handleKeyDown}
							placeholder="Share your thoughts anonymously..."
							rows={1}
							className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none max-h-32 min-h-[48px]"
							disabled={isSending || disabled}
						/>
					</div>
					<button
						type="submit"
						disabled={!message.trim() || isSending || disabled}
						className="self-end p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
					>
						{isSending ? (
							<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
						) : (
							<Send className="h-5 w-5" />
						)}
					</button>
				</form>

				<div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
					<AlertCircle className="h-3 w-3" />
					<span>
						Press Enter to send, Shift+Enter for new line. Be respectful and kind.
					</span>
				</div>
			</div>
		</div>
	);
} 