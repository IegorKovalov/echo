import { useAuth } from "../../context/AuthContext";
// Remove this import as we no longer need it
// import { PostProvider } from "../../context/PostContext";
import Header from "./Header";

export default function Layout({ children, showHeader = true }) {
	const { user } = useAuth();
	// Simplified content assignment
	const content = children;

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-950">
			{showHeader && <Header />}
			<main className="flex-1 relative">{content}</main>
		</div>
	);
}
