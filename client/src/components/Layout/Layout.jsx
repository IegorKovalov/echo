import { PostProvider } from "../../context/PostContext";
import { useAuth } from "../../context/AuthContext";
import Header from "./Header";

export default function Layout({
	children,
	showHeader = true,
}) {
	const { user } = useAuth();

	// Wrap children in PostProvider only for authenticated routes
	const content = user ? <PostProvider>{children}</PostProvider> : children;

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-950">
			{showHeader && <Header />}
			<main className="flex-1">{content}</main>
		</div>
	);
}
