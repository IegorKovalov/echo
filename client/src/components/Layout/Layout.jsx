import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PostProvider } from "../../context/PostContext";
import Header from "./Header";

export default function Layout({
	children,
	requireAuth = true,
	showHeader = true,
}) {
	const { user, loading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!loading && requireAuth && !user) {
			navigate("/login");
		}
	}, [user, loading, navigate, requireAuth]);

	// Show loading spinner while authenticating
	if (loading && requireAuth) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<div className="text-center">
					<Sparkles className="mx-auto h-12 w-12 animate-pulse text-purple-500" />
					<p className="mt-4 text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	// Wrap children in PostProvider only for authenticated routes
	const content =
		requireAuth && user ? <PostProvider>{children}</PostProvider> : children;

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-950">
			{showHeader && <Header />}
			<main className="flex-1">{content}</main>
		</div>
	);
}
