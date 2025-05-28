import { ArrowLeft, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfileHeader({ profileUsername }) {
	return (
		<header className="sticky top-0 z-10 border-b bg-gray-950/80 backdrop-blur-md">
			<div className="container flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-3">
					<Link to="/" className="rounded-full p-2 hover:bg-gray-800">
						<ArrowLeft className="h-5 w-5 text-white" />
						<span className="sr-only">Back</span>
					</Link>
					<h1 className="text-lg font-semibold text-white">
						{profileUsername ? `@${profileUsername}` : "Profile"}
					</h1>
				</div>
				<div className="flex items-center gap-2">
					<Link to="/settings" className="rounded-full p-2 hover:bg-gray-800">
						<Settings className="h-5 w-5 text-white" />
						<span className="sr-only">Settings</span>
					</Link>
				</div>
			</div>
		</header>
	);
}
