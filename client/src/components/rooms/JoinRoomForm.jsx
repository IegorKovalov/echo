import { ArrowLeft, Key, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../../context/RoomContext";
import { useToast } from "../../context/ToastContext";
import Card from "../UI/Card";

export default function JoinRoomForm() {
	const { roomId } = useParams();
	const { joinRoom, currentRoom } = useRoom();
	const { showError } = useToast();
	const navigate = useNavigate();

	const [accessCode, setAccessCode] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!accessCode.trim()) {
			showError("Please enter the access code");
			return;
		}

		try {
			setIsSubmitting(true);
			const success = await joinRoom(roomId, accessCode.trim());

			if (success) {
				navigate(`/rooms/${roomId}`);
			}
		} catch (error) {
			console.error("Error joining room:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-md mx-auto">
			<div className="mb-6 flex items-center gap-2">
				<Link to="/rooms" className="text-purple-400 hover:text-purple-300">
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<h1 className="text-2xl font-bold text-white">Join Private Room</h1>
			</div>

			<Card>
				<div className="mb-6 text-center">
					<div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
						<Lock className="h-8 w-8 text-yellow-500" />
					</div>
					<h2 className="mt-4 text-xl font-semibold text-white">
						{currentRoom?.name || "Private Room"}
					</h2>
					<p className="mt-2 text-gray-400">
						This is a private room. Please enter the access code to join.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="accessCode"
							className="block text-sm font-medium text-gray-300 mb-1"
						>
							Access Code
						</label>
						<div className="relative">
							<Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
							<input
								id="accessCode"
								type="text"
								value={accessCode}
								onChange={(e) => setAccessCode(e.target.value)}
								placeholder="Enter access code"
								className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-10 p-2.5 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 uppercase"
								maxLength={6}
							/>
						</div>
						<p className="mt-1 text-xs text-gray-500">
							The access code was given to you by the room creator.
						</p>
					</div>

					<div className="flex justify-end">
						<Link
							to="/rooms"
							className="mr-2 rounded-lg border border-gray-700 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
						>
							Cancel
						</Link>
						<button
							type="submit"
							disabled={isSubmitting || !accessCode.trim()}
							className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
						>
							{isSubmitting ? "Joining..." : "Join Room"}
						</button>
					</div>
				</form>
			</Card>
		</div>
	);
}
