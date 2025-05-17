// client/src/pages/RoomsPage.jsx
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import CreateRoomForm from "../components/rooms/CreateRoomForm";
import RoomDetail from "../components/rooms/RoomDetail";
import RoomList from "../components/rooms/RoomList";
import { useAuth } from "../context/AuthContext";

export default function RoomsPage() {
	const { user, loading } = useAuth();
	const location = useLocation();

	useEffect(() => {
		// Scroll to top on route change
		window.scrollTo(0, 0);
	}, [location.pathname]);

	// Loading state
	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<div className="text-center">
					<Sparkles className="mx-auto h-12 w-12 animate-pulse text-purple-500" />
					<p className="mt-4 text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 min-h-screen">
			<main className="flex-1">
				<div className="container px-4 py-6 max-w-6xl mx-auto">
					<Routes>
						<Route path="/" element={<RoomList />} />
						<Route path="/create" element={<CreateRoomForm />} />
						<Route path="/:roomId" element={<RoomDetail />} />
						{/* Redirect join URLs directly to room detail */}
						<Route path="/:roomId/join" element={<Navigate to=".." relative="path" replace />} />
					</Routes>
				</div>
			</main>
		</div>
	);
}
