import { MessageSquare, PlusCircle, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function MessageSidebar() {
	return (
		<div className="col-span-1">
			<div className="sticky top-20 rounded-xl border border-gray-800/50 bg-gray-900/40 backdrop-blur-sm p-5 shadow-xl">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-medium text-white flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-purple-400" />
						Messages{" "}
						<span className="text-xs text-gray-500">(Coming Soon)</span>
					</h3>
					<button className="rounded-full p-1 hover:bg-gray-800/70 text-purple-400 transition-colors duration-200">
						<PlusCircle className="h-5 w-5" />
					</button>
				</div>

				<div className="relative">
					<input
						type="text"
						placeholder="Search messages"
						className="w-full rounded-lg border border-gray-800/80 bg-gray-900/50 pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
						disabled
					/>
					<Search className="absolute left-3 top-2 h-4 w-4 text-gray-500" />
				</div>

				<div className="mt-4 space-y-2 opacity-70">
					{/* Placeholder message items */}
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 cursor-not-allowed transition-colors duration-200"
						>
							<div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-700/50 to-blue-700/50 shadow-md" />
							<div className="flex-1 min-w-0">
								<p className="font-medium text-white truncate">User {i}</p>
								<p className="text-xs text-gray-400 truncate">
									Coming soon in future update...
								</p>
							</div>
							<div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></div>
						</div>
					))}
				</div>

				<div className="mt-6 text-center">
					<p className="text-xs text-gray-500">
						Messaging functionality will be available in an upcoming update.
					</p>
					<Link
						to="/profile"
						className="mt-4 inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200"
					>
						<Users className="h-4 w-4" />
						View your profile
					</Link>
				</div>
			</div>
		</div>
	);
}
